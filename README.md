# Nilgiri E-Pass & Crowd Management System

A Production-ready Full Stack Web Application built with Next.js 16, Tailwind CSS (Glassmorphism), Prisma (MongoDB), and Clerk Authentication.

## 🌟 Project Overview
The Nilgiri E-Pass & Crowd Management System is a comprehensive smart tourism and logistics platform designed to optimize tourist flow, reduce congestion, and promote eco-friendly practices in the Nilgiri Hills. It seamlessly connects tourists, administrators, and local businesses.

## 🚀 Key Modules & Features

### 1. 🛂 Smart E-Pass & Ticketing
- **Online Pass Application (`/apply`)**: Tourists can apply for an e-pass (Car, Bike, Bus, etc.) providing travel details, ID proof, and vehicle RC.
- **QR Code Generation (`/pass`)**: Secure, encrypted QR passes are generated post-approval for easy entry.
- **Offline Ticket Management (`/validator`)**: Dedicated admin interfaces to create and verify on-the-spot offline tickets for walk-ins or govt staff.
- **QR Scanner (`/scan`)**: HTML5-QRCode integrated scanner for gate validators to verify pass authenticity instantly.

### 2. 🌍 Smart Tourism & Exploration
- **Virtual Tours (`/virtual-tour`)**: Immersive 3D Parallax virtual tours of iconic spots (Ooty Lake, Doddabetta Peak, Botanical Garden) powered by Framer Motion and optimized Next.js local images.
- **Interactive Map (`/map`)**: Real-time Leaflet/Google Maps integration for smart navigation and crowding tracking.
- **Tourism Info (`/tourism`)**: Curated guides for locations, including local weather updates (`/weather`).
- **Amenities (`/hotels`, `/food`)**: Integration for finding local stays and dining options.

### 3. 🚗 Logistics & Traffic Control
- **Smart Parking (`/parking`)**: Real-time visibility into parking slot availability across multiple facilities. Allows tourists to book slots in advance.
- **Crowd Control & Analytics (`/admin`)**: Live density monitoring. If a location breaches its crowd threshold, the system triggers alerts and redirects tourists to alternate spots.
- **Heavy Vehicle Management**: Specific slots and timed entries for heavy vehicles to avoid daytime traffic jams.

### 4. ♻️ Eco-Initiatives & Gamification
- **Eco-Score System**: Tourists earn points for eco-friendly actions (using public transport, sharing location, visiting off-beat spots).
- **Eco-Store (`/eco-store`)**: Redeem earned points for local products (Chocolates, Tea, Handicrafts).
- **User Certificates**: Automated PDF certificates for contributing to cleanliness and sustainable tourism.

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: Next.js 16 (App Router) with React 19
- **UI/UX**: Tailwind CSS v4, Framer Motion (Animations), Lucide React (Icons), Recharts (Admin Data Viz)
- **Database**: MongoDB + Prisma ORM (v5.21)
- **Authentication**: Clerk (Email/Social Login) with Role-Based Access Control (`USER`, `ADMIN`).
- **Scanning & PDF**: HTML5-QRCode, jspdf, html2canvas
- **Mapping**: Leaflet, React-Leaflet, Google Maps API

## 📦 Installation & Setup

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Auth)
   - `CLERK_SECRET_KEY` (Auth)
   - `DATABASE_URL` (MongoDB Connection String)
   - `GRAPHHOPPER_API_URL` (Navigation & Routing API)
   - `NEXT_PUBLIC_GRAPHHOPPER_API_KEY` (Navigation & Routing API Key)

3. **Database Migration (MongoDB)**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🔐 Admin Access & Notification System
Admin access uses the existing Clerk email/password sign-in. After the administrator creates an account and signs in once, promote that email in the configured database:

```bash
npm run promote admin@example.com
```
Only users with the `ADMIN` database role can access `/admin`, `/admin/analytics`, or `/validator`. Messages submitted through the Contact Us form are delivered to the admin notification panel.

## 📱 User Flows

1. **Tourist**: Logs in ➔ Applies for Pass ➔ Receives QR ➔ Checks Smart Map for Parking & Crowds ➔ Explores Virtual Tours & Eco-Store.
2. **Admin/Validator**: Logs in ➔ Scans QR at Gate (Allowed/Denied) ➔ Monitors Crowd Analytics ➔ Manages Offline Tickets.

## 🎨 Theme & Design System
The application utilizes a premium "Nilgiri Mist" theme:
- Deep forest greens, misty white overlays, and vibrant nature imagery.
- **Glassmorphism**: Frosted glass cards and UI components for a modern, lightweight aesthetic.
- **Micro-interactions**: Smooth transitions and hover effects using Framer Motion.
