export type FilmTMDB = {
    adult: boolean
    backdrop_path: string
    genre_ids: number[]
    id: number
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path: string
    release_date: string
    softcore: boolean
    title: string
    video: boolean
    vote_average: number
    vote_count: number
    director_id?: number | null
    director_name?: string | null
    cast_ids?: number[]
    cast_names?: string[]
}

export type WatchlistFilmTMDB = {
    id: string
    title: string
    poster_path: string
    vote_average: number
    release_date: string
    external_film_id: number
}

export type WatchlistItem = {
    id: string
    created_at: string
    film_id: string
    user_id: string
    film: WatchlistFilmTMDB
}