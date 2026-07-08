CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.films (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    external_film_id BIGINT UNIQUE NOT NULL,
    title TEXT,
    poster_path TEXT,
    vote_average REAL,
    vote_count INTEGER,
    release_date TEXT,
    genre_ids INTEGER[] DEFAULT '{}',
    cast_ids BIGINT[] DEFAULT '{}',
    cast_names TEXT[] DEFAULT '{}',
    director_id BIGINT DEFAULT NULL,
    director_name TEXT DEFAULT NULL,
    runtime INTEGER DEFAULT NULL,
    watch_providers JSONB
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    film_id UUID REFERENCES public.films(id) ON DELETE CASCADE NOT NULL,
    CONSTRAINT watchlists_user_id_film_id_key UNIQUE (user_id, film_id)
);
CREATE INDEX IF NOT EXISTS idx_watchlists_film_id ON public.watchlists(film_id);

CREATE TABLE IF NOT EXISTS public.swipes (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    direction TEXT CHECK (direction IN ('like', 'dislike')) NOT NULL,
    CONSTRAINT swipes_user_film_unique UNIQUE (user_id, film_id)
);
CREATE INDEX IF NOT EXISTS idx_swipes_film_id ON public.swipes(film_id);

CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
    tier TEXT CHECK (tier IN ('BAD', 'MEH', 'GOOD', 'AMAZING')),
    review TEXT,
    CONSTRAINT reviews_user_id_film_id_key UNIQUE (user_id, film_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_film_id ON public.reviews(film_id);

CREATE TABLE IF NOT EXISTS public.user_taste_profile (
    user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    attribute_type TEXT NOT NULL,
    attribute_value TEXT NOT NULL,
    weight         REAL NOT NULL DEFAULT 0.0 CHECK (weight BETWEEN -1.0 AND 1.0),
    last_updated   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, attribute_type, attribute_value)
);
