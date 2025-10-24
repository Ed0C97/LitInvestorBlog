"""
Redis Cache Implementation for Rio Capital Blog
Fornisce caching per query frequenti e session storage
"""
from functools import wraps
from flask import current_app
import redis
import json
import pickle
from datetime import timedelta


class RedisCache:
    """Wrapper per Redis con funzionalità di caching avanzate"""
    
    def __init__(self, app=None):
        self.redis_client = None
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Inizializza Redis connection"""
        redis_url = app.config.get('CACHE_REDIS_URL') or app.config.get('REDIS_URL')
        
        if redis_url:
            try:
                self.redis_client = redis.from_url(
                    redis_url,
                    decode_responses=False,  # Per supportare pickle
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
                # Test connection
                self.redis_client.ping()
                app.logger.info("✅ Redis cache connected successfully")
            except (redis.ConnectionError, redis.TimeoutError) as e:
                app.logger.warning(f"⚠️  Redis connection failed: {e}. Caching disabled.")
                self.redis_client = None
        else:
            app.logger.warning("⚠️  Redis URL not configured. Caching disabled.")
    
    def is_available(self):
        """Verifica se Redis è disponibile"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except:
            return False
    
    def get(self, key):
        """Ottiene valore dalla cache"""
        if not self.is_available():
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return pickle.loads(value)
        except Exception as e:
            current_app.logger.error(f"Cache get error: {e}")
        
        return None
    
    def set(self, key, value, timeout=300):
        """Salva valore in cache con timeout"""
        if not self.is_available():
            return False
        
        try:
            serialized = pickle.dumps(value)
            self.redis_client.setex(key, timeout, serialized)
            return True
        except Exception as e:
            current_app.logger.error(f"Cache set error: {e}")
            return False
    
    def delete(self, key):
        """Elimina chiave dalla cache"""
        if not self.is_available():
            return False
        
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            current_app.logger.error(f"Cache delete error: {e}")
            return False
    
    def delete_pattern(self, pattern):
        """Elimina tutte le chiavi che matchano il pattern"""
        if not self.is_available():
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            current_app.logger.error(f"Cache delete pattern error: {e}")
            return 0
    
    def clear_all(self):
        """Pulisce tutta la cache (usare con cautela!)"""
        if not self.is_available():
            return False
        
        try:
            self.redis_client.flushdb()
            return True
        except Exception as e:
            current_app.logger.error(f"Cache clear error: {e}")
            return False


# Instance globale
cache = RedisCache()


def cached(timeout=300, key_prefix='view'):
    """
    Decorator per cachare risultati di funzioni/route
    
    Args:
        timeout: Secondi prima della scadenza (default 5 minuti)
        key_prefix: Prefisso per la cache key
    
    Usage:
        @cached(timeout=600, key_prefix='articles')
        def get_articles():
            return Article.query.all()
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Genera cache key basata su funzione e parametri
            cache_key = f"{key_prefix}:{f.__name__}"
            
            # Aggiungi args/kwargs alla key se presenti
            if args:
                cache_key += f":{str(args)}"
            if kwargs:
                cache_key += f":{str(sorted(kwargs.items()))}"
            
            # Cerca in cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                current_app.logger.debug(f"Cache HIT: {cache_key}")
                return cached_value
            
            # Cache miss - esegui funzione
            current_app.logger.debug(f"Cache MISS: {cache_key}")
            result = f(*args, **kwargs)
            
            # Salva in cache
            cache.set(cache_key, result, timeout)
            
            return result
        
        return decorated_function
    return decorator


def invalidate_cache(pattern):
    """
    Helper per invalidare cache
    
    Usage:
        invalidate_cache('articles:*')  # Invalida tutti gli articoli
    """
    return cache.delete_pattern(pattern)


# Esempi di utilizzo:
"""
# 1. Cache semplice su funzione
from src.utils.redis_cache import cached

@cached(timeout=600, key_prefix='articles')
def get_all_articles():
    return Article.query.filter_by(published=True).all()

# 2. Cache su route
@app.route('/api/articles')
@cached(timeout=300, key_prefix='api_articles')
def list_articles():
    articles = get_all_articles()
    return jsonify([a.to_dict() for a in articles])

# 3. Invalidare cache dopo modifica
@app.route('/api/articles/<id>', methods=['PUT'])
def update_article(id):
    article = Article.query.get_or_404(id)
    article.title = request.json['title']
    db.session.commit()
    
    # Invalida cache degli articoli
    invalidate_cache('articles:*')
    invalidate_cache('api_articles:*')
    
    return jsonify(article.to_dict())

# 4. Cache manuale
from src.utils.redis_cache import cache

def expensive_calculation(param):
    key = f"calc:{param}"
    result = cache.get(key)
    
    if result is None:
        # Calcolo costoso
        result = complex_operation(param)
        cache.set(key, result, timeout=3600)
    
    return result
"""
