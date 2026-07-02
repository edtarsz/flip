export type FilmTMDB = {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  softcore: boolean;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  director_id?: number | null;
  director_name?: string | null;
  runtime?: number | null;
  cast_ids?: number[];
  cast_names?: string[];
  watch_providers?: Record<
    string,
    {
      link?: string;
      flatrate?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      rent?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
      buy?: Array<{ provider_id: number; provider_name: string; logo_path: string }>;
    }
  > | null;
};

export type WatchlistFilmTMDB = {
  id: string;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  external_film_id: number;
  genre_ids?: number[];
};

export type WatchlistItem = {
  id: string;
  created_at: string;
  film_id: string;
  user_id: string;
  film: WatchlistFilmTMDB;
};

export type FilmDetailsTMDB = Omit<FilmTMDB, 'genre_ids'> & {
  belongs_to_collection: any | null;
  budget: number;
  genres: Array<{ id: number; name: string }>;
  homepage: string;
  imdb_id: string;
  production_companies: Array<{
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  revenue: number;
  runtime: number | null;
  spoken_languages: Array<{ english_name: string; iso_639_1: string; name: string }>;
  status: string;
  tagline: string;
  director?: string | null;
  screenwriter?: string | null;
};
