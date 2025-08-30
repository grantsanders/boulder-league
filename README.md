# Boulder League

A climbing competition scoring system built with Next.js and Supabase.

## Features

- 🧗‍♂️ Scoring system
- 🔐 User authentication with Supabase
- 📊 Dashboard for tracking progress
- 🎯 Working grade calculation
- ⚡ Real-time updates

## Getting Started

### Prerequisites

1. Create a [Supabase](https://supabase.com) project
2. Get your project URL and anon key from the project settings

### Environment Setup

Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

Install dependencies:

```bash
npm install
# or
yarn install
# or
bun install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Supabase Setup

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Add your site URL to the Site URL field (e.g., `http://localhost:3000`)
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

### Google SSO Setup (Optional)

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
   - Copy the **Client ID** and **Client Secret**

2. **Configure Supabase Google Provider:**
   - Go to your Supabase project dashboard
   - Navigate to **Authentication** → **Providers**
   - Find **Google** and click **Enable**
   - Enter your Google **Client ID** and **Client Secret**
   - Save the configuration

3. **Test Google SSO:**
   - Visit your app and click "Sign in with Google"
   - Complete the Google OAuth flow
   - You should be redirected to your dashboard

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
