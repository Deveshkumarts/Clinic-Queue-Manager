# Clinic Queue Manager

A beautiful, real-time queue management system for clinics, built with React, Vite, and Supabase.

## ✨ Features
*   **Real-time Patient Queue**: Patients can view the live queue and see their estimated wait times updated in real-time.
*   **Staff Dashboard**: Receptionists can add patients, mark emergencies, and call the next token.
*   **Token Tracking & Cancellation**: Patients can receive notifications when their turn approaches, and cancel their tokens securely using their registered phone number.
*   **Premium UI**: A clean, "glassmorphism" aesthetic with smooth animations, complete with a Dark/Light mode toggle.
*   **Analytics**: View daily statistics, average consultation times, and emergency ratios in the dashboard.
*   **Serverless Backend**: Powered by Supabase (PostgreSQL) for instant real-time synchronization across all devices.

## 🚀 Tech Stack
*   **Frontend**: React.js, Vite
*   **Styling**: Pure CSS (Glassmorphism, custom CSS variables, Google Fonts: Outfit & Inter)
*   **Icons & Charts**: Lucide-React, Recharts
*   **Backend / Database**: Supabase (PostgreSQL, Realtime subscriptions)
*   **Routing**: React Router DOM

## 🛠️ Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Deveshkumarts/Clinic-Queue-Manager.git
   cd Clinic-Queue-Manager/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the `frontend` directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be running at `http://localhost:5173`.

## 🌐 Deployment (Vercel)
This application is designed to be deployed instantly on Vercel:
1. Import this repository into Vercel.
2. In the Vercel project settings, go to **Environment Variables**.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Click **Deploy**.

*(Note: The old Node.js/MongoDB backend has been completely removed in favor of Supabase's serverless architecture, meaning you only need to deploy the frontend directory).*

## 👨‍💻 Author

**Devesh Kumar TS**  
B.E CSE (Cyber Security)  
Chennai Institute of Technology (CIT'28)

## 📜 License

This project is intended for educational and research purposes only.

Use responsibly and only on systems you own or are authorized to test.
