import { z } from "zod"
import { Film } from "@shared/models/tmdb.ts"
import { SwipeRepository } from "@shared/repositories/swipe.repository.ts"
import { parseBody, successResponse, validatePayload } from '@shared/utils/http-helper.ts'

const recordSwipeSchema = z.object({
    external_film_id: z.number(),
    title: z.string(),
    poster_path: z.string().nullable().optional(),
    vote_average: z.number().nullable().optional(),
    release_date: z.string().nullable().optional(),
    direction: z.enum(['like', 'dislike']),
    genre_names: z.array(z.string()),
    signal_strength: z.number().nullable().optional(),
})

const LIKE_DELTA = 0.15
const DISLIKE_DELTA = -0.10

export class SwipeController {
    private readonly swipeRepository: SwipeRepository;

    constructor(swipeRepository: SwipeRepository) {
        this.swipeRepository = swipeRepository;
    }

    async recordSwipe(req: Request, userId: string): Promise<Response> {
        const body = await parseBody(req)
        const payload = validatePayload(recordSwipeSchema, body)

        const filmId = await this.swipeRepository.upsertFilm({
            external_film_id: payload.external_film_id,
            title: payload.title,
            poster_path: payload.poster_path ?? '',
            vote_average: payload.vote_average ?? 0,
            release_date: payload.release_date ?? '',
        })

        await this.swipeRepository.recordSwipe(
            userId,
            filmId,
            payload.direction,
            payload.signal_strength ?? null
        )

        const delta = payload.direction === 'like' ? LIKE_DELTA : DISLIKE_DELTA

        for (const genreName of payload.genre_names) {
            const currentWeight = await this.swipeRepository.getGenreWeight(userId, genreName)
            const newWeight = Math.max(-1.0, Math.min(1.0, currentWeight + delta))
            await this.swipeRepository.upsertGenreWeight(userId, genreName, newWeight)
        }

        return successResponse({ ok: true })
    }

    async upsetFilm(film: Film): Promise<string> {
        return await this.swipeRepository.upsertFilm(film);
    }
}