# TrackWise

Local development run instructions

Backend (Laravel):

1. Ensure XAMPP MySQL is running and database `trackwise` exists. Update `backend/.env` accordingly.

2. From project backend folder:

```powershell
cd backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
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
