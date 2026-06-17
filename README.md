# Clinic Queue Manager

A full-stack web application for managing a neighborhood clinic's waiting queue in real-time.

## Features
- **Receptionist Dashboard (`/admin`)**: Add patients, assign tokens, call the next token, and update the average consultation time.
- **Patient Waiting Room Display (`/queue`)**: Shows the currently serving token, tokens ahead, and estimated wait time. Updates live without page refresh.
- **Real-Time Updates**: Powered by Socket.IO.

## Tech Stack
- **Frontend**: React, React Router, Plain CSS (Vite)
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: Supabase (PostgreSQL)

## Setup Instructions

### 1. Supabase Database Setup
To run this application, you need a Supabase project.
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Go to the SQL Editor in your Supabase dashboard and run the following script:
   ```sql
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
   ```
3. Go to Project Settings -> API to get your Project URL and `service_role` secret.

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 4. Usage
- Open `http://localhost:5173/admin` for the Receptionist Dashboard.
- Open `http://localhost:5173/queue` for the Patient Display.
- Test by adding a patient in the admin dashboard and watch the patient display update automatically.

## Deployment Ready
- **Frontend**: Ready to be deployed to Vercel (just connect the `frontend` folder).
- **Backend**: Ready to be deployed to Render (connect the `backend` folder and add environment variables).
