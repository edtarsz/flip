import { SupabaseClient } from 'supabase'
import { Film } from '../models/tmdb.ts'

export class SwipeRepository {
    constructor(private readonly supabase: SupabaseClient) { }

    async upsertFilm(film: Film): Promise<string> {
        const { data, error } = await this.supabase
            .from('films')
            .upsert({
                external_film_id: film.external_film_id,
                title: film.title,
                poster_path: film.poster_path,
                vote_average: film.vote_average,
                release_date: film.release_date,
            }, { onConflict: 'external_film_id' })
            .select('id')
            .single()

        if (error) throw error
        return data.id
    }

    async recordSwipe(userId: string, filmId: string, direction: 'like' | 'dislike', signalStrength: number | null): Promise<void> {
        const { error } = await this.supabase
            .from('swipes')
            .upsert({
                user_id: userId,
                film_id: filmId,
                direction,
                signal_strength: signalStrength,
            }, { onConflict: 'user_id,film_id', ignoreDuplicates: true })

        if (error) throw error
    }

    async getGenreWeight(userId: string, genreName: string): Promise<number> {
        const { data, error } = await this.supabase
            .from('user_taste_profile')
            .select('weight')
            .eq('user_id', userId)
            .eq('attribute_type', 'genre')
            .eq('attribute_value', genreName)
            .maybeSingle()

        if (error) throw error
        return data?.weight ?? 0.0
    }

    async upsertGenreWeight(userId: string, genreName: string, weight: number): Promise<void> {
        const { error } = await this.supabase
            .from('user_taste_profile')
            .upsert({
                user_id: userId,
                attribute_type: 'genre',
                attribute_value: genreName,
                weight: weight,
                last_updated: new Date().toISOString(),
            }, { onConflict: 'user_id,attribute_type,attribute_value' })

        if (error) throw error
    }

    async getUserGenreWeights(userId: string): Promise<{ attribute_value: string; weight: number }[]> {
        const { data, error } = await this.supabase
            .from('user_taste_profile')
            .select('attribute_value, weight')
            .eq('user_id', userId)
            .eq('attribute_type', 'genre')

        if (error) throw error
        return data ?? []
    }

    async getSwipedExternalFilmIds(userId: string): Promise<Set<number>> {
        const { data: swipes, error: swipesError } = await this.supabase
            .from('swipes')
            .select('film_id')
            .eq('user_id', userId)

        if (swipesError) throw swipesError
        if (!swipes || swipes.length === 0) return new Set()

        const filmIds = swipes.map(s => s.film_id)
        const { data: films, error: filmsError } = await this.supabase
            .from('films')
            .select('external_film_id')
            .in('id', filmIds)

        if (filmsError) throw filmsError

        const ids = new Set<number>()
        for (const f of films ?? []) {
            if (typeof f.external_film_id === 'number') {
                ids.add(f.external_film_id)
            }
        }
        return ids
    }
}