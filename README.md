# CareerPilot PRO — Multi-Platform Job Finder & AI ATS Resume Doctor

A full-stack **MERN** (MongoDB, Express, React, Node.js) web application designed to help job seekers find high-quality tech roles across multiple global platforms with verified direct apply links, beat enterprise Applicant Tracking Systems (ATS), and utilize Groq AI (LLaMA-3.3 70B) for instant career acceleration.

---

## ✨ Core Features

### 1. 🌐 Multi-Platform Live Job Aggregator
- **Real-Time Job Scraping & Aggregation**: Fetches and unifies live job postings across top platforms including **RemoteOK**, **Arbeitnow (EU & Global)**, **Jobicy**, and **TechDirect** (Stripe, Figma, Linear, Anthropic, Supabase, Datadog).
- **Direct Apply Links**: Every position includes a verified direct link to the company's application page or portal.
- **Granular Filters**:
  - Search by keywords, job title, company, or tech stack
  - Filter by location (Remote, US, Europe, Worldwide, India, etc.)
  - Employment type (Full-time, Contract, Part-time, Internship)
  - Experience level (Junior, Mid-Level, Senior, Lead/Staff)
  - Minimum Annual Salary slider ($0k to $250k+)
  - Platform source filter
- **Flexible Sorting**:
  - Newest posted date
  - Highest salary ($$$ to $)
  - Lowest salary ($ to $$$)
  - Best AI ATS Candidate Match %
  - Alphabetical by company or job title

### 2. 📄 Resume Upload & Neural Extraction
- Drag-and-drop resume upload supporting **PDF**, **DOCX**, and **TXT** files (up to 10MB).
- Extracts contact info, headline, executive summary, categorized technical skills, work history, and education.
- Dual-mode extraction: Uses **Groq LLaMA-3.3 70B** when an API key is provided, or a built-in algorithmic natural language parser for immediate zero-config operation.

### 3. ✍️ Manual Career Profile Builder
- For users who prefer **not** to upload a resume file:
  - Form for personal details, contact links (LinkedIn, GitHub, Portfolio).
  - Categorized skill tags (Languages, Frameworks, Databases, Cloud & DevOps).
  - Interactive work experience editor with dynamic accomplishment bullets.
  - Education history.
  - 1-click **"Save Profile & Calculate ATS Score"** button that calculates your ATS diagnostic and unlocks AI match badges for all jobs.

### 4. 🩺 ATS Resume Doctor & Optimizer
- **Radial Score Gauge (0–100)**: Visualizes overall ATS pass rate with celebratory confetti on strong scores.
- **4 Diagnostic Pillars**:
  1. *Keyword Match & Relevance*
  2. *Quantifiable Impact & Metrics*
  3. *ATS Formatting & Parsability*
  4. *Skills Alignment to Target Role*
- **Actionable Fixes**: Identifies weak passive verbs, missing metrics, and missing high-demand keywords.
- **Google X-Y-Z Formula Bullet Rewriter**: Compares weak bullets against quantified, high-converting impact statements (*"Accomplished [X] as measured by [Y] by doing [Z]"*).
- **Interactive Bullet Point Enhancer**: Paste any sentence from your resume to enhance it into a power bullet with action verbs and metrics.

### 5. 🤖 Futuristic Groq AI Copilot Features
- **Job-to-Candidate Match & Gap Analysis**: Displays matching skills, missing technologies, and strategic preparation advice for each role.
- **1-Click Tailored AI Cover Letter**: Generates tailored, non-cliché cover letters connecting your past achievements directly to the job requirements with customizable tones (Enthusiastic, Executive, Technical) and download options.
- **AI Interview Prep Copilot**: Generates role-specific technical and behavioral questions with model STAR answers (Situation, Task, Action, Result) and insightful questions to ask the interviewer.
- **Groq API Key Manager**: Built-in modal with live connection test (`https://api.groq.com`).

### 6. 📊 Job Application Pipeline Tracker
- Track applications across stages: **Applied**, **Interviewing**, **Offer Received**, and **Archived**.
- Track direct apply dates, salaries, locations, and personal notes.
- Option to manually track custom external applications.

### 7. 🎨 Bespoke Human UI/UX Design
- **No generic AI gradients or dark blue cliches**: Styled in an executive obsidian charcoal (`#0E1114`) and forest emerald (`#10B981`) palette with warm amber highlights.
- Smooth transitions, micro-interactions, responsive mobile layout, and light/dark mode switcher.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS Design System, Lucide Icons, Canvas-Confetti
- **Backend**: Node.js, Express, Multer, PDF-Parse, Mammoth, Axios, Cheerio
- **Database**: Dual-mode persistence — connects to MongoDB via Mongoose or uses zero-config persistent JSON storage.
- **AI Engine**: Groq Cloud API (LLaMA-3.3 70B Versatile & LLaMA-3.1 8B Instant)

---

## 🚀 Getting Started

### 1. Backend Server
```bash
cd server
npm install
node src/index.js
```
The server will run on `http://localhost:5000`.

### 2. Frontend Client
```bash
cd client
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open `http://localhost:5173` in your browser.

### 3. Adding Your Groq API Key
1. Click **"Enter Groq Key"** in the top navigation bar.
2. Paste your Groq API key (starts with `gsk_...`).
3. Click **"Test Connection"** to verify, then click **"Save Key"**.
*(Note: The app is fully usable even before adding a key, using smart algorithmic heuristics!)*

---

## 🌐 Deploy to Render

CareerPilot is pre-configured for 1-click deployment on [Render](https://render.com) as a unified fullstack Node web service.

- Infrastructure Blueprint: [`render.yaml`](./render.yaml)
- Step-by-step instructions: [`RENDER_DEPLOYMENT.md`](./RENDER_DEPLOYMENT.md)
- Build command: `npm run render-build`
- Start command: `npm start`
- Health check path: `/api/health`

