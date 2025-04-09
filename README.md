# Music Academy Web Application

A comprehensive web application for a music workshop business with parent and admin dashboards using React, TypeScript, TailwindCSS, and Firebase.

## Features

- **Parent Dashboard**: Manage children, register for classes, track payments
- **Admin Dashboard**: Manage classes, users, calendar, reports
- **Firebase Authentication**: Secure login with email/password and Google
- **Responsive Design**: Works on mobile, tablet, and desktop

## Prerequisites

- Node.js 18+ and npm
- A Firebase project with authentication enabled

## Environment Variables

Create a `.env` file in the project root with the following:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Building for Production

To build the application for production:

```bash
npm run build
```

To run the production build:

```bash
npm start
```

## Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Authentication (Email/Password and Google)
3. Set up Firestore Database
4. Add your application domain to the authorized domains list
5. Copy your Firebase configuration to the environment variables

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: Reusable UI components
  - `/src/lib`: Utilities and shared code
  - `/src/pages`: Page components
- `/server`: Backend Express server
  - `/routes.ts`: API routes
  - `/index.ts`: Server setup
- `/shared`: Shared code between client and server
  - `/schema.ts`: Database schema

## License

MIT