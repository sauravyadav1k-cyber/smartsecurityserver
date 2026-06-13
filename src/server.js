require("dotenv").config();

const cors = require("cors");
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const app = express();
const port = Number(process.env.PORT || 3000);
const alertApiKey = process.env.ALERT_API_KEY;
const requiredMailEnv = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = process.env.SMTP_SECURE
  ? String(process.env.SMTP_SECURE).toLowerCase() === "true"
  : smtpPort === 465;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 5
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image attachments are allowed"));
      return;
    }

    callback(null, true);
  }
});

const transporter = createMailTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure
});

const fallbackTransporter = createMailTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false
});

function createMailTransport({ host, port, secure }) {
  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    family: 4,
    name: "smartsecurity-backend",
    tls: {
      minVersion: "TLSv1.2"
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const mailOptionsBase = {
  from: process.env.SMTP_FROM || process.env.SMTP_USER
};

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "smartsecurity-backend",
    mailConfigured: missingMailEnv().length === 0
  });
});

app.post("/api/security-alert", upload.array("attachments", 5), async (request, response) => {
  try {
    if (!alertApiKey || request.header("X-API-Key") !== alertApiKey) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const missing = missingMailEnv();
    if (missing.length > 0) {
      console.error(`Missing mail environment variables: ${missing.join(", ")}`);
      response.status(500).json({ error: "Email service is not configured" });
      return;
    }

    const to = String(request.body.to || "").trim();
    const subject = String(request.body.subject || "Smart Security Alert").trim();
    const text = String(request.body.text || "Noise detected by SmartSecurity.").trim();

    if (!to || !to.includes("@")) {
      response.status(400).json({ error: "Valid recipient email is required" });
      return;
    }

    const files = request.files || [];
    if (files.length === 0) {
      response.status(400).json({ error: "At least one photo attachment is required" });
      return;
    }

    const mailOptions = {
      ...mailOptionsBase,
      to,
      subject,
      text,
      attachments: files.map((file, index) => ({
        filename: file.originalname || `alert_photo_${index + 1}${extensionFor(file.mimetype)}`,
        content: file.buffer,
        contentType: file.mimetype
      }))
    };

    await sendMailWithFallback(mailOptions);

    response.json({ ok: true, sent: true, attachments: files.length });
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: "Failed to send alert email",
      code: error.code || "EMAIL_SEND_FAILED",
      detail: safeErrorMessage(error)
    });
  }
});

app.use((error, _request, response, _next) => {
  response.status(400).json({ error: error.message || "Bad request" });
});

app.listen(port, () => {
  console.log(`SmartSecurity backend running on http://localhost:${port}`);
});

function extensionFor(mimetype) {
  const extension = mimetype && mimetype.split("/")[1];
  return extension ? `.${extension}` : ".jpg";
}

function missingMailEnv() {
  return requiredMailEnv.filter((name) => !process.env[name]);
}

async function sendMailWithFallback(mailOptions) {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    if (!shouldTryFallback(error)) {
      throw error;
    }

    console.warn(`Primary SMTP failed (${error.code || error.message}); trying Gmail STARTTLS fallback`);
    await fallbackTransporter.sendMail(mailOptions);
  }
}

function shouldTryFallback(error) {
  return ["ETIMEDOUT", "ECONNECTION", "ESOCKET"].includes(error.code);
}

function safeErrorMessage(error) {
  const message = String(error && error.message ? error.message : "");
  return message
    .replace(String(process.env.SMTP_PASS || ""), "[hidden]")
    .replace(String(process.env.ALERT_API_KEY || ""), "[hidden]");
}
