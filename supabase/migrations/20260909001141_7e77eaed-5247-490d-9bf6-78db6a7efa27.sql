CREATE POLICY "Users can view own registrations by email"
ON public.registrations FOR SELECT TO authenticated
USING (email IS NOT NULL AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));