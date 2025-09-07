# CR Vote - Class Representative Voting App

This is a full-stack Next.js application for managing and running a simple election, such as for a Class Representative. It provides an admin dashboard for managing candidates and voters, and a public-facing portal for students to cast their votes.

The application uses a file-based storage system (`src/lib/data.json`) for simplicity. For a production environment, this should be replaced with a persistent database like Firebase Firestore or Supabase.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI:** [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **AI Features:** [Google AI (Gemini) via Genkit](https://firebase.google.com/docs/genkit)
- **State Management:** React Hooks (`useState`, `useActionState`)
- **Linting & Formatting:** ESLint & Prettier (via Next.js defaults)

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or newer recommended)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/getting-started/install)

### 1. Clone the Repository

First, clone the project to your local machine:

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 2. Install Dependencies

Install the required npm packages:

```bash
npm install
```

### 3. Set Up Environment Variables

The application uses environment variables for admin credentials.

1.  Create a new file named `.env` in the root of your project.
2.  Copy the contents of `.env.example` (if it exists) or add the following lines to your new `.env` file:

```env
# Admin credentials for accessing the /admin dashboard
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password

# Optional: You can get a Google AI API key from AI Studio for the summary feature
# https://aistudio.google.com/app/apikey
# GEMINI_API_KEY=your_google_ai_api_key_here
```

**Important:** You can change `ADMIN_USERNAME` and `ADMIN_PASSWORD` to whatever you want.

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application should now be running at [http://localhost:9002](http://localhost:9002).

## How to Use the App

### Admin Dashboard

-   Access the admin panel at `/admin`.
-   Log in using the credentials you set in the `.env` file.
-   **Manage Candidates:** Add new candidates with a name, bio, and image.
-   **Manage Voters:** Add individual voters. A unique 8-character voting code will be automatically generated for each voter.
-   **Set Election Schedule:** Define the start and end times for the election.
-   **View Live Results:** See a real-time summary of the votes.
-   **Generate AI Summary:** Use the Gemini-powered "Election Insights" feature to get a text summary of the current results.

### Student Voting Portal

-   Access the student login page at the root URL (`/`).
-   To log in, a student needs their full name and the unique voting code provided by the administrator.
-   Once logged in, they can see the list of candidates and cast their vote.
-   After voting, they will be shown the current results.

## Data Persistence

This application uses a local JSON file (`src/lib/data.json`) to store all data. This is great for simplicity and local development.

**Note for Production:** On most hosting platforms (like Vercel, Netlify, Render), the filesystem is ephemeral. This means the `data.json` file will be reset every time the application is deployed or restarted. For a production environment, you **must** replace the functions in `src/lib/data.ts` with logic that communicates with a persistent database service (e.g., Firebase Firestore, Supabase, etc.).

    