export interface TmdbDiscoverResult {
    id: number
    title: string
    poster_path: string
    vote_average: number
    release_date: string
    genre_ids: number[]
}

export interface Film {
    external_film_id: number,
    title: string,
    poster_path: string,
    vote_average: number,
    release_date: string,
}