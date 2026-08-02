# Whispr - Anonymous Campus Confession Board

## Setup Instructions

1. **Database Requirements:**
   - PostgreSQL (Local or Cloud like Supabase).
   - Ensure you have executed `schema.sql` on your database instance to create the tables, triggers, and views.

2. **Backend Setup:**
   - Navigate to the `backend` directory.
   - Set up a virtual environment: `python -m venv venv`
   - Activate it: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
   - Install dependencies: `pip install -r requirements.txt`
   - Create a `.env` file in the `backend` directory (or export it):
     ```
     DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_db
     SECRET_KEY=your_super_secret_key_for_jwt
     ```
   - Seed the database: `python seed.py`
   - Run the API: `uvicorn main:app --reload` (Runs on http://localhost:8000)

3. **Frontend Setup:**
   - Navigate to the `frontend` directory.
   - Install packages: `npm install`
   - Run the React app: `npm run dev`

## ERD Generation
To generate an Entity Relationship Diagram (ERD), you can use [dbdiagram.io](https://dbdiagram.io). 
Simply copy the contents of `schema.sql` and paste them into their SQL importer (or rewrite them into DBML format). The raw PostgreSQL DDL we've written works perfectly with many modern ERD tools!
