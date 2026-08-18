# 🚀 Step-by-Step Guide: Deploying Personal Money Manager to Koyeb (100% Free)

This guide walks you through deploying **Personal Money Manager** (Laravel 11 + Inertia React) live on **Koyeb** with a free **Supabase** PostgreSQL database.

---

## 🛠️ Step 1: Get a Free Database (Supabase)

1. Go to [Supabase.com](https://supabase.com) and click **Start your project** (Sign up with GitHub).
2. Click **New Project** and choose a name (e.g. `money-manager-db`).
3. Set a strong database password and select a region close to you.
4. Once created, go to **Project Settings** $\rightarrow$ **Database** $\rightarrow$ **Connection String**.
5. Copy your connection details:
   - `DB_HOST` (e.g., `db.xxxx.supabase.co`)
   - `DB_PORT` (`5432`)
   - `DB_DATABASE` (`postgres`)
   - `DB_USERNAME` (`postgres`)
   - `DB_PASSWORD` (Your password)

---

## 🐙 Step 2: Push Your Code to GitHub

1. Make sure all changes are committed and pushed to your GitHub repository:
   ```bash
   git add .
   git commit -m "Add Koyeb Dockerfile and deployment setup"
   git push origin main
   ```

---

## ⚡ Step 3: Deploy on Koyeb

1. Go to [Koyeb.com](https://app.koyeb.com) and log in with GitHub.
2. Click **Create Service**.
3. Choose **GitHub** as the deployment source and select your `Personal-Money-Manager` repository.
4. Under **Builder**, select **Dockerfile** (it will automatically pick up the Dockerfile we created).
5. Scroll down to **Environment Variables** and add the following keys:

| Environment Variable | Value |
| :--- | :--- |
| `APP_NAME` | `Personal Money Manager` |
| `APP_ENV` | `production` |
| `APP_KEY` | Generate one using `php artisan key:generate --show` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://your-app.koyeb.app` (Will be assigned by Koyeb) |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | `db.xxxx.supabase.co` (From Supabase) |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | `postgres` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | `your_supabase_password` |
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | `nobleultron@gmail.com` |
| `MAIL_PASSWORD` | `ohbsixlueyuaugni` |
| `MAIL_ENCRYPTION` | `tls` |
| `MAIL_FROM_ADDRESS` | `nobleultron@gmail.com` |

6. Click **Deploy**.

---

## 🎉 Step 4: Access Your Live App!

Koyeb will build the Docker container, run migrations automatically, and give you a free HTTPS live web link like:
`https://personal-money-manager-yourusername.koyeb.app`

Enjoy your 100% free, always-on Personal Money Manager! 🚀
