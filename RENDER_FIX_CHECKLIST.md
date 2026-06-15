# Render Fix Checklist

Your Android app (`security-app2`) talks to:

- URL: `https://smartsecurity-backend-onzu.onrender.com/api/security-alert`
- API key: `$sauravyadav123`

After deploying the updated backend, set these **exact** values in the Render dashboard for `smartsecurity-backend-onzu`:

| Variable | Value |
|---|---|
| `ALERT_API_KEY` | `$sauravyadav123` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | your Gmail App Password (16 chars, no spaces) |
| `SMTP_FROM` | `SmartSecurity <your_email@gmail.com>` |

## Gmail App Password (required)

If email still fails with `535 BadCredentials`, create a new App Password:

1. Open https://myaccount.google.com/apppasswords
2. Turn on 2-Step Verification if it is off.
3. Create a new App Password for "Mail".
4. Copy the 16-character password (remove spaces).
5. Paste it into Render as `SMTP_PASS`.

## Verify deployment

Open:

`https://smartsecurity-backend-onzu.onrender.com/health`

You want:

```json
{
  "ok": true,
  "mailConfigured": true,
  "smtpVerified": true
}
```

If `smtpVerified` is `false`, read `smtpError` — it usually means the Gmail app password is wrong or expired.

## Android app settings

In `security-app2/local.properties` these must match Render:

```properties
SMARTSECURITY_BACKEND_URL=https://smartsecurity-backend-onzu.onrender.com/api/security-alert
SMARTSECURITY_BACKEND_API_KEY=$sauravyadav123
```

Rebuild the app after changing `local.properties` (Build > Rebuild Project).

## Test without waiting for noise

Use the **Capture Test** button in the app. It takes photos and uploads them immediately.
