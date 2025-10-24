"""
Security middleware for Rio Capital Blog
Gestisce headers di sicurezza e protezioni varie
"""
from flask import Response
from functools import wraps
from flask_login import current_user


def add_security_headers(response: Response) -> Response:
    """
    Aggiunge security headers a tutte le risposte HTTP
    
    Args:
        response: Flask response object
        
    Returns:
        Response con headers di sicurezza aggiunti
    """
    # Content Security Policy
    # Definisce da dove possono essere caricati script, stili, immagini, etc.
    csp_directives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.stripe.com",
        "frame-src 'self' https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ]
    response.headers['Content-Security-Policy'] = "; ".join(csp_directives)
    
    # Previene MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # Previene clickjacking
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    
    # XSS Protection (legacy, ma ancora supportato)
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Referrer Policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Permissions Policy (ex Feature-Policy)
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    
    return response


def add_hsts_header(response: Response, is_production: bool) -> Response:
    """
    Aggiunge HTTP Strict Transport Security header solo in produzione
    
    Args:
        response: Flask response object
        is_production: True se in produzione
        
    Returns:
        Response con HSTS header se in produzione
    """
    if is_production:
        # Force HTTPS per 1 anno, includi subdomain
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    return response


def require_admin(f):
    """
    Decorator per proteggere route che richiedono permessi admin
    
    Usage:
        @app.route('/admin/users')
        @login_required
        @require_admin
        def admin_users():
            return "Admin only"
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return {'error': 'Authentication required'}, 401
        
        if current_user.role != 'admin':
            return {'error': 'Admin privileges required'}, 403
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_author_or_admin(f):
    """
    Decorator per route che richiedono permessi author o admin
    
    Usage:
        @app.route('/articles/create')
        @login_required
        @require_author_or_admin
        def create_article():
            return "Authors and Admins only"
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return {'error': 'Authentication required'}, 401
        
        if current_user.role not in ['author', 'admin']:
            return {'error': 'Author or Admin privileges required'}, 403
        
        return f(*args, **kwargs)
    
    return decorated_function


def sanitize_filename(filename: str) -> str:
    """
    Sanitizza nome file per prevenire path traversal
    
    Args:
        filename: Nome file originale
        
    Returns:
        Nome file sanitizzato
    """
    import re
    from werkzeug.utils import secure_filename
    
    # Rimuovi caratteri pericolosi
    filename = secure_filename(filename)
    
    # Rimuovi path traversal attempts
    filename = filename.replace('..', '').replace('/', '').replace('\\', '')
    
    # Limita lunghezza
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1)
        filename = name[:250] + '.' + ext
    
    return filename


def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
    """
    Valida estensione file
    
    Args:
        filename: Nome del file
        allowed_extensions: Set di estensioni permesse (es: {'png', 'jpg', 'jpeg'})
        
    Returns:
        True se estensione valida
    """
    if '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in allowed_extensions


class RateLimitExceeded(Exception):
    """Exception sollevata quando rate limit è superato"""
    pass
