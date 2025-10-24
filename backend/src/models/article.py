# LitInvestorBlog-backend/src/models/article.py

from datetime import datetime
from src.extensions import db
from flask import session
from sqlalchemy import event

from src.models.like import ArticleLike
from src.utils.file_helpers import delete_article_folder

class Article(db.Model):
    __tablename__ = "article"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.String(500), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    published = db.Column(db.Boolean, default=False, index=True)
    published_at = db.Column(db.DateTime, nullable=True, default=None)
    featured = db.Column(db.Boolean, default=False, nullable=False)
    likes_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    show_author_contacts = db.Column(db.Boolean, nullable=False, default=False)

    author = db.relationship("User", back_populates="articles")
    category = db.relationship("Category", back_populates="articles")
    comments = db.relationship("Comment", back_populates="article")
    likes = db.relationship("ArticleLike", back_populates="article")
    favorites = db.relationship("ArticleFavorite", back_populates="article")
    shares = db.relationship("Share", back_populates="article")

    # Indici composti per query comuni
    __table_args__ = (
        db.Index('idx_published_created', 'published', 'created_at'),
        db.Index('idx_category_published', 'category_id', 'published'),
    )

    def __repr__(self):
        return f"<Article {self.title}>"

    def to_dict(self):
        from src.models.comment import Comment
        
        user_has_liked = False
        if "user_id" in session:
            user_has_liked = db.session.query(
                ArticleLike.query.filter_by(
                    user_id=session["user_id"], article_id=self.id
                ).exists()
            ).scalar()
        
        # Conta TUTTI i commenti approvati (top-level + risposte)
        comments_count = Comment.query.filter_by(
            article_id=self.id, 
            status="approved"
        ).count()

        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "content": self.content,
            "excerpt": self.excerpt,
            "image_url": self.image_url,
            "author_id": self.author_id,
            "author_name": (
                self.author.to_dict().get("full_name") if self.author else None
            ),
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "category_color": self.category.color if self.category else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "published": self.published,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "likes_count": self.likes_count,
            "views_count": self.views_count,
            "comments_count": comments_count,
            "show_author_contacts": self.show_author_contacts,
            "author_email": self.author.email if self.author else None,
            "author_linkedin_url": self.author.linkedin_url if self.author else None,
            "user_has_liked": user_has_liked,
        }


@event.listens_for(Article, 'before_delete')
def receive_before_delete(mapper, connection, target):
    """
    Prima che un articolo venga cancellato, salva il suo slug nella sessione di SQLAlchemy.
    """
    # Usiamo _cleanup_slugs per non interferire con altre variabili di sessione.
    if '_cleanup_slugs' not in db.session.info:
        db.session.info['_cleanup_slugs'] = []

    # Aggiungi lo slug alla lista delle cartelle da cancellare
    db.session.info['_cleanup_slugs'].append(target.slug)


@event.listens_for(db.session, 'after_commit')
def receive_after_commit(session):
    """
    Dopo che la transazione del database è stata completata con successo,
    procedi con la cancellazione delle cartelle.
    """
    if '_cleanup_slugs' in session.info and session.info['_cleanup_slugs']:
        for slug in session.info['_cleanup_slugs']:
            delete_article_folder(slug)
        # Svuota la lista per la prossima transazione
        session.info['_cleanup_slugs'].clear()