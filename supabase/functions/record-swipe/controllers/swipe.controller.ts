import { z } from "zod"
import { TmdbCreditsResponse } from "@shared/models/tmdb.ts"
import { SwipeRepository } from "@shared/repositories/swipe.repository.ts"
import { parseBody, successResponse, validatePayload } from '@shared/utils/http-helper.ts'

const recordSwipeSchema = z.object({
    external_film_id: z.number(),
    title: z.string(),
    poster_path: z.string().nullable().optional(),
    vote_average: z.number().nullable().optional(),
    vote_count: z.number().nullable().optional(),
    release_date: z.string().nullable().optional(),
    direction: z.enum(['like', 'dislike']),
    genre_names: z.array(z.string()),
    genre_ids: z.array(z.number()).optional(),
    signal_strength: z.number().nullable().optional(),
    watch_providers: z.any().nullable().optional(),
})

const DELTAS = {
    like: {
        genre: 0.15,
        actor: 0.10,
        director: 0.20,
    },
    dislike: {
        genre: -0.10,
        actor: -0.05,
        director: -0.10,
    },
}

const TOP_CAST_COUNT = 3

export class SwipeController {
    private readonly swipeRepository: SwipeRepository
    private readonly tmdbKey: string
    private readonly tmdbUrl: string

    constructor(swipeRepository: SwipeRepository, tmdbKey: string, tmdbUrl: string) {
        this.swipeRepository = swipeRepository
        this.tmdbKey = tmdbKey
        this.tmdbUrl = tmdbUrl
    }

    async recordSwipe(req: Request, userId: string): Promise<Response> {
        const body = await parseBody(req)
        const payload = validatePayload(recordSwipeSchema, body)

        const credits = await this.fetchCredits(payload.external_film_id)
        const director = credits.crew.find(p => p.job === 'Director') ?? null
        const topCast = credits.cast.slice(0, TOP_CAST_COUNT)

        const filmId = await this.swipeRepository.upsertFilm({
            external_film_id: payload.external_film_id,
            title: payload.title,
            poster_path: payload.poster_path ?? '',
            vote_average: payload.vote_average ?? 0,
            vote_count: payload.vote_count ?? 0,
            release_date: payload.release_date ?? '',
            genre_ids: payload.genre_ids ?? [],
            cast_ids: topCast.map(a => a.id),
            cast_names: topCast.map(a => a.name),
            director_id: director?.id ?? null,
            director_name: director?.name ?? null,
            watch_providers: payload.watch_providers ?? null,
        })

        await this.swipeRepository.recordSwipe(
            userId,
            filmId,
            payload.direction,
            payload.signal_strength ?? null,
        )

        const direction = payload.direction
        const deltas = DELTAS[direction]

        for (const genreName of payload.genre_names) {
            const current = await this.swipeRepository.getAttributeWeight(userId, 'genre', genreName)
            const next = clamp(current + deltas.genre)
            await this.swipeRepository.upsertAttributeWeight(userId, 'genre', genreName, next)
        }

        if (director) {
            const directorValue = String(director.id)
            const current = await this.swipeRepository.getAttributeWeight(userId, 'director', directorValue)
            const next = clamp(current + deltas.director)
            await this.swipeRepository.upsertAttributeWeight(userId, 'director', directorValue, next)
        }

        for (const actor of topCast) {
            const actorValue = String(actor.id)
            const current = await this.swipeRepository.getAttributeWeight(userId, 'actor', actorValue)
            const next = clamp(current + deltas.actor)
            await this.swipeRepository.upsertAttributeWeight(userId, 'actor', actorValue, next)
        }

        return successResponse({ ok: true })
    }

    private async fetchCredits(externalFilmId: number): Promise<TmdbCreditsResponse> {
        const res = await fetch(
            `${this.tmdbUrl}/movie/${externalFilmId}/credits`,
            { headers: { Authorization: `Bearer ${this.tmdbKey}` } },
        )

        if (!res.ok) {
            throw new Error(`TMDB credits fetch failed for film ${externalFilmId}: ${res.statusText}`)
        }

        return res.json() as Promise<TmdbCreditsResponse>
    }
}

function clamp(value: number): number {
    return Math.max(-1.0, Math.min(1.0, value))
}