# 🚀 Render Deployment Guide for CareerPilot PRO

This repository is optimized for deployment on [Render](https://render.com) as a high-performance, single-instance **Fullstack MERN Web Service**. 

In production, Express serves both:
1. **The Backend REST API** (under `/api/*`)
2. **The Production React Frontend** (built with Vite in `client/dist` and served with SPA client-side routing)

---

## 🔒 Security Best Practices Implemented

- **No Hardcoded Secrets**: All sensitive keys, connection strings, emails, and passwords are read strictly from environment variables (`process.env`).
- **Git Protection**: `.gitignore` files at the root and server levels prevent `.env`, `.env.local`, and sensitive credential files from ever being committed to GitHub.
- **Environment Template**: `.env.example` is provided as a clean reference with no sensitive data.

---

## 🛠️ Deployment Steps on Render

### Option 1: Render Blueprint (1-Click Automated Setup)

1. Push this repository to **GitHub** or **GitLab**:
   ```bash
   git init
   git add .
   git commit -m "Prepare CareerPilot for Render deployment"
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```
2. Log in to [dashboard.render.com](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Select your repository. Render will automatically read [`render.yaml`](./render.yaml).
5. Fill in the prompted secret environment variables (see below).
6. Click **Apply**. Render will run `npm run render-build` and start the server with `npm start`!

---

### Option 2: Manual Web Service Setup

If you prefer configuring the Web Service manually:

1. In the Render Dashboard, click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure the following service settings:
   - **Name**: `careerpilot-app` (or your preferred name)
   - **Region**: Nearest to your users (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main` (or `master`)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run render-build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: `Free`
4. Expand **Advanced** and set:
   - **Health Check Path**: `/api/health`

5. In the **Environment Variables** section, add the following variables:

| Key | Example / Description | Required? |
|---|---|---|
| `NODE_ENV` | `production` | **Yes** |
| `PORT` | `5000` (or leave to Render dynamic port) | Render sets this automatically |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/CareerPilot?retryWrites=true&w=majority` | **Yes** (or leave unset for local storage) |
| `JWT_SECRET` | `a_long_random_64_character_hex_string` | **Yes** |
| `GROQ_API_KEY` | `gsk_xxxxxxxxxxxxxxxxxxxxxx` | **Recommended** (for AI features) |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | Optional (defaults to `openai/gpt-oss-120b`) |
| `GROQ_FAST_MODEL` | `openai/gpt-oss-20b` | Optional (defaults to `openai/gpt-oss-20b`) |
| `BREVO_API_KEY` | `xkeysib-xxxxxxxxxxxxxxxxxxxx` | **Recommended** (for live OTP delivery) |
| `BREVO_SENDER_EMAIL`| `verified-email@yourdomain.com` | **Recommended** |
| `BREVO_SENDER_NAME` | `CareerPilot India` | Optional |
| `SMTP_HOST` | `smtp-relay.brevo.com` | Optional (fallback) |
| `SMTP_PORT` | `587` | Optional |
| `SMTP_USER` | `verified-email@yourdomain.com` | Optional |
| `SMTP_PASS` | `xsmtpsib-xxxxxxxxxxxxxxxxxxxx` | Optional |
| `SMTP_SECURE` | `false` | Optional |

6. Click **Create Web Service**.

---

## 🔍 Verification After Deployment

Once the build finishes:
1. Open your Render service URL (e.g. `https://careerpilot-app.onrender.com`).
2. You should see the sleek CareerPilot web interface loaded directly.
3. Test the health endpoint: `https://careerpilot-app.onrender.com/api/health`.
   It should return:
   ```json
   {
     "status": "online",
     "timestamp": "...",
     "service": "Job Finder AI & Multi-Platform Aggregator",
     "groqConfigured": true,
     "environment": "production"
   }
   ```
4. Test user registration or login OTP flow to confirm Brevo and MongoDB Atlas connectivity.

---

## 💡 Troubleshooting

- **MongoDB Atlas Network Access**: Ensure your MongoDB Atlas cluster allows connections from anywhere (`0.0.0.0/0`) under **Network Access** → **IP Access List**, as Render IP addresses are dynamic.
- **Brevo Sender Verification**: Ensure `BREVO_SENDER_EMAIL` is verified in your Brevo account dashboard under **Senders & IP**.
