"""
Configuration management for Rio Capital Blog
Gestisce le configurazioni in modo sicuro per diversi ambienti
"""
import os
from datetime import timedelta


class Config:
    """Base configuration"""
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    # Database
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # File Upload
    MAX_CONTENT_LENGTH = 26 * 1024 * 1024  # 26MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads', 'avatars')
    
    # Session
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # OAuth Google
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    
    # Stripe
    STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
    STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')
    STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    # Email
    SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 465))
    SMTP_USER = os.getenv('SMTP_USER')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
    FROM_EMAIL = os.getenv('FROM_EMAIL')
    FROM_NAME = os.getenv('FROM_NAME', 'Rio Capital Blog')
    CONTACT_ADMIN_EMAIL = os.getenv('CONTACT_ADMIN_EMAIL')
    EMAIL_TEST_MODE = os.getenv('EMAIL_TEST_MODE', 'false').lower() == 'true'
    
    # Compression
    COMPRESS_ALGORITHM = ['br', 'gzip', 'deflate']
    COMPRESS_BR_LEVEL = 4
    COMPRESS_MIN_SIZE = 500
    SEND_FILE_MAX_AGE_DEFAULT = 31536000  # 1 year
    
    @staticmethod
    def init_app(app):
        """
        Initialize application with configuration
        Permette di fare validazioni quando l'app viene creata
        """
        pass


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    
    # Database - SQLite per sviluppo locale
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'LitInvestorBlog.db')}"
    )
    
    # Session - Non sicuro per sviluppo locale
    SESSION_COOKIE_SECURE = False
    
    # CORS - Permette localhost
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ]
    
    @staticmethod
    def init_app(app):
        """Validazioni per development"""
        Config.init_app(app)
        
        # Verifica SECRET_KEY
        if not app.config.get('SECRET_KEY'):
            raise ValueError(
                "SECRET_KEY must be set in .env file!\n"
                "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
            )


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Database - PostgreSQL per produzione
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    
    # Database Pool Settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'max_overflow': 20
    }
    
    # Session - Sicuro per produzione
    SESSION_COOKIE_SECURE = True  # Solo HTTPS
    
    # CORS - Solo domini autorizzati
    CORS_ORIGINS = os.getenv('ALLOWED_ORIGINS', '').split(',')
    
    # Redis Cache
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Rate Limiting
    RATELIMIT_STORAGE_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/1')
    
    @staticmethod
    def init_app(app):
        """Validazioni per production"""
        Config.init_app(app)
        
        # Validazioni critiche solo per produzione
        if not app.config.get('SECRET_KEY'):
            raise ValueError("SECRET_KEY must be set for production!")
        
        if not app.config.get('SQLALCHEMY_DATABASE_URI'):
            raise ValueError("DATABASE_URL must be set for production!")
        
        if not app.config.get('CORS_ORIGINS') or app.config['CORS_ORIGINS'] == ['']:
            raise ValueError("ALLOWED_ORIGINS must be set for production!")
        
        # Fix per Heroku/alcune piattaforme che usano postgres:// invece di postgresql://
        if app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgres://'):
            app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace(
                'postgres://', 'postgresql://', 1
            )


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    
    # Database in memoria per test
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Session
    SESSION_COOKIE_SECURE = False
    WTF_CSRF_ENABLED = False
    
    # CORS
    CORS_ORIGINS = ['http://localhost:5173']
    
    # Email - Non inviare email vere durante i test
    EMAIL_TEST_MODE = True


# Dizionario delle configurazioni
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config(config_name=None):
    """
    Ottiene la configurazione appropriata
    
    Args:
        config_name: Nome della configurazione ('development', 'production', 'testing')
                     Se None, usa FLASK_ENV dalla variabile d'ambiente
    
    Returns:
        Config class appropriata
    """
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    return config.get(config_name, DevelopmentConfig)
