-- Create a trigger to automatically create a profile when a user signs up
-- This ensures every Supabase Auth user has a corresponding profile entry

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    name,
    role,
    skills,
    expertise,
    interests,
    open_to,
    availability,
    social_links,
    achievements,
    universities,
    privacy,
    preferences
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'student',
    '{}',
    '{}',
    '{}',
    '{}',
    '{"mentoring": false, "collaboration": false, "consultation": false}'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"profileVisibility": "public", "contactVisibility": "alumni", "professionalVisibility": "public"}'::jsonb,
    '{"language": "en", "timezone": "UTC", "theme": "light"}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

