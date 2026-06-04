export interface TmdbDiscoverResult {
    id: number
    title: string
    poster_path: string
    vote_average: number
    vote_count?: number
    release_date: string
    genre_ids: number[]
}

export interface TmdbCreditsCast {
    id: number
    name: string
    order: number
}

export interface TmdbCreditsCrew {
    id: number
    name: string
    job: string
    department: string
}

export interface TmdbCreditsResponse {
    id: number
    cast: TmdbCreditsCast[]
    crew: TmdbCreditsCrew[]
}

export interface Film {
    external_film_id: number
    title: string
    poster_path: string
    vote_average: number
    vote_count?: number
    release_date: string
    cast_ids?: number[]
    cast_names?: string[]
    director_id?: number | null
    director_name?: string | null
}