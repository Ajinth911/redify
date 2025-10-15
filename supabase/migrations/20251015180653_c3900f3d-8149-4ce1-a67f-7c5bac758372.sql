-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create playlists table
CREATE TABLE public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Playlists policies
CREATE POLICY "Users can view their own playlists"
  ON public.playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id);

-- Create playlist_songs junction table
CREATE TABLE public.playlist_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_data jsonb NOT NULL,
  position int NOT NULL DEFAULT 0,
  added_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Playlist songs policies
CREATE POLICY "Users can view songs in their playlists"
  ON public.playlist_songs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can add songs to their playlists"
  ON public.playlist_songs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove songs from their playlists"
  ON public.playlist_songs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  ));

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();