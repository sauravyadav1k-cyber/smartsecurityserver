# SmartSecurity Backend

This backend receives alert photos from the Android app and emails them to the user.

## Local Setup

1. Install Node.js.
2. Open this folder in a terminal:

   `C:\Users\saura\OneDrive\Desktop\ticcopy\smartsecurity-backend`

3. Install dependencies:

   `npm install`

4. Copy `.env.example` to `.env` and fill in your mail details.

5. Start the server:

   `npm start`

## Android API URL

If testing on the Android emulator, use:

`http://10.0.2.2:3000/api/security-alert`

If testing on a real phone, use your computer's local network IP:

`http://YOUR_COMPUTER_IP:3000/api/security-alert`

Your Android request must include this header:

`X-API-Key: same value as ALERT_API_KEY`

## Online Hosting

The backend is ready to host on services that run Node web apps, including Render, Railway, Heroku-style hosts, and any Docker/Node host that respects `PORT`.

### Render

1. Push the `smartsecurity-backend` folder to GitHub.
2. In Render, create a new Web Service from that repo.
3. Use these settings:

   - Build command: `npm ci`
   - Start command: `npm start`
   - Health check path: `/health`

4. Add these environment variables in the Render dashboard:

   - `ALERT_API_KEY`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`

5. After deploy, open:

   `https://YOUR-RENDER-SERVICE.onrender.com/health`

   A working deploy returns JSON with `ok: true`. If `mailConfigured` is `false`, one or more SMTP environment variables are missing.

### Railway or Heroku-style Hosts

This repo includes a `Procfile`, so platforms that use Procfiles can start it with:

`web: npm start`

Set the same environment variables listed above. Do not upload `.env` to the host.

## Android Hosted API URL

After hosting, use the public HTTPS endpoint:

`https://YOUR-HOST-NAME/api/security-alert`

For example:

`https://smartsecurity-backend.onrender.com/api/security-alert`

The Android app must keep sending:

`X-API-Key: same value as ALERT_API_KEY on the host`

## Gmail Note

For Gmail, do not use your normal password. Create a Gmail App Password and put it in `SMTP_PASS`.
