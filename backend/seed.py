import os
import bcrypt
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed_db():
    db = SessionLocal()

    # 1. Categories
    categories = ['Academics', 'Relationships', 'Campus Life', 'Funny', 'Other']
    for cat_name in categories:
        if not db.query(models.Category).filter_by(name=cat_name).first():
            db.add(models.Category(name=cat_name))
    db.commit()

    # 2. Users (5 users, mix of roles)
    users_data = [
        {"handle": "student1", "email": "s1@test.com", "role": "student"},
        {"handle": "student2", "email": "s2@test.com", "role": "student"},
        {"handle": "student3", "email": "s3@test.com", "role": "student"},
        {"handle": "mod1", "email": "m1@test.com", "role": "moderator"},
        {"handle": "admin1", "email": "a1@test.com", "role": "admin"}
    ]
    
    salt = bcrypt.gensalt()
    pw_hash = bcrypt.hashpw('password123'.encode('utf-8'), salt).decode('utf-8')

    user_objs = []
    for u in users_data:
        db_u = db.query(models.User).filter_by(email=u["email"]).first()
        if not db_u:
            db_u = models.User(handle=u["handle"], email=u["email"], password_hash=pw_hash, role=u["role"])
            db.add(db_u)
            db.commit()
            db.refresh(db_u)
        user_objs.append(db_u)

    # 3. Posts (~15 posts)
    # We will create one specific post to be flagged heavily to trigger the auto-moderation.
    posts_data = [
        {"cat_id": 1, "uid": user_objs[0].user_id, "content": "I skipped class to play video games all week."},
        {"cat_id": 2, "uid": user_objs[1].user_id, "content": "I have a crush on my TA."},
        {"cat_id": 3, "uid": user_objs[2].user_id, "content": "The dining hall food is suspiciously good today."},
        {"cat_id": 4, "uid": user_objs[0].user_id, "content": "I tripped on the stairs and played it off like a dance move."},
        {"cat_id": 1, "uid": user_objs[1].user_id, "content": "This DBMS project is going to be the end of me."},
        {"cat_id": 5, "uid": user_objs[2].user_id, "content": "Anyone else hear that weird noise near the library at 2am?"},
        {"cat_id": 2, "uid": user_objs[0].user_id, "content": "I accidentally swiped left on my soulmate."},
        {"cat_id": 3, "uid": user_objs[1].user_id, "content": "Campus parking is a scam."},
        {"cat_id": 4, "uid": user_objs[2].user_id, "content": "I thought the professor waved at me, but it was someone behind me."},
        {"cat_id": 1, "uid": user_objs[0].user_id, "content": "Failed my midterm, time to change majors."},
        {"cat_id": 5, "uid": user_objs[1].user_id, "content": "Hot take: 8am classes should be illegal."},
        {"cat_id": 2, "uid": user_objs[2].user_id, "content": "We broke up but we're in the same group project. Send help."},
        {"cat_id": 3, "uid": user_objs[0].user_id, "content": "The library is way too cold."},
        {"cat_id": 4, "uid": user_objs[1].user_id, "content": "I just saw a squirrel steal a slice of pizza."},
        {"cat_id": 5, "uid": user_objs[2].user_id, "content": "THIS POST IS SPAM AND TERRIBLE!!"} # Target for flagging
    ]

    post_objs = []
    for p in posts_data:
        new_post = models.Post(user_id=p["uid"], category_id=p["cat_id"], content=p["content"])
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        post_objs.append(new_post)

    # 4. Comments (~30 comments)
    for i in range(30):
        post = post_objs[i % len(post_objs)]
        user = user_objs[i % len(user_objs)]
        db.add(models.Comment(post_id=post.post_id, user_id=user.user_id, content=f"Comment {i+1} on this post!"))
    db.commit()

    # 5. Votes (~40 votes)
    for i in range(40):
        post = post_objs[i % len(post_objs)]
        user = user_objs[(i * 3) % len(user_objs)]
        # Use raw SQL or try/except for integrity error on unique constraint
        try:
            vote = models.Vote(post_id=post.post_id, user_id=user.user_id, vote_type="up" if i % 2 == 0 else "down")
            db.add(vote)
            db.commit()
        except:
            db.rollback()

    # 6. Flags (trigger auto-moderation)
    target_post = post_objs[-1] # The spam post
    for i in range(5):
        # 5 different users flag the same post
        user = user_objs[i % len(user_objs)]
        flag = models.Flag(post_id=target_post.post_id, reporter_id=user.user_id, reason="Spam")
        db.add(flag)
    db.commit()
    
    print("Database seeded successfully! Post auto-moderation should have triggered on the last post.")
    db.close()

if __name__ == "__main__":
    seed_db()
