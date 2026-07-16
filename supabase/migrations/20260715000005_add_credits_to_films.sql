ALTER TABLE public.films
ADD COLUMN IF NOT EXISTS credits JSONB DEFAULT NULL;

DROP FUNCTION IF EXISTS public.sync_film(bigint, text, text, real, text, integer[]);

CREATE OR REPLACE FUNCTION public.sync_film(
    p_external_film_id bigint,
    p_title text,
    p_poster_path text,
    p_vote_average real,
    p_release_date text,
    p_genre_ids integer[],
    p_credits jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_film_id uuid;
BEGIN
    INSERT INTO public.films (
        external_film_id, title, poster_path, vote_average, release_date, genre_ids, credits
    )
    VALUES (
        p_external_film_id, p_title, p_poster_path, p_vote_average, p_release_date, COALESCE(p_genre_ids, '{}'), p_credits
    )
    ON CONFLICT (external_film_id)
    DO UPDATE SET
        title = EXCLUDED.title, 
        poster_path = EXCLUDED.poster_path, 
        vote_average = EXCLUDED.vote_average, 
        release_date = EXCLUDED.release_date, 
        genre_ids = EXCLUDED.genre_ids,
        credits = EXCLUDED.credits
    RETURNING id INTO v_film_id;

    RETURN v_film_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_film(
    p_external_film_id bigint,
    p_title text,
    p_poster_path text,
    p_vote_average real,
    p_release_date text,
    p_genre_ids integer[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN public.sync_film(p_external_film_id, p_title, p_poster_path, p_vote_average, p_release_date, p_genre_ids, NULL);
END;
$$;
