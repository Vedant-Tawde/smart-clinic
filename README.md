# SmartClinic

AI-powered real-time patient queue optimization system for small and mid-sized clinics.

## Project location

The project lives in: **`smart-clinic`** (with a hyphen).

```bash
cd /Users/atulitkrishnanst/smart-clinic   # or wherever you cloned it
```

## Tech Stack

- **Backend:** FastAPI, Python, SQLAlchemy, PostgreSQL, Redis
- **Frontend:** React, Vite, Tailwind CSS
- **Features:** JWT auth, WebSocket live queue, AI predictions (mock), queue optimizer

## Quick Start (Local)

### 1. Install Postgres & Redis

```bash
# macOS
brew install postgresql@16 redis
brew services start postgresql@16 redis

# Ubuntu
sudo apt install postgresql redis-server
sudo systemctl start postgresql redis-server
```

### 2. Create database

```bash
cd smart-clinic
./setup-db.sh
# Or manually:
# createdb smartclinic
# Or: psql -U postgres -c "CREATE DATABASE smartclinic;"
```

### 3. Backend

```bash
cd smart-clinic/backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend (new terminal)

```bash
cd smart-clinic/frontend
npm install
npm run dev
```

- **App:** http://localhost:5173
- **API:** http://localhost:8000
- **Login:** admin@smartclinic.local / admin123

## Docker

```bash
docker compose up --build
# App: http://localhost:3000
```

## Project Structure

```
smart-clinic/
├── backend/          # FastAPI app
├── frontend/         # React + Vite
├── docker-compose.yml
└── README.md
```
