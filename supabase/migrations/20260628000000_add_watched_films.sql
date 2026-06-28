ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watched_film_ids uuid[] DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.mark_film_as_watched(
    p_external_film_id bigint,
    p_title text,
    p_poster_path text,
    p_vote_average real,
    p_release_date text,
    p_genre_ids integer[],
    p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
    v_film_id uuid;
    v_final_user_id uuid;
    v_result jsonb;
BEGIN
    v_final_user_id := COALESCE(p_user_id, auth.uid());
    
    IF auth.role() = 'authenticated' AND v_final_user_id <> auth.uid() THEN
        v_final_user_id := auth.uid();
    END IF;

    IF v_final_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to mark film as watched';
    END IF;

    INSERT INTO public.films (
        external_film_id, 
        title, 
        poster_path, 
        vote_average, 
        release_date,
        genre_ids
    )
    VALUES (
        p_external_film_id, 
        p_title, 
        p_poster_path, 
        p_vote_average, 
        p_release_date,
        p_genre_ids
    )
    ON CONFLICT (external_film_id) DO UPDATE SET 
        title = EXCLUDED.title,
        poster_path = EXCLUDED.poster_path,
        vote_average = EXCLUDED.vote_average,
        release_date = EXCLUDED.release_date,
        genre_ids = EXCLUDED.genre_ids
    RETURNING id INTO v_film_id;

    UPDATE public.profiles
    SET watched_film_ids = array_append(
        array_remove(COALESCE(watched_film_ids, '{}'), v_film_id), 
        v_film_id
    )
    WHERE id = v_final_user_id;

    v_result := jsonb_build_object(
        'success', true,
        'film_id', v_film_id
    );

    RETURN v_result;
END;
$$;
