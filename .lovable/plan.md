

## Store Contact Form Submissions in the Backend

### What we are building
Right now, the Contact page form only shows a toast message but does not actually save the submission anywhere. We will create a database table to store all contact form messages so you never lose a customer inquiry.

### What gets stored
- **Contact messages**: name, email, and message from the Contact page form

(The newsletter subscribers table is already set up and working.)

### Steps

1. **Create a `contact_messages` table** in the database with:
   - Name, email, and message fields
   - Timestamp for when the message was sent
   - Security policies allowing anyone to submit a message, but preventing public read access (just like the newsletter table)

2. **Update the Contact page** (`src/pages/Contact.tsx`):
   - Connect the form to the database so messages are actually saved
   - Add email validation before submitting
   - Add a loading spinner on the submit button while saving
   - Show proper success/error toast messages using `sonner`

### Technical details

**Database migration:**
```sql
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a message"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "No public read access"
  ON public.contact_messages
  FOR SELECT
  USING (false);
```

**Frontend changes (`src/pages/Contact.tsx`):**
- Import `supabase` client and `toast` from `sonner`
- Add input validation (email format, field length limits)
- Insert form data into `contact_messages` table on submit
- Add `submitting` loading state with `Loader2` spinner on button
- Handle success and error responses with toast notifications

