
CREATE POLICY "No public update access"
ON public.contact_messages
FOR UPDATE
USING (false);

CREATE POLICY "No public delete access"
ON public.contact_messages
FOR DELETE
USING (false);
