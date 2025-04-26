# Backend Deployment Guide

This guide outlines the steps to deploy the ML Hero Intel backend services to Firebase.

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- [Firebase CLI](https://firebase.google.com/docs/cli) installed
- A Google account
- Firebase project created

## Step 1: Create and Configure Your Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)

2. Click "Add Project" and follow the setup wizard:
   - Enter a project name
   - Configure Google Analytics (optional)
   - Choose appropriate settings for your project

3. Enable required Firebase services:
   - **Firestore**: Database > Create Database > Start in production mode
   - **Authentication**: Authentication > Get Started > Enable Email/Password provider
   - **Storage**: Storage > Get Started > Start in production mode
   - **Cloud Functions**: Functions > Get Started (will prompt to upgrade to Blaze plan)

## Step 2: Set Up Firebase CLI and Initialize Project

1. Install Firebase CLI globally (if not already installed):
```bash
npm install -g firebase-tools
```

2. Log in to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your backend directory:
```bash
cd backend
firebase init
```

4. Select the following Firebase features:
   - Firestore
   - Functions
   - Storage
   - Emulators (optional, but recommended for local testing)

5. When prompted:
   - Select your Firebase project
   - Accept default Firestore rules or specify a custom location
   - Choose JavaScript for Cloud Functions
   - Select Yes to use ESLint
   - Select Yes to install dependencies

## Step 3: Configure Firestore Security Rules

1. Edit the `firestore.rules` file in your project directory:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to hero data
    match /heroes/{heroId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Allow authenticated users to read and write their own user data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to add comments
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                           (request.auth.uid == resource.data.userId || 
                            request.auth.token.admin == true);
    }
  }
}
```

2. Deploy your Firestore rules:
```bash
firebase deploy --only firestore:rules
```

## Step 4: Configure Storage Rules

1. Edit the `storage.rules` file:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /heroes/{heroId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

2. Deploy your Storage rules:
```bash
firebase deploy --only storage:rules
```

## Step 5: Set Up Cloud Functions

1. Navigate to the functions directory:
```bash
cd functions
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file (not to be committed to version control)
   - Add environment variables specific to your functions
   - Use `firebase functions:config:set` to set environment variables:
   
   ```bash
   firebase functions:config:set scraper.timeout="30000" admin.email="admin@example.com"
   ```

4. Update Cloud Functions (if necessary) in `functions/index.js`

5. Deploy your functions:
```bash
firebase deploy --only functions
```

## Step 6: Configure CORS for API Access

If your frontend needs to access Cloud Functions directly:

1. Install the CORS middleware in your functions:
```bash
cd functions
npm install cors
```

2. Implement CORS in your HTTP functions:

```javascript
const cors = require('cors')({origin: true});

exports.yourFunction = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    // Your function logic
  });
});
```

## Step 7: Create Admin User

1. Create a new user via Firebase Authentication

2. Use Firebase Admin SDK to assign admin role:
   - Create a temporary script or use Firebase Functions Shell:

   ```javascript
   // In Firebase Functions Shell
   const admin = require('firebase-admin');
   admin.auth().getUserByEmail('admin@example.com')
     .then(user => {
       return admin.auth().setCustomUserClaims(user.uid, {admin: true});
     })
     .then(() => {
       console.log('Admin role assigned successfully');
     })
     .catch(error => {
       console.error('Error:', error);
     });
   ```

## Step 8: Set Up Data Scraping Schedules (Optional)

1. Configure scheduled Cloud Functions for data scraping:

```javascript
exports.scheduledScraping = functions.pubsub.schedule('every 24 hours').onRun((context) => {
  // Your scraping logic
  return null;
});
```

2. Deploy your scheduled functions:
```bash
firebase deploy --only functions
```

## Step 9: Test Your Deployment

1. Test Firestore access:
   - Add test data to Firestore manually via the Firebase Console
   - Verify read/write permissions based on your security rules

2. Test Cloud Functions:
   - Call your HTTP functions via cURL or Postman
   - Check function execution logs in the Firebase Console

3. Verify Storage access:
   - Upload test files via Firebase Console
   - Check access permissions

## Step 10: Connect Frontend to Your Firebase Backend

Ensure your frontend uses the correct Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Production Considerations

### Scaling

- Firebase automatically scales most services, but be aware of:
  - [Firebase Quotas and Limits](https://firebase.google.com/docs/firestore/quotas)
  - Cloud Functions concurrent execution limits
  - Cost implications of high traffic

### Monitoring

1. Set up Firebase Alerts:
   - Go to Firebase Console > Project Settings > Integrations > Cloud Monitoring
   - Configure alert policies for functions errors, high usage, etc.

2. Use Firebase Performance Monitoring for your web app

### Cost Management

1. Set up a budget alert in Google Cloud Console

2. Be mindful of:
   - Cloud Functions execution time and number of invocations
   - Firestore read/write operations
   - Storage usage and downloads
   - Outbound data transfer

3. Consider implementing caching where appropriate

### Security

1. Regularly review and update Firestore and Storage security rules

2. Rotate service account keys periodically

3. Follow the principle of least privilege for Cloud Functions

4. Use Firebase App Check to prevent API abuse

## Troubleshooting

### Deploy Failures

- Check Firebase CLI errors carefully
- Verify that your Firebase project has the Blaze plan for Cloud Functions
- Ensure your functions code follows Firebase's supported Node.js version

### Function Execution Issues

- Check function logs in Firebase Console > Functions > Logs
- Test functions locally using Firebase Emulator Suite:
  ```bash
  firebase emulators:start
  ```

### Security Rules Issues

- Test security rules using the Firebase Console Rules Playground
- Check client-side error messages for permission denied errors

## Useful Commands

```bash
# Deploy everything
firebase deploy

# Deploy only specific services
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Get current environment configuration
firebase functions:config:get

# Start local emulators for testing
firebase emulators:start
``` 