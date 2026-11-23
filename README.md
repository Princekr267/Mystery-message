# Mystery Message — Full-Stack Learning Project

Part of my Next.js learning journey with the **Chai aur Code** YouTube channel.

After learning Next.js frontend concepts in a separate project and building
the backend authentication project in this repository collection, I created
**Mystery Message** as my full-stack project.

Users can share a public profile link and receive anonymous messages, while a
private dashboard lets them control whether messages are accepted and manage
everything they receive.

> Full-stack deployment guide coming soon after I deploy the project.

## What I learned

- Building complete full-stack flows with the Next.js App Router
- Connecting authentication, database models, API routes, and UI screens
- Implementing email/password and Google authentication
- Sending verification emails and handling account verification
- Creating public profile URLs and accepting anonymous submissions
- Using Zod for validation and Better Auth for sessions
- Designing a private dashboard with loading and notification states
- Calling an AI provider to generate useful message suggestions

## Features

- Email/password and Google sign-in with Better Auth
- Email verification during registration
- Public shareable profile links at `/u/[username]`
- Anonymous messages with validation and an opt-in acceptance switch
- Private dashboard for viewing, refreshing, and deleting received messages
- AI-generated conversation starters powered by Groq
- Responsive UI built with Tailwind CSS and shadcn/ui primitives

## Tech stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- [React](https://react.dev/) 19 and TypeScript
- [MongoDB](https://www.mongodb.com/) with Mongoose and the Better Auth adapter
- [Better Auth](https://www.better-auth.com/) for authentication
- [Resend](https://resend.com/) for verification emails
- [Vercel AI SDK](https://sdk.vercel.ai/) with Groq for message suggestions
- Tailwind CSS 4, Radix/Base UI components, and Sonner notifications

## Prerequisites

- Node.js 20 or newer
- npm
- A MongoDB database (local or hosted)
- A Resend API key for verification emails
- Google OAuth credentials if Google sign-in is enabled
- A Groq API key for suggested messages

## Run it locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/mystery-message

BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-a-long-random-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

RESEND_API_KEY=re_your-resend-api-key
GROQ_API_KEY=gsk_your-groq-api-key
```

Keep `.env` private and never commit real credentials. For Google sign-in,
configure the OAuth callback URL for your environment according to the Better
Auth setup. For local development, the application URL is
`http://localhost:3000`.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/sign-up` | Create an account |
| `/verify/[username]` | Verify a new account |
| `/sign-in` | Sign in with email or Google |
| `/dashboard` | Manage profile link and received messages |
| `/u/[username]` | Send an anonymous message to a user |

The `/dashboard` route requires an authenticated session. The public profile
route can be shared without requiring the visitor to sign in.

## API routes

The application exposes route handlers under `src/app/api/` for authentication,
registration, verification, username checks, message delivery, message
management, and AI suggestions. These handlers validate request data with Zod
schemas and return JSON responses.

## Project structure

```text
src/
├── app/
│   ├── (app)/              # Landing page and authenticated dashboard
│   ├── api/                # Authentication and application API routes
│   ├── sign-in/           # Sign-in page
│   ├── sign-up/           # Registration page
│   ├── u/[username]/      # Public anonymous message form
│   └── verify/[username]/ # Email verification page
├── components/             # Shared UI and application components
├── helpers/                # Email and other application helpers
├── lib/                    # Auth, database, and service clients
├── model/                  # MongoDB/Mongoose models
├── schemas/                # Zod validation schemas
└── types/                  # Shared TypeScript types
```

## Production deployment

The app can be deployed to [Vercel](https://vercel.com/). Configure all
production environment variables in the Vercel project settings, set
`BETTER_AUTH_URL` to the deployed URL, and add the deployed URL to the Google
OAuth configuration. Ensure the production MongoDB instance allows connections
from the deployment environment.

Before deploying, run:

```bash
npm run lint
npm run build
```

## License

This project is distributed under the license in [LICENSE](./LICENSE).

## Learning journey

This project is the final milestone of my current Next.js learning journey:
frontend in a separate project, backend authentication in the Next Auth
project, and this application as the full-stack implementation.

I am continuously improving the project and will update this README with live
deployment and demo links after deployment.

## Acknowledgements

- [Chai aur Code](https://www.youtube.com/@chaiaurcode) for the Next.js learning
  series that guided this project
- The open-source community behind Next.js, MongoDB, Better Auth, Resend, Groq,
  Tailwind CSS, and the supporting libraries
