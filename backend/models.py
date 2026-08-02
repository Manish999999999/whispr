from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    handle = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, server_default="student")
    created_at = Column(DateTime, server_default=text("now()"))

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class Post(Base):
    __tablename__ = "posts"

    post_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    category_id = Column(Integer, ForeignKey("categories.category_id"))
    content = Column(Text, nullable=False)
    status = Column(String, server_default="active")
    upvotes = Column(Integer, server_default="0")
    downvotes = Column(Integer, server_default="0")
    flag_count = Column(Integer, server_default="0")
    created_at = Column(DateTime, server_default=text("now()"))

class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    content = Column(Text, nullable=False)
    status = Column(String, server_default="active")
    created_at = Column(DateTime, server_default=text("now()"))

class Vote(Base):
    __tablename__ = "votes"

    vote_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    vote_type = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=text("now()"))

class Flag(Base):
    __tablename__ = "flags"

    flag_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"), nullable=True)
    comment_id = Column(Integer, ForeignKey("comments.comment_id"), nullable=True)
    reporter_id = Column(Integer, ForeignKey("users.user_id"))
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=text("now()"))

class ModerationLog(Base):
    __tablename__ = "moderation_log"

    log_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"))
    action = Column(String, nullable=False)
    moderator_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, server_default=text("now()"))
