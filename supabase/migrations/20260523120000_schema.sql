CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.films (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    external_film_id BIGINT UNIQUE NOT NULL,
    title TEXT,
    poster_path TEXT,
    vote_average REAL,
    vote_count INTEGER,
    release_date TEXT,
    genres TEXT[],
    cast_ids BIGINT[] DEFAULT '{}',
    cast_names TEXT[] DEFAULT '{}',
    director_id BIGINT DEFAULT NULL,
    director_name TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.swipes (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    direction TEXT CHECK (direction IN ('like', 'dislike')) NOT NULL,
    signal_strength REAL DEFAULT NULL,
    CONSTRAINT swipes_user_film_unique UNIQUE (user_id, film_id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
    rating INTEGER,
    review TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.user_taste_profile (
    user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    attribute_type TEXT NOT NULL,
    attribute_value TEXT NOT NULL,
    weight         REAL NOT NULL DEFAULT 0.0 CHECK (weight BETWEEN -1.0 AND 1.0),
    last_updated   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, attribute_type, attribute_value)
);
