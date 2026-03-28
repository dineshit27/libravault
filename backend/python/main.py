import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="LibraVault Analytics & AI Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        os.getenv("FRONTEND_URL", "*")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("WARNING: SUPABASE_URL or SUPABASE_SERVICE_KEY not set in environment.")
    supabase: Client = None
else:
    supabase: Client = create_client(url, key)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "lms-python-backend"}

@app.get("/api/py/recommendations/{user_id}")
def get_recommendations(user_id: str):
    """
    Mock endpoint for book recommendations based on user's reading history.
    This would typically run ML algorithms against the Supabase DB.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection missing")

    try:
        # Step 1: Get user's read books (genres)
        response = supabase.table('borrowals').select('book_id, books(genre_id)').eq('user_id', user_id).execute()
        
        # In a real scenario, we'd analyze this. For now, just return random highly rated books
        # that the user hasn't read yet.
        
        books_res = supabase.table('books').select('*').gte('average_rating', 4.0).limit(5).execute()
        
        return {
            "user_id": user_id,
            "recommended_books": books_res.data,
            "algorithm": "collaborative_filtering_mock"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
