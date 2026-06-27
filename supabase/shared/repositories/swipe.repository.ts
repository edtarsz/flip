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
                vote_count: film.vote_count,
                release_date: film.release_date,
                genre_ids: film.genre_ids ?? [],
                cast_ids: film.cast_ids ?? [],
                cast_names: film.cast_names ?? [],
                director_id: film.director_id ?? null,
                director_name: film.director_name ?? null,
            }, { onConflict: 'external_film_id' })
            .select('id')
            .single()

        if (error) throw error
        return data.id
    }

    async getFilmsByExternalIds(externalIds: number[]): Promise<Film[]> {
        if (!externalIds || externalIds.length === 0) return []
        const { data, error } = await this.supabase
            .from('films')
            .select('*')
            .in('external_film_id', externalIds)

        if (error) throw error
        return data ?? []
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

    async getAttributeWeight(userId: string, attributeType: string, attributeValue: string): Promise<number> {
        const { data, error } = await this.supabase
            .from('user_taste_profile')
            .select('weight')
            .eq('user_id', userId)
            .eq('attribute_type', attributeType)
            .eq('attribute_value', attributeValue)
            .maybeSingle()

        if (error) throw error
        return data?.weight ?? 0.0
    }

    async upsertAttributeWeight(userId: string, attributeType: string, attributeValue: string, weight: number): Promise<void> {
        const { error } = await this.supabase
            .from('user_taste_profile')
            .upsert({
                user_id: userId,
                attribute_type: attributeType,
                attribute_value: attributeValue,
                weight,
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

    async getUserPeopleWeights(userId: string): Promise<{ attribute_type: string; attribute_value: string; weight: number }[]> {
        const { data, error } = await this.supabase
            .from('user_taste_profile')
            .select('attribute_type, attribute_value, weight')
            .eq('user_id', userId)
            .in('attribute_type', ['actor', 'director'])
            .gt('weight', 0)
            .order('weight', { ascending: false })
            .limit(5)

        if (error) throw error
        return data ?? []
    }

    async getSwipedExternalFilmIds(userId: string): Promise<Set<number>> {
        const { data, error } = await this.supabase
            .from('swipes')
            .select('films ( external_film_id )')
            .eq('user_id', userId)

        if (error) throw error

        const ids = new Set<number>()
        for (const row of data ?? []) {
            const films = row.films as unknown as { external_film_id: number } | { external_film_id: number }[] | null;
            const externalId = Array.isArray(films) ? films[0]?.external_film_id : films?.external_film_id;
            if (typeof externalId === 'number') {
                ids.add(externalId)
            }
        }
        return ids
    }

    async getRecentLikedExternalFilmIds(userId: string, limit: number = 3): Promise<number[]> {
        const { data, error } = await this.supabase
            .from('swipes')
            .select('films ( external_film_id )')
            .eq('user_id', userId)
            .eq('direction', 'like')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        const externalIds: number[] = []
        for (const row of data ?? []) {
            const films = row.films as unknown as { external_film_id: number } | { external_film_id: number }[] | null;
            const externalId = Array.isArray(films) ? films[0]?.external_film_id : films?.external_film_id;
            if (typeof externalId === 'number') {
                externalIds.push(externalId)
            }
        }
        return externalIds
    }
}