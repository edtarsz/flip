CREATE OR REPLACE FUNCTION public.add_to_watchlist_with_film(
    p_external_film_id bigint,
    p_title text,
    p_poster_path text,
    p_vote_average real,
    p_release_date text,
    p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
    v_watchlist_id uuid;
    v_film_id uuid;
    v_result jsonb;
    v_final_user_id uuid;
BEGIN
    v_final_user_id := COALESCE(p_user_id, auth.uid());
    
    IF auth.role() = 'authenticated' AND v_final_user_id <> auth.uid() THEN
        v_final_user_id := auth.uid();
    END IF;

    IF v_final_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to add to watchlist';
    END IF;

    INSERT INTO public.films (
        external_film_id,
        title,
        poster_path,
        vote_average,
        release_date
    )
    VALUES (
        p_external_film_id,
        p_title,
        p_poster_path,
        p_vote_average,
        p_release_date
    )
    ON CONFLICT (external_film_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        poster_path = EXCLUDED.poster_path,
        vote_average = EXCLUDED.vote_average,
        release_date = EXCLUDED.release_date
    RETURNING id INTO v_film_id;

    INSERT INTO public.watchlists (
        user_id,
        film_id
    )
    VALUES (
        v_final_user_id,
        v_film_id
    )
    ON CONFLICT (user_id, film_id)
    DO UPDATE SET
        created_at = now()
    RETURNING id INTO v_watchlist_id;

    v_result := jsonb_build_object(
        'watchlist_id', v_watchlist_id,
        'film_id', v_film_id,
        'external_film_id', p_external_film_id,
        'user_id', v_final_user_id,
        'title', p_title
    );

    RETURN v_result;
END;
$$;
