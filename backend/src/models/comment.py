# LitInvestorBlog-backend/src/models/comment.py

from datetime import datetime
from src.extensions import db

class Comment(db.Model):
    __tablename__ = "comment"
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey("article.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("comment.id"), nullable=True)
    
    status = db.Column(db.String(20), default="pending")  # pending, approved, rejected
    reported = db.Column(db.Boolean, default=False)
    moderation_reason = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    article = db.relationship("Article", back_populates="comments")
    user = db.relationship("User", back_populates="comments")
    
    # Self-referential relationship for threading (parent-child)
    replies = db.relationship(
        "Comment",
        backref=db.backref("parent", remote_side=[id]),
        lazy="dynamic"
    )
    
    # Relationship with likes
    likes = db.relationship("CommentLike", back_populates="comment", cascade="all, delete-orphan")
    
    # Relationship with reports
    reports = db.relationship("CommentReport", back_populates="comment", cascade="all, delete-orphan")

    def to_dict(self, include_replies=False, current_user_id=None):
        # Count likes
        likes_count = len(self.likes)
        
        # Check if current user liked this comment
        user_liked = False
        if current_user_id:
            user_liked = any(like.user_id == current_user_id for like in self.likes)
        
        data = {
            "id": self.id,
            "content": self.content,
            "article_id": self.article_id,
            "user_id": self.user_id,
            "parent_id": self.parent_id,
            "status": self.status,
            "reported": self.reported,
            "moderation_reason": self.moderation_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user": {
                "id": self.user.id,
                "username": self.user.username,
                "avatar_url": self.user.avatar_url,
                "role": self.user.role
            } if self.user else None,
            "likes_count": likes_count,
            "user_liked": user_liked,
        }
        
        if include_replies:
            # Get approved replies only (unless user is admin)
            approved_replies = self.replies.filter_by(status="approved").all()
            data["replies"] = [reply.to_dict(include_replies=False, current_user_id=current_user_id) 
                              for reply in approved_replies]
            data["replies_count"] = len(approved_replies)
        
        return data


class CommentLike(db.Model):
    __tablename__ = "comment_like"
    
    id = db.Column(db.Integer, primary_key=True)
    comment_id = db.Column(db.Integer, db.ForeignKey("comment.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint("comment_id", "user_id", name="unique_comment_like"),
    )

    # Relationships
    comment = db.relationship("Comment", back_populates="likes")
    user = db.relationship("User", back_populates="comment_likes")

    def to_dict(self):
        return {
            "id": self.id,
            "comment_id": self.comment_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CommentReport(db.Model):
    __tablename__ = "comment_report"
    
    id = db.Column(db.Integer, primary_key=True)
    comment_id = db.Column(db.Integer, db.ForeignKey("comment.id"), nullable=False)
    reporter_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    reason = db.Column(db.String(100), nullable=False)  # inappropriate_content, spam, harassment, etc.
    additional_info = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default="pending")  # pending, reviewed, dismissed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint("comment_id", "reporter_id", name="unique_comment_report"),
    )

    # Relationships
    comment = db.relationship("Comment", back_populates="reports")
    reporter = db.relationship("User", foreign_keys=[reporter_id])

    def to_dict(self):
        return {
            "id": self.id,
            "comment_id": self.comment_id,
            "reporter_id": self.reporter_id,
            "reason": self.reason,
            "additional_info": self.additional_info,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
