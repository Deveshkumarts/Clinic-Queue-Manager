-- Create the queue table
CREATE TABLE public.queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token_number integer NOT NULL,
  patient_name text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamp with time zone DEFAULT now()
);

-- Create the settings table
CREATE TABLE public.settings (
  id integer PRIMARY KEY,
  current_serving_token integer DEFAULT 0,
  average_consultation_time integer DEFAULT 5
);

-- Insert the default settings row
INSERT INTO public.settings (id, current_serving_token, average_consultation_time)
VALUES (1, 0, 5)
ON CONFLICT (id) DO NOTHING;
