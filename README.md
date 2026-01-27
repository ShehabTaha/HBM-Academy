# HBM Academy - Admin Control Panel

This is the admin control panel for managing the HBM Academy platform. Built with [Next.js](https://nextjs.org) and [Supabase](https://supabase.com).

## Overview

The HBM Academy Admin Panel is a comprehensive management system for administrators to control and monitor the HBM Academy learning platform. This application provides tools for managing courses, users, content, and analytics.

## Features

- **Course Management**: Create, edit, and organize courses with multimedia content
- **User Management**: Manage platform users and their access
- **Video Library**: Centralized video content management
- **Analytics Dashboard**: Monitor platform performance and user engagement
- **Content Uploader**: Upload and manage course materials
- **Admin Settings**: Configure platform settings and preferences

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project configured
- Admin credentials for authentication

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (copy `.env.example` to `.env.local` and fill in your values)

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) and sign in with admin credentials

## Authentication

This application requires admin authentication via NextAuth. Only users with the `admin` role can access the dashboard.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React

## Deployment

Deploy to [Vercel](https://vercel.com) for the best performance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

Make sure to configure your environment variables in your deployment platform.
