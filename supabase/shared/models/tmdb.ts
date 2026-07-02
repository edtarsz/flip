export interface TmdbDiscoverResult {
    id: number
    title: string
    poster_path: string
    vote_average: number
    vote_count?: number
    release_date: string
    genre_ids: number[]
    adult?: boolean
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
    genre_ids?: number[]
    cast_ids?: number[]
    cast_names?: string[]
    director_id?: number | null
    director_name?: string | null
    runtime?: number | null
    watch_providers?: TmdbWatchProviderResult | null
}

export interface TmdbProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

export interface TmdbWatchProviderRegion {
    link?: string;
    flatrate?: TmdbProvider[];
    rent?: TmdbProvider[];
    buy?: TmdbProvider[];
}

export interface TmdbWatchProviderResult {
    [region: string]: TmdbWatchProviderRegion;
}

export interface TmdbMovieDetailsResponse extends TmdbDiscoverResult {
    runtime?: number | null;
    credits?: TmdbCreditsResponse;
    "watch/providers"?: {
        results: TmdbWatchProviderResult;
    };
}