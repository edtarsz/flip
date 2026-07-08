CREATE OR REPLACE FUNCTION public.check_email_exists(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users WHERE email = LOWER(p_email)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_username_exists(p_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(p_username)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_username_exists(text) TO anon, authenticated;

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
DECLARE
    v_film_id uuid;
BEGIN
    INSERT INTO public.films (
        external_film_id, title, poster_path, vote_average, release_date, genre_ids
    )
    VALUES (
        p_external_film_id, p_title, p_poster_path, p_vote_average, p_release_date, COALESCE(p_genre_ids, '{}')
    )
    ON CONFLICT (external_film_id)
    DO UPDATE SET
        title = EXCLUDED.title, poster_path = EXCLUDED.poster_path, vote_average = EXCLUDED.vote_average, release_date = EXCLUDED.release_date, genre_ids = EXCLUDED.genre_ids
    RETURNING id INTO v_film_id;

    RETURN v_film_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_to_watchlist_with_film(
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

    v_film_id := public.sync_film(p_external_film_id, p_title, p_poster_path, p_vote_average, p_release_date, p_genre_ids);

    INSERT INTO public.watchlists (user_id, film_id)
    VALUES (v_final_user_id, v_film_id)
    ON CONFLICT (user_id, film_id)
    DO UPDATE SET created_at = now()
    RETURNING id INTO v_watchlist_id;

    v_result := jsonb_build_object(
        'watchlist_id', v_watchlist_id, 'film_id', v_film_id, 'external_film_id', p_external_film_id, 'user_id', v_final_user_id, 'title', p_title
    );
    RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_review(
    p_external_film_id bigint,
    p_title text,
    p_poster_path text,
    p_vote_average real,
    p_release_date text,
    p_genre_ids integer[],
    p_tier text DEFAULT NULL,
    p_rating numeric DEFAULT NULL,
    p_review text DEFAULT NULL,
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
        RAISE EXCEPTION 'User must be authenticated to upsert a review';
    END IF;

    v_film_id := public.sync_film(p_external_film_id, p_title, p_poster_path, p_vote_average, p_release_date, p_genre_ids);

    INSERT INTO public.reviews (
        user_id, film_id, tier, rating, review
    )
    VALUES (
        v_final_user_id, v_film_id, p_tier, p_rating, p_review
    )
    ON CONFLICT (user_id, film_id) DO UPDATE SET
        tier = COALESCE(EXCLUDED.tier, reviews.tier),
        rating = COALESCE(EXCLUDED.rating, reviews.rating),
        review = COALESCE(EXCLUDED.review, reviews.review);

    v_result := jsonb_build_object('success', true, 'film_id', v_film_id);
    RETURN v_result;
END;
$$;
