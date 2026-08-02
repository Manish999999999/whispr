from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
from database import get_db
from auth import require_moderator_or_admin

router = APIRouter(prefix="/api/moderation", tags=["moderation"])

@router.get("/flagged")
def get_flagged_posts(db: Session = Depends(get_db), current_user: models.User = Depends(require_moderator_or_admin)):
    # Pulling from the flagged_posts_view which is essentially a view
    # But for SQLAlchemy we can just execute the raw SQL or use models if we mapped the view.
    # We will use raw SQL to execute the view.
    result = db.execute(models.text("SELECT * FROM flagged_posts_view")).fetchall()
    # Convert to dict
    posts = [dict(row._mapping) for row in result]
    return posts

@router.post("/posts/{id}/remove")
def remove_post(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_moderator_or_admin)):
    post = db.query(models.Post).filter(models.Post.post_id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.status = 'removed'
    log_entry = models.ModerationLog(post_id=id, action='removed', moderator_id=current_user.user_id)
    db.add(log_entry)
    db.commit()
    return {"message": "Post removed successfully"}
