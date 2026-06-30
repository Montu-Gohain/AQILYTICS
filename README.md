# Air Quality Monitoring and Pollution Trend Visualization Dashboard

A full-stack web application for monitoring air quality, visualizing pollution trends, analyzing AQI data, viewing hazardous air quality alerts, and generating short-term AQI forecasts.

This project is built as an MCA academic project using:

- **Frontend:** Next.js, TypeScript, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL running inside Docker
- **Data Source:** Simulated IoT sensor data for major Indian cities
- **Forecasting:** Moving average based short-term AQI prediction

---

## Project Overview

The **Air Quality Monitoring and Pollution Trend Visualization Dashboard** is designed to visualize pollution levels, Air Quality Index, and pollutant concentration trends across cities and time periods.

The system helps users monitor air quality data, understand pollutant trends, identify hazardous pollution levels, and view short-term AQI forecasts using an interactive web dashboard.

Currently, the project uses **simulated pollution data** generated through a backend seed script. The system architecture is designed in such a way that the simulated data source can later be replaced with real data from sources like OpenAQ, CPCB, WHO datasets, or IoT sensors.

---

## UI Screenshots

### UI in Dark Mode

Place your screenshot inside:

```bash
docs/screenshots/dark-mode.png
```

Then use:

```md
![Dark Mode UI](./docs/screenshots/dark-mode.png)
```

---

### UI in Light Mode

Place your screenshot inside:

```bash
docs/screenshots/light-mode.png
```

Then use:

```md
![Light Mode UI](./docs/screenshots/light-mode.png)
```

---

## Features

- Interactive air quality dashboard
- City-wise pollution data filtering
- Pollutant-wise filtering
- Date range filtering
- AQI trend visualization
- Pollutant concentration trend chart
- KPI cards for average AQI, peak AQI, safe days, hazardous days, and total records
- Hazardous air quality alert visualization
- Short-term AQI forecasting
- Forecast line chart and bar chart
- Recent measurements table
- Multi-city AQI comparison support
- CSV export functionality
- Responsive UI for desktop, tablet, and mobile
- Dark mode and light mode UI support
- PostgreSQL relational database
- Docker-based PostgreSQL setup
- Simulated IoT sensor data generation

---

## Technologies Used

### Frontend

| Technology   | Purpose                                                          |
| ------------ | ---------------------------------------------------------------- |
| Next.js      | React framework for building frontend application                |
| TypeScript   | Type safety and better development experience                    |
| Tailwind CSS | Utility-first CSS framework for modern UI                        |
| Recharts     | Chart library for line charts, bar charts, and comparison charts |
| React Hooks  | State management and API data handling                           |

### Backend

| Technology | Purpose                                     |
| ---------- | ------------------------------------------- |
| Node.js    | JavaScript runtime environment              |
| Express.js | Backend REST API framework                  |
| PostgreSQL | Relational database                         |
| pg         | PostgreSQL client for Node.js               |
| dotenv     | Environment variable management             |
| cors       | Allows frontend to communicate with backend |
| helmet     | Adds basic security headers                 |
| morgan     | HTTP request logging                        |
| nodemon    | Development server auto-restart             |

### Database and DevOps

| Technology     | Purpose                                            |
| -------------- | -------------------------------------------------- |
| Docker         | Containerized PostgreSQL setup                     |
| Docker Compose | Manage PostgreSQL service easily                   |
| PostgreSQL     | Store location-wise and time-series pollution data |

---

## Project Folder Structure

```bash
air-quality-dashboard/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── alertController.js
│   │   │   ├── cityController.js
│   │   │   ├── forecastController.js
│   │   │   ├── kpiController.js
│   │   │   ├── measurementController.js
│   │   │   └── pollutantController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── alertRoutes.js
│   │   │   ├── cityRoutes.js
│   │   │   ├── forecastRoutes.js
│   │   │   ├── kpiRoutes.js
│   │   │   ├── measurementRoutes.js
│   │   │   └── pollutantRoutes.js
│   │   │
│   │   ├── scripts/
│   │   │   └── seedMeasurements.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   │
│   ├── .env.local
│   ├── .gitignore
│   └── package.json
│
├── database/
│   └── schema.sql
│
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

Before running the project locally, make sure you have the following installed:

- Node.js
- npm
- Docker Desktop
- Git
- A code editor such as VS Code

Check Node.js and npm versions:

```bash
node -v
npm -v
```

Check Docker:

```bash
docker -v
docker compose version
```

---

# Local Project Setup

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd air-quality-dashboard
```

---

## 2. Create PostgreSQL Database Using Docker

Create a `docker-compose.yml` file in the root folder:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: aqi_postgres
    restart: always
    environment:
      POSTGRES_USER: aqi_user
      POSTGRES_PASSWORD: aqi_password
      POSTGRES_DB: aqi_dashboard
    ports:
      - "5432:5432"
    volumes:
      - aqi_postgres_data:/var/lib/postgresql/data

volumes:
  aqi_postgres_data:
```

Start PostgreSQL:

```bash
docker compose up -d
```

Check if the PostgreSQL container is running:

```bash
docker ps
```

Expected container name:

```bash
aqi_postgres
```

---

## 3. PostgreSQL Port Conflict Note

If PostgreSQL is already installed locally on your system and port `5432` is busy, you may get an error like:

```bash
bind: address already in use
```

You have two options.

### Option 1: Stop local PostgreSQL

On macOS with Homebrew:

```bash
brew services stop postgresql@17
```

Then start Docker again:

```bash
docker compose up -d
```

### Option 2: Use Docker PostgreSQL on port 5433

Change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```

Then update your backend `.env` file:

```env
DATABASE_URL=postgresql://aqi_user:aqi_password@localhost:5433/aqi_dashboard
```

---

## 4. Create Database Schema

Create a folder:

```bash
mkdir database
```

Create a file:

```bash
touch database/schema.sql
```

Add the following schema:

```sql
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS measurements CASCADE;
DROP TABLE IF EXISTS pollutants CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS etl_logs CASCADE;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pollutants (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    description TEXT
);

CREATE TABLE measurements (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    pollutant_id INTEGER NOT NULL REFERENCES pollutants(id) ON DELETE CASCADE,
    value DECIMAL(10, 2) NOT NULL,
    measured_at TIMESTAMP NOT NULL,
    source VARCHAR(100) DEFAULT 'Simulated Data',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_measurement UNIQUE(location_id, pollutant_id, measured_at)
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    measurement_id INTEGER REFERENCES measurements(id) ON DELETE SET NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE etl_logs (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(100),
    status VARCHAR(50),
    records_processed INTEGER DEFAULT 0,
    message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_measurements_location_time
ON measurements(location_id, measured_at);

CREATE INDEX idx_measurements_pollutant_time
ON measurements(pollutant_id, measured_at);

CREATE INDEX idx_measurements_time
ON measurements(measured_at);

INSERT INTO locations (city, state, country, latitude, longitude)
VALUES
('Delhi', 'Delhi', 'India', 28.6139, 77.2090),
('Mumbai', 'Maharashtra', 'India', 19.0760, 72.8777),
('Bengaluru', 'Karnataka', 'India', 12.9716, 77.5946),
('Guwahati', 'Assam', 'India', 26.1445, 91.7362),
('Kolkata', 'West Bengal', 'India', 22.5726, 88.3639);

INSERT INTO pollutants (code, name, unit, description)
VALUES
('AQI', 'Air Quality Index', 'index', 'Overall air quality index'),
('PM2.5', 'Particulate Matter 2.5', 'µg/m³', 'Fine particulate matter'),
('PM10', 'Particulate Matter 10', 'µg/m³', 'Coarse particulate matter'),
('CO', 'Carbon Monoxide', 'mg/m³', 'Carbon monoxide concentration'),
('NO2', 'Nitrogen Dioxide', 'µg/m³', 'Nitrogen dioxide concentration'),
('SO2', 'Sulfur Dioxide', 'µg/m³', 'Sulfur dioxide concentration'),
('O3', 'Ozone', 'µg/m³', 'Ground-level ozone concentration'),
('TEMP', 'Temperature', '°C', 'Temperature reading'),
('HUMIDITY', 'Humidity', '%', 'Relative humidity');
```

Run the schema inside the Docker PostgreSQL container:

```bash
docker exec -i aqi_postgres psql -U aqi_user -d aqi_dashboard < database/schema.sql
```

Verify tables:

```bash
docker exec -it aqi_postgres psql -U aqi_user -d aqi_dashboard
```

Inside PostgreSQL:

```sql
\dt
```

Exit PostgreSQL:

```sql
\q
```

---

# Backend Setup

## 1. Go to Backend Folder

```bash
cd backend
```

If the backend folder does not exist, create it:

```bash
mkdir backend
cd backend
```

---

## 2. Initialize Backend

```bash
npm init -y
```

---

## 3. Install Backend Packages

```bash
npm install express cors dotenv pg helmet morgan
npm install -D nodemon
```

### Backend Package Usage

| Package | Usage                                             |
| ------- | ------------------------------------------------- |
| express | Creates REST API server                           |
| cors    | Enables frontend-backend communication            |
| dotenv  | Loads environment variables                       |
| pg      | Connects Node.js backend to PostgreSQL            |
| helmet  | Adds security-related HTTP headers                |
| morgan  | Logs API requests in development                  |
| nodemon | Restarts backend automatically during development |

---

## 4. Backend Environment Variables

Create a `.env` file inside the `backend` folder:

```bash
touch .env
```

Add:

```env
PORT=5050
DATABASE_URL=postgresql://aqi_user:aqi_password@localhost:5432/aqi_dashboard
```

If your Docker PostgreSQL is running on port `5433`, use:

```env
PORT=5050
DATABASE_URL=postgresql://aqi_user:aqi_password@localhost:5433/aqi_dashboard
```

---

## 5. Backend Scripts

In `backend/package.json`, add:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "seed": "node src/scripts/seedMeasurements.js"
}
```

---

## 6. Generate Simulated Pollution Data

The project currently uses simulated IoT sensor data.

The seed script generates hourly pollution readings for the following cities:

- Delhi
- Mumbai
- Bengaluru
- Guwahati
- Kolkata

It generates data for:

- AQI
- PM2.5
- PM10
- CO
- NO2
- SO2
- O3
- Temperature
- Humidity

Run the seed command:

```bash
npm run seed
```

Expected output:

```bash
Starting measurement seed...
Measurement seed completed.
Processed records: ...
```

This inserts simulated time-series pollution data into the PostgreSQL `measurements` table.

It also creates alerts automatically when AQI levels cross poor or hazardous thresholds.

---

## 7. Start Backend Server

```bash
npm run dev
```

Expected output:

```bash
PostgreSQL database connected successfully
Database time: ...
Backend server running on http://localhost:5050
```

---

# Backend API Routes

## Base URL

```bash
http://localhost:5050/
```

---

## Health Check

```bash
GET http://localhost:5050/api/health
```

Used to check whether the backend and PostgreSQL database connection are working.

---

## Cities

```bash
GET http://localhost:5050/api/cities
```

Returns all available cities stored in the `locations` table.

---

## Pollutants

```bash
GET http://localhost:5050/api/pollutants
```

Returns all available pollutant types stored in the `pollutants` table.

---

## Measurements

```bash
GET http://localhost:5050/api/measurements?city=Delhi&pollutant=AQI&limit=10
```

Returns pollution measurements based on city, pollutant, date range, and limit.

Example with date range:

```bash
GET http://localhost:5050/api/measurements?city=Delhi&pollutant=PM2.5&start=2026-06-01&end=2026-06-30&limit=300
```

Supported query parameters:

| Parameter | Description                             |
| --------- | --------------------------------------- |
| city      | City name                               |
| pollutant | Pollutant code such as AQI, PM2.5, PM10 |
| start     | Start date                              |
| end       | End date                                |
| limit     | Number of records to return             |

---

## KPI Data

```bash
GET http://localhost:5050/api/kpis?city=Delhi
```

Returns calculated KPIs such as:

- Average AQI
- Peak AQI
- Peak pollution time
- Safe days
- Hazardous days
- Total records

Example with date range:

```bash
GET http://localhost:5050/api/kpis?city=Delhi&start=2026-06-01&end=2026-06-30
```

---

## Forecast

```bash
GET http://localhost:5050/api/forecast?city=Delhi&hours=24
```

Returns short-term AQI prediction using a moving average forecasting method.

---

## Alerts

```bash
GET http://localhost:5050/api/alerts?city=Delhi
```

Returns AQI alerts generated from high AQI values.

---

# Frontend Setup

## 1. Go to Frontend Folder

From the root folder:

```bash
cd frontend
```

If the frontend does not exist yet, create it:

```bash
npx create-next-app@latest frontend --ts --eslint --tailwind --app --src-dir --import-alias "@/*"
cd frontend
```

---

## 2. Install Frontend Packages

```bash
npm install recharts
```

Next.js already includes React and React DOM.

### Frontend Package Usage

| Package     | Usage                         |
| ----------- | ----------------------------- |
| next        | Frontend framework            |
| react       | UI library                    |
| react-dom   | React DOM rendering           |
| typescript  | Type checking                 |
| tailwindcss | Styling                       |
| eslint      | Code linting                  |
| recharts    | Charts and data visualization |

---

## 3. Frontend Environment Variables

Create `.env.local` inside the `frontend` folder:

```bash
touch .env.local
```

Add:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5050/api
```

---

## 4. Start Frontend Server

```bash
npm run dev
```

Frontend runs at:

```bash
http://localhost:3000
```

---

# Running the Full Project Locally

Open three terminals.

---

## Terminal 1: Start PostgreSQL Docker Container

From root folder:

```bash
docker compose up -d
```

---

## Terminal 2: Start Backend

```bash
cd backend
npm run dev
```

Backend URL:

```bash
http://localhost:5050
```

---

## Terminal 3: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend URL:

```bash
http://localhost:3000
```

---

# Full Setup Flow From Scratch

Use this when setting up the project for the first time:

```bash
# 1. Clone project
git clone <your-repository-url>
cd air-quality-dashboard

# 2. Start PostgreSQL with Docker
docker compose up -d

# 3. Create database schema
docker exec -i aqi_postgres psql -U aqi_user -d aqi_dashboard < database/schema.sql

# 4. Install backend dependencies
cd backend
npm install

# 5. Create backend .env
echo "PORT=5050" > .env
echo "DATABASE_URL=postgresql://aqi_user:aqi_password@localhost:5432/aqi_dashboard" >> .env

# 6. Generate simulated data
npm run seed

# 7. Start backend
npm run dev

# 8. Open a new terminal and install frontend dependencies
cd ../frontend
npm install

# 9. Create frontend .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:5050/api" > .env.local

# 10. Start frontend
npm run dev
```

---

# How the Data Works

The project uses a relational database design.

## Main Tables

### locations

Stores city information:

- City
- State
- Country
- Latitude
- Longitude

### pollutants

Stores pollutant metadata:

- AQI
- PM2.5
- PM10
- CO
- NO2
- SO2
- O3
- Temperature
- Humidity

### measurements

Stores actual time-series pollution readings.

Each measurement is connected to:

- A location
- A pollutant
- A value
- A timestamp
- A data source

### alerts

Stores alerts generated when AQI values cross unhealthy thresholds.

### etl_logs

Reserved for tracking future ETL jobs.

---

# Simulated Data Explanation

Currently, this project does not use real-time CPCB or OpenAQ data.

Instead, it uses simulated IoT sensor data created by:

```bash
backend/src/scripts/seedMeasurements.js
```

The seed script creates pollution values based on city-wise AQI patterns.

For example:

- Delhi has a higher base AQI
- Mumbai has a medium base AQI
- Bengaluru and Guwahati have comparatively lower AQI values
- Morning and evening hours receive extra pollution boost to simulate traffic peak hours

This makes the dashboard useful for demonstrating:

- Location-wise pollution monitoring
- Time-series AQI trends
- Pollutant filtering
- KPI calculation
- Hazardous alert visualization
- Forecast generation
- Multi-city comparison

---

# Forecasting Method

The forecast API uses a simple **moving average** method.

It takes recent AQI values and predicts upcoming AQI values for the next selected number of hours.

Example:

```bash
http://localhost:5050/api/forecast?city=Delhi&hours=24
```

The response contains predicted AQI values for the next 24 hours.

---

# Testing the Backend APIs

You can test backend APIs using browser, Postman, or curl.

## Health Check

```bash
curl http://localhost:5050/api/health
```

## Cities

```bash
curl http://localhost:5050/api/cities
```

## Pollutants

```bash
curl http://localhost:5050/api/pollutants
```

## Measurements

```bash
curl "http://localhost:5050/api/measurements?city=Delhi&pollutant=AQI&limit=10"
```

## KPI Data

```bash
curl "http://localhost:5050/api/kpis?city=Delhi"
```

## Forecast

```bash
curl "http://localhost:5050/api/forecast?city=Delhi&hours=24"
```

## Alerts

```bash
curl "http://localhost:5050/api/alerts?city=Delhi"
```

---

# Git Ignore Files

Create separate `.gitignore` files for frontend and backend.

## backend/.gitignore

```gitignore
node_modules/
.env
.env.local
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
dist/
build/
coverage/
tmp/
temp/
.vscode/
.idea/
.DS_Store
Thumbs.db
```

## frontend/.gitignore

```gitignore
node_modules/
.next/
out/
build/
dist/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.tsbuildinfo
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.vercel/
.vscode/
.idea/
.DS_Store
Thumbs.db
```

---

# Important Notes

- The backend runs on port `5050`.
- The frontend runs on port `3000`.
- PostgreSQL runs inside Docker on port `5432`.
- If port `5432` is already occupied, use port `5433` for Docker PostgreSQL.
- The current pollution data is simulated data, not live real-world pollution data.
- The system architecture supports replacing simulated data with real APIs later.
- Do not commit `.env` or `.env.local` files to GitHub.

---

# Future Enhancements

- Integrate real OpenAQ API data
- Add CPCB data integration
- Add real-time cron-based ETL pipeline
- Add user authentication
- Add admin dashboard
- Add map-based city visualization
- Add advanced forecasting models such as ARIMA or LSTM
- Add email/SMS alerts for hazardous AQI levels
- Add downloadable PDF reports
- Deploy frontend on Vercel
- Deploy backend on Render, Railway, or AWS
- Use managed PostgreSQL such as Supabase, Neon, or AWS RDS

---

# Developer

**Montu Gohain**

Course: MCA
Enrollment No: 024MCA110131
Project: Air Quality Monitoring and Pollution Trend Visualization Dashboard
