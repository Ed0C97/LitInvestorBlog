import os
import click
from flask import Flask, send_from_directory, Blueprint, request
from flask.cli import with_appcontext
from flask_cors import CORS
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_compress import Compress
from dotenv import load_dotenv

# Carica variabili ambiente dal file .env
load_dotenv()

from src.config import get_config
from src.extensions import db, oauth
from src.models.user import User
from src.models.category import Category
from src.middleware.security import add_security_headers, add_hsts_header

from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.articles import articles_bp
from src.routes.categories import categories_bp
from src.routes.newsletter import newsletter_bp
from src.routes.contact import contact_bp
from src.routes.comments import comments_bp
from src.routes.favorites import favorites_bp
from src.routes.donations import donations_bp
from src.routes.analytics import analytics_bp
from src.routes.upload import upload_bp
from src.routes.filters import filters_bp
from src.routes.content import content_bp
from src.routes.stripe import stripe_bp
from src.routes.search import search_bp
from src.routes.profile import profile_bp
from src.routes.seo import seo_bp
from src.routes.moderation import moderation_bp


def create_app(config_name=None):
    """
    Application Factory Function
    
    Args:
        config_name: Nome della configurazione ('development', 'production', 'testing')
                     Se None, usa FLASK_ENV dalla variabile d'ambiente
    """
    app = Flask(__name__)

    # Carica configurazione dal file config.py
    config_class = get_config(config_name)
    app.config.from_object(config_class)
    
    # Inizializza e valida configurazione
    config_class.init_app(app)
    
    # Crea cartella upload se non esiste
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Inizializza estensioni
    compress = Compress()
    compress.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    @login_manager.unauthorized_handler
    def unauthorized():
        return {'error': 'Authentication required'}, 401

    db.init_app(app)
    oauth.init_app(app)
    Migrate(app, db)
    
    # CORS con configurazione sicura
    CORS(
        app,
        origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173']),
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization'],
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        expose_headers=['Content-Type', 'Authorization']
    )

    # Configura OAuth Google
    if app.config.get('GOOGLE_CLIENT_ID') and app.config.get('GOOGLE_CLIENT_SECRET'):
        oauth.register(
            name="google",
            client_id=app.config['GOOGLE_CLIENT_ID'],
            client_secret=app.config['GOOGLE_CLIENT_SECRET'],
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )
    else:
        app.logger.warning("Google OAuth credentials not configured")

    # ========================================
    # MIDDLEWARE - After Request
    # ========================================
    
    @app.after_request
    def apply_security_middleware(response):
        """Applica tutti i middleware di sicurezza"""
        # Security Headers
        response = add_security_headers(response)
        
        # HSTS Header (solo in produzione)
        is_production = app.config.get('SESSION_COOKIE_SECURE', False)
        response = add_hsts_header(response, is_production)
        
        # Cache Headers per static files
        if '/static/' in request.path:
            response.cache_control.max_age = app.config['SEND_FILE_MAX_AGE_DEFAULT']
            response.cache_control.public = True
        
        return response

    # ========================================
    # ERROR HANDLERS
    # ========================================
    
    @app.errorhandler(400)
    def bad_request(error):
        return {'error': 'Bad Request', 'message': str(error)}, 400
    
    @app.errorhandler(401)
    def unauthorized_error(error):
        return {'error': 'Unauthorized', 'message': 'Authentication required'}, 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return {'error': 'Forbidden', 'message': 'You do not have permission to access this resource'}, 403
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not Found', 'message': 'The requested resource was not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        app.logger.error(f'Server Error: {error}')
        return {'error': 'Internal Server Error', 'message': 'An unexpected error occurred'}, 500

    # ========================================
    # HEALTH CHECK
    # ========================================
    
    @app.route('/health')
    def health_check():
        """Simple health check endpoint"""
        try:
            # Test database connection
            db.session.execute('SELECT 1')
            return {'status': 'healthy', 'database': 'connected'}, 200
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}, 503

    # ========================================
    # FRONTEND SERVING
    # ========================================
    
    frontend_bp = Blueprint(
        "frontend",
        __name__,
        static_folder=os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "LitInvestorBlog-frontend",
            "dist",
        ),
        static_url_path="/",
    )

    @frontend_bp.route("/", defaults={"path": "index.html"})
    @frontend_bp.route("/<path:path>")
    def serve_frontend(path):
        static_folder = frontend_bp.static_folder
        if path != "" and os.path.exists(os.path.join(static_folder, path)):
            return send_from_directory(static_folder, path)
        else:
            return send_from_directory(static_folder, "index.html")

    # ========================================
    # REGISTER BLUEPRINTS
    # ========================================
    
    app.register_blueprint(frontend_bp)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(articles_bp, url_prefix="/api/articles")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(comments_bp)
    app.register_blueprint(favorites_bp, url_prefix="/api/favorites")
    app.register_blueprint(donations_bp, url_prefix="/api/donations")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(upload_bp, url_prefix="/api/upload")
    app.register_blueprint(filters_bp, url_prefix="/api/filters")
    app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")
    app.register_blueprint(contact_bp, url_prefix="/api/contact")
    app.register_blueprint(content_bp, url_prefix="/api/content")
    app.register_blueprint(stripe_bp, url_prefix="/api/stripe")
    app.register_blueprint(search_bp, url_prefix="/api")
    app.register_blueprint(seo_bp)
    app.register_blueprint(moderation_bp, url_prefix="/api/moderation")

    # ========================================
    # CLI COMMANDS
    # ========================================
    
    app.cli.add_command(create_admin)
    app.cli.add_command(seed_db)
    app.cli.add_command(check_security)

    return app


# ========================================
# CLI COMMANDS
# ========================================

@click.command(name="create-admin")
@click.argument("username")
@click.argument("email")
@click.argument("password")
@with_appcontext
def create_admin(username, email, password):
    """Crea l'utente amministratore con le credenziali fornite."""
    if User.query.filter_by(username=username).first():
        print(f'❌ Un utente con username "{username}" esiste già.')
        return
    if User.query.filter_by(email=email).first():
        print(f'❌ Un utente con email "{email}" esiste già.')
        return

    admin_user = User(username=username, email=email, role="admin", is_active=True)
    admin_user.set_password(password)
    db.session.add(admin_user)
    db.session.commit()
    print(f'✅ Utente admin "{username}" creato con successo.')


@click.command(name="seed-db")
@with_appcontext
def seed_db():
    """Popola il database con le categorie di default."""
    if Category.query.count() == 0:
        admin_user = User.query.filter_by(role="admin").first()
        if admin_user:
            print("📝 Creazione categorie di default...")
            default_categories = [
                {
                    "name": "Personal Finance",
                    "description": "Tips and strategies for managing personal finances",
                    "color": "#6F42C1",
                },
                {
                    "name": "Investments",
                    "description": "Articles on investments and financial strategies",
                    "color": "#28A745",
                },
                {
                    "name": "Alternative Thinking",
                    "description": (
                        "Alternative perspectives and reflections on finance and economics"
                    ),
                    "color": "#FFC107",
                },
            ]
            for cat_data in default_categories:
                slug = cat_data["name"].lower().replace(" ", "-")
                category = Category(
                    name=cat_data["name"],
                    slug=slug,
                    description=cat_data["description"],
                    color=cat_data["color"],
                    created_by=admin_user.id,
                )
                db.session.add(category)
            db.session.commit()
            print("✅ Categorie di default create con successo.")
        else:
            print("⚠️  Crea prima un utente admin con 'flask create-admin'.")
    else:
        print("✅ Le categorie esistono già.")


@click.command(name="check-security")
@with_appcontext
def check_security():
    """Verifica configurazione di sicurezza"""
    from flask import current_app
    
    print("\n" + "="*60)
    print("🔒 SECURITY CONFIGURATION CHECK")
    print("="*60 + "\n")
    
    issues = []
    warnings = []
    
    # Check SECRET_KEY
    if current_app.config.get('SECRET_KEY'):
        if current_app.config['SECRET_KEY'] == 'your-super-secret-key-change-this-in-production':
            issues.append("❌ SECRET_KEY is using default value! Generate a new one!")
        elif len(current_app.config['SECRET_KEY']) < 32:
            warnings.append("⚠️  SECRET_KEY should be at least 32 characters long")
        else:
            print("✅ SECRET_KEY is set and strong")
    else:
        issues.append("❌ SECRET_KEY is not set!")
    
    # Check SESSION_COOKIE_SECURE
    if current_app.config.get('SESSION_COOKIE_SECURE'):
        print("✅ SESSION_COOKIE_SECURE is enabled (production mode)")
    else:
        warnings.append("⚠️  SESSION_COOKIE_SECURE is disabled (development mode)")
    
    # Check GOOGLE_CLIENT_ID
    if current_app.config.get('GOOGLE_CLIENT_ID'):
        client_id = current_app.config['GOOGLE_CLIENT_ID']
        # Lista di credenziali esposte conosciute
        exposed_ids = [
            '157706702557-furil8otnbp3r5841j9lhjgk3vk7837j',
            '157706702557-',  # Anche se cambiato, se inizia così potrebbe essere lo stesso progetto
        ]
        
        # Check se è una credenziale esposta
        is_exposed = any(exposed_id in client_id for exposed_id in exposed_ids)
        
        if is_exposed and not client_id.startswith('temp-'):
            issues.append("❌ GOOGLE_CLIENT_ID appears to be from exposed project! Use a different Google Cloud project.")
        # Check se è il placeholder temporaneo
        elif client_id.startswith('temp-dev') or client_id.startswith('temp-'):
            warnings.append("⚠️  Using temporary Google OAuth credentials (development only)")
            print("ℹ️  GOOGLE_CLIENT_ID is temporary (OK for development)")
        else:
            print("✅ GOOGLE_CLIENT_ID is configured")
    else:
        warnings.append("⚠️  GOOGLE_CLIENT_ID is not configured")
    
    # Check STRIPE_SECRET_KEY
    if current_app.config.get('STRIPE_SECRET_KEY'):
        if current_app.config['STRIPE_SECRET_KEY'] == 'your-stripe-secret-key-here':
            warnings.append("⚠️  STRIPE_SECRET_KEY is not configured")
        else:
            print("✅ STRIPE_SECRET_KEY is set")
    else:
        warnings.append("⚠️  STRIPE_SECRET_KEY is not configured")
    
    # Check DATABASE
    db_uri = current_app.config.get('SQLALCHEMY_DATABASE_URI', '')
    if 'sqlite' in db_uri.lower():
        warnings.append("⚠️  Using SQLite (recommended for development only)")
    elif 'postgresql' in db_uri.lower():
        print("✅ Using PostgreSQL (recommended for production)")
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60 + "\n")
    
    if issues:
        print("🔴 CRITICAL ISSUES:")
        for issue in issues:
            print(f"  {issue}")
        print()
    
    if warnings:
        print("🟡 WARNINGS:")
        for warning in warnings:
            print(f"  {warning}")
        print()
    
    if not issues and not warnings:
        print("✅ All security checks passed!")
    elif not issues:
        print("✅ No critical issues found")
    else:
        print("❌ Please fix critical issues before deploying!")
    
    print()


# Crea app instance
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
