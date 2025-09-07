# CR Vote - Class Representative Voting App

This is a full-stack Next.js application for managing and running a simple election, such as for a Class Representative. It provides an admin dashboard for managing candidates and voters, and a public-facing portal for students to cast their votes.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI:** [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **AI Features:** [Google AI (Gemini) via Genkit](https://firebase.google.com/docs/genkit)
- **State Management:** React Hooks (`useState`, `useActionState`)

***

## ⚠️ Important: Not Production-Ready

This application is intended as a demonstration and uses a local JSON file (`src/lib/data.json`) for data storage. This is great for simplicity and running the app locally.

However, on most hosting platforms (like Vercel, Render, etc.), the filesystem is **ephemeral**. This means the `data.json` file will be reset every time the application is deployed or restarted, and **all your data will be lost**.

**Before using this in a live production environment, you MUST replace the file-based storage with a persistent database service like Firebase Firestore or Supabase.**

***

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or newer recommended)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/getting-started/install)

### 1. Clone or Download the Project

First, get the project code onto your local machine.

### 2. Install Dependencies

Navigate into the project's root directory in your terminal and install the required npm packages:

```bash
npm install
```

### 3. Set Up Environment Variables

The application uses environment variables for the admin password.

1.  Create a new file named `.env` in the root of your project.
2.  Add the following lines to your new `.env` file, changing the credentials to whatever you want:

```env
# Admin credentials for accessing the /admin dashboard
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password

# Optional: You can get a Google AI API key for the "Election Insights" feature.
# Get a key from AI Studio: https://aistudio.google.com/app/apikey
# GEMINI_API_KEY=your_google_ai_api_key_here
```

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application should now be running at [http://localhost:9002](http://localhost:9002).

## How to Push to GitHub

I cannot push the code for you, but you can do it yourself with these terminal commands from your project folder.

1.  **Create a New Repository on GitHub:** Go to [github.com/new](https://github.com/new), create a new repository (without a README), and copy its HTTPS URL.

2.  **Run these commands:**

```bash
# Initialize a new Git repository
git init -b main

# Add all the files to be tracked
git add .

# Create the first commit
git commit -m "Initial commit of the CR Vote app"

# Add your new GitHub repository as the remote
# (Replace the URL with the one you copied)
git remote add origin https://github.com/your-username/your-repo-name.git

# Push your code to GitHub
git push -u origin main
```
