# Music Academy Web Application

A comprehensive web application for a music workshop business with parent and admin dashboards using React, TypeScript, TailwindCSS, and Firebase.

## Features

### User Authentication & Management
- **Firebase Authentication**: Secure login with email/password and Google
- **Role-based Access Control**: Separate dashboards for parents and administrators
- **User Registration**: Comprehensive registration form with profile creation

### Parent Dashboard
- **Children Management**: Add and manage children with age-appropriate class suggestions
- **Class Registration**: Browse and enroll children in available music classes
- **Payment History**: View payments, due dates, and make payments
- **Class Schedule**: View upcoming classes, attendance, and instructor details

### Admin Dashboard
- **User Management**: View and manage all users and their roles
- **Class Management**: Create, edit, and manage music classes and workshops
- **Calendar View**: Schedule overview with classes, workshops, and special events
- **Analytics**: Enrollment statistics, age distributions, and revenue reports

### Class & Workshop System
- **Multiple Class Types**: Instrument classes, theory classes, vocal training
- **Workshop Management**: Special events and intensive sessions
- **Capacity Management**: Track enrollment numbers and available spots
- **Instructor Assignment**: Assign qualified instructors to specific classes

### Technical Features
- **Modern Stack**: React, TypeScript, TailwindCSS, and Firebase
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Real-time Updates**: Live data synchronization with Firestore
- **Secure Data Storage**: CRUD operations with proper security rules

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

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Setup Authentication:
   - Go to Authentication section and enable Email/Password and Google Authentication methods
   - Make sure to configure the OAuth redirect domains (add your domain to the authorized domains list)
   - For local development, add `localhost` to the authorized domains
3. Create a Firestore Database:
   - Go to Firestore Database section and create a new database
   - Start in production mode (or test mode for development)
   - Choose a location closest to your users
4. Register your Web Application:
   - Click the web icon (</>) in the project overview page
   - Register your app with a nickname
   - Copy the Firebase config values
5. Set up Environment Variables:
   - Create a `.env` file in the project root
   - Add the required Firebase config values:
     ```
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
     VITE_FIREBASE_APP_ID=your_firebase_app_id
     ```
6. Special Notes:
   - The first user who registers will automatically become an admin
   - Initial sample data for classes and workshops is automatically populated
   - You can create additional admin users by updating their role in the Firestore database

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