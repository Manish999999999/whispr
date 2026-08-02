from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from routers import auth_router, posts_router, moderation_router

app = FastAPI(title="Whispr API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(posts_router.router)
app.include_router(moderation_router.router)

@app.get("/api/trending")
def get_trending(db = Depends(posts_router.get_db)):
    result = db.execute(posts_router.models.text("SELECT * FROM trending_posts_view LIMIT 20")).fetchall()
    return [dict(row._mapping) for row in result]
