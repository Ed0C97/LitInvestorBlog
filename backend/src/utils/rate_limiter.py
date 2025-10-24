"""
Rate Limiting Configuration for Rio Capital Blog
Protegge l'applicazione da abuso e brute force attacks
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request
import os


def get_rate_limit_key():
    """
    Determina la chiave per rate limiting
    Usa IP address o user ID se autenticato
    """
    from flask_login import current_user
    
    # Se utente autenticato, usa user ID
    if current_user.is_authenticated:
        return f"user_{current_user.id}"
    
    # Altrimenti usa IP
    return get_remote_address()


def init_limiter(app):
    """
    Inizializza Flask-Limiter con configurazione appropriata
    """
    
    # Determina storage backend
    storage_uri = app.config.get('RATELIMIT_STORAGE_URL')
    
    if not storage_uri:
        # Fallback to in-memory storage for development
        if app.debug:
            storage_uri = "memory://"
            app.logger.warning(
                "Rate limiting using in-memory storage. "
                "For production, configure REDIS_URL in .env"
            )
        else:
            # Production deve usare Redis
            storage_uri = os.getenv('REDIS_URL', 'redis://localhost:6379/1')
    
    limiter = Limiter(
        app=app,
        key_func=get_rate_limit_key,
        default_limits=["1000 per day", "200 per hour"],
        storage_uri=storage_uri,
        strategy="fixed-window",  # o "moving-window" per più accuracy
        headers_enabled=True,  # Aggiunge header X-RateLimit-*
    )
    
    # Custom error handler
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return {
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.',
            'retry_after': e.description
        }, 429
    
    return limiter


# Decorators pre-configurati per casi comuni
class RateLimits:
    """Limiti pre-configurati per diversi tipi di endpoint"""
    
    # Authentication endpoints
    LOGIN = "5 per minute"  # Molto restrittivo per prevenire brute force
    REGISTER = "3 per hour"  # Limita creazione account fake
    PASSWORD_RESET = "3 per hour"
    
    # Public endpoints
    API_READ = "100 per minute"  # Lettura articoli, etc.
    API_WRITE = "30 per minute"  # Creazione contenuti
    
    # User-generated content
    COMMENT = "10 per hour"  # Prevenire spam
    CONTACT_FORM = "5 per hour"
    NEWSLETTER = "2 per hour"
    
    # Admin endpoints
    ADMIN = "200 per minute"  # Più permissivo per admin
    
    # Upload endpoints
    FILE_UPLOAD = "10 per hour"
    
    # Search
    SEARCH = "30 per minute"


# Esempio di utilizzo nelle route:
"""
from src.extensions import limiter
from src.utils.rate_limiter import RateLimits

@auth_bp.route('/login', methods=['POST'])
@limiter.limit(RateLimits.LOGIN)
def login():
    # Login logic
    pass

@articles_bp.route('/list')
@limiter.limit(RateLimits.API_READ)
def list_articles():
    # List logic
    pass

@comments_bp.route('/create', methods=['POST'])
@limiter.limit(RateLimits.COMMENT)
def create_comment():
    # Comment logic
    pass
"""
