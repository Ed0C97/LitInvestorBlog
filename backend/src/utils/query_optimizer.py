"""
Query optimization utilities for Rio Capital Blog
Fornisce query ottimizzate per casi d'uso comuni
"""
from sqlalchemy.orm import joinedload, selectinload
from src.extensions import db


class OptimizedQueries:
    """Collezione di query ottimizzate per performance"""
    
    @staticmethod
    def get_published_articles_with_relations(limit=20, offset=0):
        """
        Ottiene articoli pubblicati con relazioni pre-caricate
        Evita N+1 query problem
        """
        from src.models.article import Article
        
        return Article.query\
            .filter_by(published=True)\
            .options(
                joinedload(Article.author),
                joinedload(Article.category),
                selectinload(Article.comments)
            )\
            .order_by(Article.created_at.desc())\
            .limit(limit)\
            .offset(offset)\
            .all()
    
    @staticmethod
    def get_article_by_slug_optimized(slug):
        """
        Ottiene singolo articolo con tutte le relazioni
        Ottimizzato per la pagina dettaglio
        """
        from src.models.article import Article
        
        return Article.query\
            .filter_by(slug=slug, published=True)\
            .options(
                joinedload(Article.author),
                joinedload(Article.category),
                selectinload(Article.comments).joinedload('user'),
                selectinload(Article.favorites)
            )\
            .first()
    
    @staticmethod
    def get_featured_articles(limit=5):
        """Ottiene articoli in evidenza"""
        from src.models.article import Article
        
        return Article.query\
            .filter_by(published=True, featured=True)\
            .options(
                joinedload(Article.author),
                joinedload(Article.category)
            )\
            .order_by(Article.created_at.desc())\
            .limit(limit)\
            .all()
    
    @staticmethod
    def get_articles_by_category_optimized(category_id, limit=20, offset=0):
        """Ottiene articoli per categoria con paginazione"""
        from src.models.article import Article
        
        return Article.query\
            .filter_by(category_id=category_id, published=True)\
            .options(
                joinedload(Article.author),
                joinedload(Article.category)
            )\
            .order_by(Article.created_at.desc())\
            .limit(limit)\
            .offset(offset)\
            .all()
    
    @staticmethod
    def get_user_favorites_optimized(user_id, limit=20):
        """Ottiene articoli preferiti dell'utente"""
        from src.models.favorite import Favorite
        
        return Favorite.query\
            .filter_by(user_id=user_id)\
            .options(
                joinedload('article').joinedload('author'),
                joinedload('article').joinedload('category')
            )\
            .order_by(Favorite.created_at.desc())\
            .limit(limit)\
            .all()
    
    @staticmethod
    def get_comments_for_article_threaded(article_id):
        """
        Ottiene commenti per articolo con struttura gerarchica
        Ottimizzato per rendering threaded
        """
        from src.models.comment import Comment
        
        # Carica tutti i commenti in una query
        all_comments = Comment.query\
            .filter_by(article_id=article_id, status='approved')\
            .options(joinedload(Comment.user))\
            .order_by(Comment.created_at.asc())\
            .all()
        
        # Organizza in struttura gerarchica
        comment_dict = {c.id: c for c in all_comments}
        root_comments = []
        
        for comment in all_comments:
            if comment.parent_id is None:
                root_comments.append(comment)
            else:
                parent = comment_dict.get(comment.parent_id)
                if parent:
                    if not hasattr(parent, 'replies'):
                        parent.replies = []
                    parent.replies.append(comment)
        
        return root_comments
    
    @staticmethod
    def get_dashboard_stats():
        """
        Ottiene statistiche per dashboard admin
        Una query efficiente invece di multiple queries
        """
        from src.models.article import Article
        from src.models.user import User
        from src.models.comment import Comment
        from sqlalchemy import func, case
        
        stats = db.session.query(
            func.count(Article.id).label('total_articles'),
            func.sum(case((Article.published == True, 1), else_=0)).label('published_articles'),
            func.count(func.distinct(User.id)).label('total_users'),
            func.count(Comment.id).label('total_comments'),
            func.sum(case((Comment.status == 'pending', 1), else_=0)).label('pending_comments')
        ).select_from(Article).outerjoin(User).outerjoin(Comment).first()
        
        return {
            'total_articles': stats.total_articles or 0,
            'published_articles': stats.published_articles or 0,
            'total_users': stats.total_users or 0,
            'total_comments': stats.total_comments or 0,
            'pending_comments': stats.pending_comments or 0
        }
    
    @staticmethod
    def search_articles_optimized(query, limit=20):
        """
        Ricerca articoli ottimizzata
        """
        from src.models.article import Article
        
        search = f"%{query}%"
        
        return Article.query\
            .filter(
                Article.published == True,
                db.or_(
                    Article.title.ilike(search),
                    Article.content.ilike(search),
                    Article.excerpt.ilike(search)
                )
            )\
            .options(
                joinedload(Article.author),
                joinedload(Article.category)
            )\
            .order_by(Article.created_at.desc())\
            .limit(limit)\
            .all()


# Esempio di utilizzo nelle route
"""
# Prima (N+1 problem):
@articles_bp.route('/list')
def list_articles():
    articles = Article.query.filter_by(published=True).all()
    return jsonify([{
        'title': a.title,
        'author': a.author.username,  # Query separata per ogni articolo!
        'category': a.category.name    # Altra query separata!
    } for a in articles])

# Dopo (ottimizzato):
@articles_bp.route('/list')
def list_articles():
    from src.utils.query_optimizer import OptimizedQueries
    
    page = request.args.get('page', 1, type=int)
    per_page = 20
    offset = (page - 1) * per_page
    
    articles = OptimizedQueries.get_published_articles_with_relations(
        limit=per_page,
        offset=offset
    )
    
    return jsonify([{
        'title': a.title,
        'author': a.author.username,   # Nessuna query aggiuntiva!
        'category': a.category.name    # Già caricato!
    } for a in articles])
"""
