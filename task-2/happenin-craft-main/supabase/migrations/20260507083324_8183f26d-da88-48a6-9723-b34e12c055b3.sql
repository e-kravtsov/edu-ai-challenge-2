
CREATE POLICY "Anyone can view rsvps for published events"
ON public.rsvps
FOR SELECT
TO public
USING (
  status IN ('confirmed', 'waitlisted')
  AND EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = rsvps.event_id
      AND e.state = 'published'
  )
);
