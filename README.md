# ReflectAI - User-Authenticated Journal & Gemini Reflection Assistant

ReflectAI is a secure, user-authenticated journaling and AI reflection application built with **React**, **TypeScript**, **Express**, **Firebase Authentication**, **Cloud Firestore**, and the **Gemini 3.6 Flash API**.

---

## Architecture & Security Highlights

1. **User Identity Isolation**: Integrated with Firebase Authentication (Google Sign-In) to eliminate storage of raw credentials or passwords.
2. **Owner-Bound Database Path**: Every user interaction, multi-turn thread, and summary is stored under `/users/{userId}/interactions/{interactionId}` and guarded by Cloud Firestore Security Rules.
3. **Resilient Model Fallback Ladder**: The backend server features a 4-tier model fallback ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`) with error status code interception (503, 429, 404, 500) for guaranteed availability.
4. **Zero-Hardcoded Secrets**: All Gemini API keys are proxied strictly through server-side endpoints (`/api/reflect`, `/api/chat`) and fetched securely via environment variables and Google Cloud Secret Manager.

---

## 1. Prerequisites & GCP API Setup

Ensure the Google Cloud SDK (`gcloud`) is installed and configured to your active project.

```bash
# Log in and set your active project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com
```

---

## 2. Secret Manager Configuration

Store your Gemini API key in Google Cloud Secret Manager and grant the Cloud Run runtime service account permission to access it:

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant the default Compute Engine service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration (Cloud Firestore)

ReflectAI enforces strict owner-bound data isolation so users cannot read or write each other's journal entries.

### `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules using the Firebase CLI or Google Cloud Console:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables in .env
cp .env.example .env
# Fill in GEMINI_API_KEY="YOUR_API_KEY"

# 3. Start unified full-stack dev server (Express + Vite on port 3000)
npm run dev
```

Visit `http://localhost:3000` to access the application.

---

## 5. Production Build & Cloud Run Deployment Flow

### Build Container & Deploy to Cloud Run

```bash
# Deploy directly to Cloud Run with Secret Manager environment injection
gcloud run deploy reflectai-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

---

## 6. Required Campaign Verification Labeling

Apply the mandatory verification label to register your Cloud Run service for automated challenge scoring:

```bash
gcloud run services update reflectai-app \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 7. Verification & Functional Walkthrough Matrix

| Feature Module | Test Case Walkthrough | Expected Outcome |
| :--- | :--- | :--- |
| **Authentication** | Click **"Continue with Google"** on landing screen. | Firebase Auth popup opens, verifies credentials, and routes to dashboard with user avatar and name. |
| **Journal Reflection** | Write an entry in **"Reflect & Grow"** mode and click **"Reflect with Gemini"**. | Payload is processed by Gemini 3.6 Flash; user input and empathetic reflection are atomically saved to `/users/{userId}/interactions/*` in Firestore. |
| **Summarization** | Write reflection in **"Summarize & Action"** mode. | Generates core executive takeaway, pattern analysis, and actionable next steps. |
| **Multi-Turn Chat** | In the active thread, submit follow-up: *"Can you suggest 3 concrete habits to tackle this?"* | Gemini continues context with previous entries, rendering formatted Markdown, and appends to Firestore. |
| **History & Search** | Navigate to **"History & Reflections"** tab and type a keyword in the search bar. | Dynamically filters past reflections with real-time updates and allows opening past threads or deleting entries. |
| **Data Isolation** | Sign out and sign in with a different Google account. | Firestore loads only the newly signed-in user's documents; prior user's entries remain inaccessible. |
