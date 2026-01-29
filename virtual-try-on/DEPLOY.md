# Deployment Guide for Virtual Try-On App

This project is built with **Next.js**, which makes it extremely easy to deploy both the frontend and the backend (API routes) together on **Vercel**.

## Option 1: Vercel (Recommended & Free)

Vercel provides a generous free tier that supports Next.js features out of the box, including the API routes we used for the proxy backend.

### Prerequisites
1. A [GitHub](https://github.com/) account.
2. A [Vercel](https://vercel.com/) account (you can sign up with GitHub).

### Steps

1.  **Push your code to GitHub**
    *   Create a new repository on GitHub.
    *   Run the following commands in your terminal to push your local code:
        ```bash
        git add .
        git commit -m "Ready for deployment"
        git branch -M main
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
        git push -u origin main
        ```

2.  **Import into Vercel**
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New..."** -> **"Project"**.
    *   Select your GitHub repository and click **"Import"**.

3.  **Configure Environment Variables (Crucial!)**
    *   In the "Configure Project" screen, look for the **"Environment Variables"** section.
    *   Add the following variable:
        *   **Key**: `HF_ACCESS_TOKEN`
        *   **Value**: `your_hugging_face_token_here` (Use your actual token starting with `hf_...`)
    *   *Note: Without this, the backend will fail to connect to Hugging Face.*

4.  **Deploy**
    *   Click **"Deploy"**.
    *   Wait a minute or two. Vercel will build your app and provide you with a live URL (e.g., `https://your-project.vercel.app`).

---

## Option 2: Netlify (Alternative)

Netlify is another great free option that supports Next.js.

1.  Push your code to GitHub (same as above).
2.  Log in to Netlify and click **"Add new site"** -> **"Import an existing project"**.
3.  Connect to GitHub and select your repo.
4.  In **"Site settings"** / **"Environment variables"**, add `HF_ACCESS_TOKEN`.
5.  Click **"Deploy"**.

---

## Important Note on "Backend"

Your "backend" is actually built directly into this Next.js app (in the `src/app/api` folder). When you deploy to Vercel or Netlify, these API routes automatically become **Serverless Functions**.

You **do not** need a separate server (like AWS EC2, DigitalOcean, or Heroku) for this app. Vercel handles both the UI and the API logic in one place for free.
