ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_taste_profile ENABLE ROW LEVEL SECURITY;

-- Films
CREATE POLICY "Allow public read access to films" ON public.films FOR SELECT USING (true);

-- Profiles
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Watchlists
CREATE POLICY "Enable users to view their own data only" ON public.watchlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own watchlist items" ON public.watchlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watchlist items" ON public.watchlists FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Swipes
CREATE POLICY "Allow users to view their own swipes" ON public.swipes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own swipes" ON public.swipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to write reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Taste Profile
CREATE POLICY "Allow users to read their own taste profile" ON public.user_taste_profile FOR SELECT TO authenticated USING (auth.uid() = user_id);
