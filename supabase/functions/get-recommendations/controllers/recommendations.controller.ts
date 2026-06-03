import { SwipeRepository } from "@shared/repositories/swipe.repository.ts"
import { TmdbDiscoverResult } from "@shared/models/tmdb.ts"
import { corsHeaders } from "@shared/utils/cors.ts";

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export class RecommendationsController {
    private readonly swipeRepository: SwipeRepository;
    private readonly tmdbKey: string;

    constructor(swipeRepository: SwipeRepository, tmdbKey: string) {
        this.swipeRepository = swipeRepository;
        this.tmdbKey = tmdbKey;
    }

    async getRecommendations(userId: string): Promise<Response> {
        const profile = await this.swipeRepository.getUserGenreWeights(userId)

        const swipedExternalIds = await this.swipeRepository.getSwipedExternalFilmIds(userId)

        const genreWeightMap: Record<string, number> = {}
        for (const row of profile) {
            genreWeightMap[row.attribute_value] = row.weight
        }

        const positiveGenres = profile
            .filter((r) => r.weight > 0)
            .sort((a, b) => b.weight - a.weight)

        const genreListRes = await fetch(
            `${TMDB_BASE_URL}/genre/movie/list`,
            { headers: { Authorization: `Bearer ${this.tmdbKey}` } }
        )

        if (!genreListRes.ok) {
            throw new Error(`Failed to fetch genres from TMDB: ${genreListRes.statusText}`);
        }

        const genreListData = await genreListRes.json()
        const genreNameToId: Record<string, number> = {}

        for (const g of genreListData.genres ?? []) {
            genreNameToId[g.name] = g.id
        }

        const topGenreIds = positiveGenres
            .slice(0, 3)
            .map((r) => genreNameToId[r.attribute_value])
            .filter(Boolean)

        const genreParam = topGenreIds.length > 0 ? `&with_genres=${topGenreIds.join(',')}` : ''
        const tmdbRes = await fetch(
            `${TMDB_BASE_URL}/discover/movie?sort_by=popularity.desc&include_adult=false&page=1${genreParam}`,
            { headers: { Authorization: `Bearer ${this.tmdbKey}` } }
        )

        if (!tmdbRes.ok) {
            throw new Error(`Failed to fetch movies from TMDB: ${tmdbRes.statusText}`);
        }

        const tmdbData = await tmdbRes.json()
        const candidates: TmdbDiscoverResult[] = tmdbData.results ?? []

        const genreIdToName: Record<number, string> = {}
        for (const g of genreListData.genres ?? []) {
            genreIdToName[g.id] = g.name
        }

        const scored = candidates
            .filter((film) => !swipedExternalIds.has(film.id))
            .map((film) => {
                const score = film.genre_ids.reduce((sum, gid) => {
                    const name = genreIdToName[gid]
                    return sum + (name && genreWeightMap[name] ? genreWeightMap[name] : 0)
                }, 0)
                return { ...film, score }
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)

        return Response.json({ results: scored }, {
            headers: corsHeaders
        })
    }
}
