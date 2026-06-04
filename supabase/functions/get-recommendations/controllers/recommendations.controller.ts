import { SwipeRepository } from "@shared/repositories/swipe.repository.ts"
import { TmdbDiscoverResult } from "@shared/models/tmdb.ts"
import { corsHeaders } from "@shared/utils/cors.ts"

const TARGET_GENRE_CANDIDATES = 20
const TARGET_PEOPLE_CANDIDATES = 12
const TARGET_TOTAL_CANDIDATES = 40

const PEOPLE_PHASE_BONUS = 0.3

const TODAY = new Date().toISOString().split('T')[0]
const MIN_VOTE_COUNT = 200
const MIN_RELEASE_DATE = '1980-01-01'

const QUALITY_PARAMS = [
    'sort_by=popularity.desc',
    'include_adult=false',
    `vote_count.gte=${MIN_VOTE_COUNT}`,
    `primary_release_date.gte=${MIN_RELEASE_DATE}`,
    `primary_release_date.lte=${TODAY}`,
].join('&')

export class RecommendationsController {
    private readonly swipeRepository: SwipeRepository
    private readonly tmdbKey: string
    private readonly tmdbUrl: string

    constructor(swipeRepository: SwipeRepository, tmdbKey: string, tmdbUrl: string) {
        this.swipeRepository = swipeRepository
        this.tmdbKey = tmdbKey
        this.tmdbUrl = tmdbUrl
    }

    async getRecommendations(userId: string): Promise<Response> {
        const genreProfile = await this.swipeRepository.getUserGenreWeights(userId)
        const peopleProfile = await this.swipeRepository.getUserPeopleWeights(userId)
        const swipedIds = await this.swipeRepository.getSwipedExternalFilmIds(userId)

        const genreWeightMap: Record<string, number> = {}
        for (const row of genreProfile) {
            genreWeightMap[row.attribute_value] = row.weight
        }

        const positiveGenres = genreProfile
            .filter(r => r.weight > 0)
            .sort((a, b) => b.weight - a.weight)

        const genreListRes = await this.tmdbFetch('/genre/movie/list')
        const genreListData = await genreListRes.json()

        const genreNameToId: Record<string, number> = {}
        const genreIdToName: Record<number, string> = {}
        for (const g of genreListData.genres ?? []) {
            genreNameToId[g.name] = g.id
            genreIdToName[g.id] = g.name
        }

        const candidates: TmdbDiscoverResult[] = []
        const candidateIds = new Set<number>()
        const fromPeoplePhase = new Set<number>()

        const recentLikes = await this.swipeRepository.getRecentLikedExternalFilmIds(userId, 3)

        if (recentLikes.length > 0) {
            const perMovieTarget = Math.max(1, Math.floor(TARGET_GENRE_CANDIDATES / recentLikes.length))
            for (const filmId of recentLikes) {
                await this.collectCandidates(
                    `/movie/${filmId}/similar`,
                    '',
                    perMovieTarget,
                    candidates,
                    candidateIds,
                    swipedIds,
                )
            }
        } else if (positiveGenres.length > 0) {
            const topGenreIds = positiveGenres.slice(0, 3).map(r => genreNameToId[r.attribute_value]).filter(Boolean)
            if (topGenreIds.length > 0) {
                const genreParam = `with_genres=${topGenreIds.join('|')}`
                await this.collectCandidates(
                    '/discover/movie',
                    `${QUALITY_PARAMS}&${genreParam}`,
                    TARGET_GENRE_CANDIDATES,
                    candidates,
                    candidateIds,
                    swipedIds,
                )
            }
        }

        const topPeopleIds = peopleProfile
            .slice(0, 3)
            .map(r => r.attribute_value)

        if (topPeopleIds.length > 0) {
            const peopleParam = `with_people=${topPeopleIds.join('|')}`
            const beforeCount = candidates.length
            await this.collectCandidates(
                '/discover/movie',
                `${QUALITY_PARAMS}&${peopleParam}`,
                TARGET_PEOPLE_CANDIDATES,
                candidates,
                candidateIds,
                swipedIds,
            )
            for (let i = beforeCount; i < candidates.length; i++) {
                fromPeoplePhase.add(candidates[i].id)
            }
        }

        await this.collectCandidates(
            '/discover/movie',
            QUALITY_PARAMS,
            TARGET_TOTAL_CANDIDATES,
            candidates,
            candidateIds,
            swipedIds,
        )

        const scored = candidates
            .map(film => {
                const genreScore = film.genre_ids.reduce((sum, gid) => {
                    const name = genreIdToName[gid]
                    return sum + (name && genreWeightMap[name] ? genreWeightMap[name] : 0)
                }, 0)

                const peopleBonus = fromPeoplePhase.has(film.id) ? PEOPLE_PHASE_BONUS : 0

                return { ...film, score: genreScore + peopleBonus }
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)

        return Response.json({ results: scored }, { headers: corsHeaders })
    }

    private async collectCandidates(
        endpoint: string,
        queryParams: string,
        targetCount: number,
        candidates: TmdbDiscoverResult[],
        candidateIds: Set<number>,
        swipedIds: Set<number>,
        maxPages = 5,
    ): Promise<void> {
        let page = 1

        while (candidates.length < targetCount && page <= maxPages) {
            const fullPath = queryParams ? `${endpoint}?${queryParams}&page=${page}` : `${endpoint}?page=${page}`
            const res = await this.tmdbFetch(fullPath)

            if (!res.ok) {
                if (page === 1 && candidates.length === 0) {
                    console.warn(`TMDB fetch failed for ${fullPath}: ${res.statusText}`)
                }
                break
            }

            const data = await res.json()
            const results: TmdbDiscoverResult[] = data.results ?? []

            if (results.length === 0) break

            for (const film of results) {
                if ((film.vote_count ?? 0) < MIN_VOTE_COUNT) continue
                if (!film.release_date || film.release_date < MIN_RELEASE_DATE || film.release_date > TODAY) continue

                if (!swipedIds.has(film.id) && !candidateIds.has(film.id)) {
                    candidateIds.add(film.id)
                    candidates.push(film)
                }
            }

            page++
        }
    }

    private tmdbFetch(path: string): Promise<Response> {
        const url = path.startsWith('http') ? path : `${this.tmdbUrl}${path}`
        return fetch(url, {
            headers: { Authorization: `Bearer ${this.tmdbKey}` },
        })
    }
}