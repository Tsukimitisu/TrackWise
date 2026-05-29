# TrackWise

Local development run instructions

Backend (Laravel):

1. Ensure XAMPP MySQL is running and database `trackwise` exists. Update `backend/.env` accordingly.
   For local Vite on ports 5173 or 5174, use:

```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5174
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost:5174,127.0.0.1:5174
```

   For immediate local registration testing, write verification and reset links to Laravel logs:

```
MAIL_MAILER=log
MAIL_FROM_ADDRESS=no-reply@trackwise.test
MAIL_FROM_NAME=TrackWise
```

   For real email delivery, switch `MAIL_MAILER=smtp` and provide valid `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION`, and `MAIL_FROM_ADDRESS` values.

2. From project backend folder:

```powershell
cd backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan config:clear
# Use XAMPP PHP to serve if needed:
& 'C:\xampp\php\php.exe' 'C:\Users\revil\Desktop\TrackWise\backend\artisan' serve --host=127.0.0.1 --port=8000
```

Frontend (Vite + React):

1. Configure API base in `frontend/.env` or use `frontend/.env.example`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

2. Install and run:

```powershell
cd frontend
npm install
npm run dev
```

Confirm the backend is at `http://127.0.0.1:8000` and the frontend dev URL from Vite.

Seeded demo accounts use the `DEMO_PASSWORD` environment variable if set, otherwise a secure password is generated and displayed when running the seeder:

| Role | Email |
|---|---|
| Super Admin | `superadmin@trackwise.test` |
| Organization Admin | `orgadmin@trackwise.test` |
| Coordinator | `coordinator@trackwise.test` |
| Supervisor | `supervisor@trackwise.test` |
| Student | `student@trackwise.test` |
| Viewer | `viewer@trackwise.test` |
