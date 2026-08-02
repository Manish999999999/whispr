from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import exc
from pydantic import BaseModel
from typing import Optional, List
import models
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/api/posts", tags=["posts"])

class PostCreate(BaseModel):
    category_id: int
    content: str

class CommentCreate(BaseModel):
    content: str

class VoteCreate(BaseModel):
    vote_type: str

class FlagCreate(BaseModel):
    reason: str
    comment_id: Optional[int] = None

@router.get("")
def get_posts(category_id: Optional[int] = None, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    query = db.query(models.Post).filter(models.Post.status == "active")
    if category_id:
        query = query.filter(models.Post.category_id == category_id)
    posts = query.order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts

@router.post("")
def create_post(post: PostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_post = models.Post(
        user_id=current_user.user_id,
        category_id=post.category_id,
        content=post.content
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.get("/{id}")
def get_post(id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.post_id == id, models.Post.status == "active").first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/{id}/vote")
def vote_post(id: int, vote: VoteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if vote.vote_type not in ["up", "down"]:
        raise HTTPException(status_code=400, detail="Invalid vote type")
    
    new_vote = models.Vote(post_id=id, user_id=current_user.user_id, vote_type=vote.vote_type)
    try:
        db.add(new_vote)
        db.commit()
    except exc.IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Already voted on this post")
    return {"message": "Vote recorded"}

@router.get("/{id}/comments")
def get_comments(id: int, db: Session = Depends(get_db)):
    comments = db.query(models.Comment).filter(models.Comment.post_id == id, models.Comment.status == "active").all()
    return comments

@router.post("/{id}/comments")
def create_comment(id: int, comment: CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_comment = models.Comment(
        post_id=id,
        user_id=current_user.user_id,
        content=comment.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.post("/{id}/flag")
def flag_post(id: int, flag: FlagCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_flag = models.Flag(
        post_id=id if not flag.comment_id else None,
        comment_id=flag.comment_id,
        reporter_id=current_user.user_id,
        reason=flag.reason
    )
    db.add(new_flag)
    db.commit()
    return {"message": "Flag reported"}
