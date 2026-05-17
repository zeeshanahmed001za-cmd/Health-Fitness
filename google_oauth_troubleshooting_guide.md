# Google OAuth 2.0 Mismatch Error - Troubleshooting & Fix Guide

This guide will help you resolve the Google OAuth 2.0 error you are experiencing:
> **Error:** "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy. If you're the app developer, register the JavaScript origin in the Google Cloud Console."

---

## Why is this happening on your hosted site?
For security, Google restricts the URLs (origins) that are allowed to trigger login requests using your Google Client ID (`76587571141-4p9aop2m40l43b9bvnk2lt5bgm3g838a.apps.googleusercontent.com`).

If your project is hosted on a live URL (e.g., `https://your-app-name.vercel.app` or `https://yourdomain.com`), and you try to log in, Google blocks the request because your **live production domain** is not listed in the **Authorized JavaScript Origins** section of the Google Cloud Console for this Client ID.

Below are the steps to add your live hosted URL.

---

### Option 1: You have access to the Google Developer Account
If you (or your team) created this client ID in the Google Cloud Console, follow these steps to add your live hosted domain:

1. **Open Google Cloud Console**:
   Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. **Select the Project**:
   Select the correct project name from the top-left dropdown (next to the Google Cloud logo).
3. **Edit Your OAuth Client**:
   * Look under the **OAuth 2.0 Client IDs** list.
   * Locate the client ID matching yours (specifically, Web Application type).
   * Click the **pencil icon (Edit)** on the right side of the row.
4. **Update Authorized JavaScript Origins**:
   * Scroll down to the **Authorized JavaScript origins** section.
   * Click **+ Add URI**.
   * Add your live frontend domain (without trailing slash `/`). For example:
     * `https://your-app-name.vercel.app`
     * `https://yourdomain.com`
5. **Update Authorized Redirect URIs**:
   * Scroll down to **Authorized redirect URIs**.
   * Click **+ Add URI**.
   * Add:
     * `https://your-app-name.vercel.app`
     * `https://your-app-name.vercel.app/`
6. **Save Changes**:
   * Scroll to the bottom and click **Save**.
7. **Test**:
   > [!IMPORTANT]
   > It takes **2 to 5 minutes** for Google's servers to apply the new domains. Make sure to **hard-refresh** your browser (press `Ctrl + F5` or open in an Incognito window) to clear cached Google login scripts before testing.

---

### Option 2: You don't have access to this Google Account (Create a new client ID)
If you did not create the Google Client ID `76587571141-4p9aop2m40l43b9bvnk2lt5bgm3g838a.apps.googleusercontent.com`, you cannot edit it. You must create your own Google Developer credentials for your live domain:

#### Step A: Create a new Client ID
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. **Create a New Project**:
   * Click the project dropdown at the top and select **New Project**.
   * Name it `Health & Fitness Tracker` and click **Create**.
3. **Configure the OAuth Consent Screen**:
   * Search for **OAuth consent screen** in the top search bar and click it.
   * Select **External** and click **Create**.
   * Fill out the mandatory fields (App name, User support email, Developer email).
   * Click **Save and Continue** until you are back to the dashboard.
4. **Create Credentials**:
   * Go to the **Credentials** tab on the left sidebar.
   * Click **+ Create Credentials** at the top and select **OAuth client ID**.
   * Select **Application type**: `Web application`.
   * Under **Authorized JavaScript origins**, click **+ Add URI** and enter:
     * `https://your-app-name.vercel.app` (your live site)
     * `http://localhost:5173` (for local development testing)
   * Under **Authorized redirect URIs**, click **+ Add URI** and enter:
     * `https://your-app-name.vercel.app`
     * `https://your-app-name.vercel.app/`
     * `http://localhost:5173`
   * Click **Create** and copy the new **Client ID**.

---

#### Step B: Update your deployment environment variables
Once you have your own Client ID:
1. Go to your hosting dashboard (e.g., **Vercel** or **Netlify** project settings).
2. Go to the **Environment Variables** tab.
3. Update or create:
   * `VITE_GOOGLE_CLIENT_ID` (for frontend) with your new client ID.
   * `GOOGLE_CLIENT_ID` (for backend) with your new client ID.
4. **Re-deploy** your application so the new environment variables are built into your frontend assets and updated in your backend server.
