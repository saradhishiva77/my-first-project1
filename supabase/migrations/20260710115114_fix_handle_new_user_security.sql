/*
# Fix handle_new_user security issues

1. Changes
   - Recreate `public.handle_new_user` with a fixed `search_path` to prevent
     search_path hijacking attacks.
   - Revoke EXECUTE on the function from `anon` and `authenticated` roles so it
     cannot be called directly via PostgREST RPC. It is a trigger function and
     should only ever fire internally.

2. Security fixes
   - SET search_path = '' with fully-qualified identifiers eliminates the mutable
     search_path vulnerability.
   - REVOKE EXECUTE FROM anon, authenticated prevents unauthenticated and
     signed-in users from calling it as an RPC endpoint.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Revoke direct RPC execution from all non-superuser roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
