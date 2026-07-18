# AWS Route53 Clone

A fully functional clone of the AWS Route53 web application built with Next.js and FastAPI. The focus of this project is on recreating the Route53 user experience and core workflows (managing Hosted Zones and DNS Records).

## Architecture Overview

This project consists of a decoupled frontend and backend:

- **Frontend:** Built with Next.js (TypeScript) and styled with Tailwind CSS to closely resemble the AWS Management Console UI.
- **Backend:** Built with FastAPI (Python) serving a RESTful JSON API.
- **Database:** SQLite with SQLAlchemy ORM for lightweight, persistent data storage.

### Core Features
- **Authentication:** Mocked JWT-based authentication (Login/Logout/Session persistence).
- **Hosted Zones:** Full CRUD functionality (Create, Read, Update, Delete) with search capabilities.
- **DNS Records:** Full CRUD functionality for records within a hosted zone, supporting common types (A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA).
- **Mocked AWS Services:** Placeholders for Dashboard, Traffic Policies, Health Checks, Resolver, and Profiles.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The API will run at http://127.0.0.1:8000*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The web app will run at http://localhost:3000*

### Accessing the Application
- Open http://localhost:3000 in your browser.
- **Demo Credentials:**
  - Email: `admin@route53.local`
  - Password: `admin123`

## Database Schema

The database consists of three main tables:

1. **Users**
   - `id` (Integer, Primary Key)
   - `email` (String, Unique)
   - `password` (String)

2. **HostedZones**
   - `id` (Integer, Primary Key)
   - `name` (String, Unique)
   - `zone_type` (String)
   - `description` (String, Nullable)
   - `private_zone` (Boolean)
   - `record_count` (Integer)
   - `created_at` (DateTime)

3. **DNSRecords**
   - `id` (Integer, Primary Key)
   - `zone_id` (Integer, Foreign Key)
   - `name` (String)
   - `record_type` (String)
   - `ttl` (Integer)
   - `value` (String)
   - `routing_policy` (String)
   - `created_at` (DateTime)

## API Overview

The FastAPI backend exposes the following REST endpoints:

### Authentication
- `POST /api/auth/login` - Authenticate user and receive JWT

### Hosted Zones
- `GET /api/zones` - List hosted zones (supports `?search=` query)
- `POST /api/zones` - Create a new hosted zone
- `GET /api/zones/{id}` - Get details of a specific hosted zone
- `PUT /api/zones/{id}` - Update a hosted zone
- `DELETE /api/zones/{id}` - Delete a hosted zone

### DNS Records
- `GET /api/zones/{id}/records` - List DNS records for a zone (supports `?search=` and `?record_type=` queries)
- `POST /api/zones/{id}/records` - Create a new DNS record in a zone
- `GET /api/records/{id}` - Get a specific DNS record
- `PUT /api/records/{id}` - Update a DNS record
- `DELETE /api/records/{id}` - Delete a DNS record

## Demo
A live hosted version of this application can be found here: [AWS Route53 Clone](https://aws-route53-clone-zeta.vercel.app/login)
