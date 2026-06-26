# ResumeForge — ATS-Friendly Resume Builder

ResumeForge is a full-stack, high-performance resume builder designed specifically to create **ATS-friendly** resumes. 

Unlike builders that render resumes into image-based PDFs (which are unreadable by automated applicant tracking filters), ResumeForge uses native browser rendering stylesheets to generate **fully searchable, text-selectable vector PDFs** with clean formatting and structure.

## Tech Stack
* **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + React Router
* **Backend**: Node.js + Express
* **Database**: SQLite (Zero-config, self-contained local database file)
* **Auth**: Custom JWT-based Email/Password authentication

---

## Folder Structure

```
resumeForage/
├── backend/          # Node.js + Express API server & SQLite DB
└── frontend/         # React + Vite + Tailwind SPA
```

---

## Setup Instructions

### Prerequisites
* **Node.js**: Make sure you have [Node.js](https://nodejs.org/) installed (v16+ recommended).
* **Ollama**: To power the local AI features (resume polishing & ATS suggestions), download and install [Ollama](https://ollama.com/).

### 1. Run Ollama (Local AI Engine)
1. Ensure Ollama is installed and running on your system.
2. In your terminal, pull and start the model (the default model is `llama3`):
   ```bash
   ollama run llama3
   ```
   *(Note: Keep this process/terminal running. Ollama will run by default on `http://localhost:11434`)*

### 2. Run the Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Initialize the environment variables:
   * A default `.env` file has already been created for you with default configurations.
   * Customize ports, secret key, or Ollama settings in `.env` if desired:
     ```env
     PORT=5000
     JWT_SECRET=super_secret_resume_forge_jwt_key_12345!
     OLLAMA_HOST=http://localhost:11434
     OLLAMA_MODEL=llama3
     ```
4. Start the server:
   ```bash
   npm run dev
   ```
   * The server runs on `http://localhost:5000`
   * The SQLite database file will automatically initialize at `backend/database.sqlite`

### 3. Run the Frontend Client
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Initialize the environment variables:
   * A default `.env` file pointing to `http://localhost:5000/api` is already created.
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * The client runs on `http://localhost:5173`

---

## Key Features

### 1. Split-Screen Builder
* Live Preview updates instantly as you fill in details.
* Collapse/Accordion forms make it easy to focus on one section at a time.
* Dynamically add/remove multiple experiences, education entries, projects, and certifications.
* Tag-based chip inputs for technical skills.

### 2. Templates Page
Includes 3 professional templates:
* **Classic**: Traditional academic styling with centered header.
* **Modern**: Sleek asymmetric typography with custom header grid.
* **Minimal**: Compact monospace styled resume ideal for tech and short CVs.

### 3. PDF Generation (ATS-Friendly)
* The **Download PDF** button triggers the browser's high-quality print engine.
* Our `@media print` rules hide the editing interface, toolbars, and dashboard layout, rendering only the clean, black-and-white A4 layout.
* **Why this is critical for ATS**: Converting HTML to an image first (like `html2canvas` + `jspdf`) destroys the text layer, making the resume completely unreadable by ATS parsers. Browser printing preserves raw searchable text, fonts, and clean layout structures, guaranteeing 100% ATS compatibility.

### 4. Local AI Assistance (Ollama)
* **AI suggestion & polishing**: Shorten or rewrite your professional summary, job experience description, or project details on-the-fly. Choose between technical focus, concise/shortened sentences, or formal/polished styles.
* **ATS Keyword Suggested Helper**: Analyze your entire resume context, work history, and target role to generate 12 highly relevant and missing skill keywords that help pass automatic recruiter filters.
