# Field Harmony Hub - Frontend

Frontend application for the NGO Field Operations Management System. 

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Routing:** React Router DOM
- **State Management:** React Query (TanStack Query)
- **Maps:** Leaflet & React-Leaflet
- **Icons:** Lucide React

## Features
- **Role-Based Access Control:** Separate dashboards and views for Admins, Managers, and Workers.
- **Project & Task Management:** End-to-end task assignment and tracking flow.
- **Attendance & Location:** Geolocation-based check-ins and check-outs.
- **Interactive Dashboards:** Real-time analytics, charts, and key metrics via Recharts.
- **Responsive Design:** A polished, modern UI optimized for both desktop and mobile platforms.
- **Dark Mode Support:** Seamless theme switching with `next-themes`.

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm or yarn

### Installation
1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root of the `Frontend` directory based on `.env.production` (e.g., update `VITE_API_URL` to your local or deployed backend instance).

### Running the App Locally
```bash
npm run dev
```
The application will usually be served at `http://localhost:5173/`.

### Building for Production
```bash
npm run build
```
The optimized bundle will be generated in the `dist` folder.
