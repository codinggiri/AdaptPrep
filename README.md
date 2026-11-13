# AdaptPrep

AdaptPrep is a full-stack, AI-driven technical interview preparation platform designed to help candidates practice coding problems, receive real-time evaluations, and track their progress through adaptive workflows.

---

## Features
- **AI-Powered Evaluation:** Integrates Google Gemini LLM APIs via custom prompt-engineering pipelines to deliver dynamic code evaluation and real-time feedback.
- **Interactive Code Editor:** Embedded Monaco editor integration with real-time syntax handling and optimized client-side performance.
- **Secure Authentication & Sessions:** User authentication powered by Google OAuth (Passport.js) and secure backend session management.
- **Automated Notifications:** Transactional email service integration via the Brevo API for user alerts and communications.
- **Automated CI/CD Workflows:** Seamless deployments and automated builds hosted on Vercel (frontend) and Render (backend).

---

## Tech Stack

### **Frontend**
* React.js (Vite)
* JavaScript (ES6+)
* HTML5 / CSS3 / Tailwind CSS
* Monaco Editor

### **Backend & Database**
* Node.js & Express.js
* MongoDB Atlas & Mongoose
* Passport.js (Google OAuth)
* Brevo API (Transactional Emails)
* Google Gemini API

### **Deployment & Tooling**
* Frontend Hosting: Vercel
* Backend Hosting: Render
* Version Control: Git & GitHub
* API Testing: Postman

---

## Project Structure

```text
adaptprep/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vercel.json
│
└── backend/
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   └── server.js
    ├── package.json
    └── .env.example


