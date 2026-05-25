CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF new.raw_user_meta_data->>'username' IS NULL THEN
        RAISE EXCEPTION 'username is required';
    END IF;

    INSERT INTO public.profiles (
        id,
        username,
        avatar_url
    )
    VALUES (
        new.id,
        new.raw_user_meta_data->>'username',
        ''
    );

    RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
