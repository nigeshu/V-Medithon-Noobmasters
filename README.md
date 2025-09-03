# V‑Medithon – Setup Guide (Step by Step)

This guide shows how to run the site, connect the AI chatbot (OpenRouter), and enable Firebase Login/Signup (Doctor/Nurse/Patient).

## 1) Clone and open the project
- Ensure you have a modern browser (Chrome/Edge) installed.
- Open the folder in your editor. No build system required.

## 2) Run the static site
- You can open `index.html` directly, or use a simple local server (recommended):
  - VS Code: install Live Server → Right-click `index.html` → Open with Live Server
  - Or Python (optional):
    ```bash
    python -m http.server 5500
    # then visit http://localhost:5500/index.html
    ```

## 3) Configure the AI Chatbot (OpenRouter)
- File: `chatbot/config.js`
- Replace the API key if needed and keep the default model:
  ```js
  export const OPENROUTER_API_KEY = "YOUR_OPENROUTER_KEY"; // already set for demo
  export const LLM_MODEL = "openai/gpt-4o-mini";
  export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
  ```
- Open `ai.html` and ask any medical question. The chatbot calls OpenRouter directly from the browser.
  - Note: Exposing keys in the frontend is not safe for production. For production, use a small proxy server to keep the key secret.

## 4) Enable Firebase Authentication (Login/Signup)
We use Firebase Authentication (Email/Password) and Firestore to store each user's role.

- In Firebase Console:
  1. Create a Firebase project.
  2. Enable Authentication → Sign-in methods → Email/Password → Enable.
  3. Create a Firestore database (in production or test mode as you prefer).
- Copy your project config and paste it into `chatbot/firebase-config.js`:
  ```js
  export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
  };
  ```
- Open `portal.html`:
  - Select a role (Doctor / Nurse / Patient)
  - Enter Email + Password
  - Click Sign up (first time) or Sign in (repeat)
  - The user document is written to Firestore collection `users` with fields:
    - `email`, `role`, `createdAt` (and `updatedAt` when role changes)

## 5) Customize the UI
- Colors: edit `assets/css/styles.css` (root variables under `:root`)
- Header buttons (top-right): edit `index.html` → header `main-nav`
- Hero CTA order: `index.html` → inside the hero `cta-group`

## 6) Pages overview
- `index.html`: Main dashboard (Hero, Overview, header CTAs)
- `problems.html`: Explore challenges (search, filters)
- `community.html`: Join community + sample contact
- `ai.html`: Vibrant AI chat UI (OpenRouter)
- `portal.html`: Role selection + Firebase login/signup

## 7) Troubleshooting
- Chatbot doesn't answer:
  - Check internet access to `openrouter.ai`
  - Verify `OPENROUTER_API_KEY` in `chatbot/config.js`
- Firebase auth errors:
  - Ensure Email/Password is enabled
  - Check your `firebaseConfig` values
  - Open DevTools → Console for error messages
- Static file paths:
  - If you see CORS/file errors, run a local server (see step 2)

## 8) Production notes
- Do not ship frontend-embedded API keys. Use a small server proxy to call OpenRouter safely.
- Set Firebase security rules to protect Firestore data.
- Consider bundling assets and setting proper caching headers.

You're set. Start with `index.html` → use "AI Chatbot" (top-right), "Try CRM Demo", and "Enter Portal" to test all the flows.

## 9) ZOHO CRM Integration
The platform now includes comprehensive ZOHO CRM integration for healthcare customer relationship management.

### CRM Features
- **Lead Management**: Capture and track potential patients and partners
- **Patient Relationship Management**: 360-degree patient view with communication history
- **Healthcare Analytics**: Patient acquisition, retention, and satisfaction metrics
- **Appointment Integration**: Seamless connection with patient scheduling system

### CRM Configuration
- File: `chatbot/zoho-crm-config.js`
- Update the configuration with your ZOHO CRM credentials:
  ```js
  CLIENT_ID: 'your_zoho_client_id_here',
  CLIENT_SECRET: 'your_zoho_client_secret_here',
  REDIRECT_URI: 'https://your-domain.com/oauth/callback',
  ```

### CRM Demo
- Access the interactive demo at `zoho-crm-demo.html`
- Test lead creation, contact management, and analytics
- Simulate CRM operations without actual ZOHO CRM connection

### CRM Integration Points
- **Main Dashboard**: CRM overview section with feature highlights
- **Admin Dashboard**: Lead management, patient analytics, and CRM operations
- **Patient Dashboard**: Appointment history and communication logs
- **Doctor Dashboard**: Patient analytics and follow-up management

### Production CRM Setup
- For production CRM, implement proper OAuth 2.0 flow with secure token storage
- Set up webhook endpoints for real-time data synchronization
- Configure proper error handling and retry mechanisms
- Implement role-based access control for CRM operations
