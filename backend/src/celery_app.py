"""
Celery Configuration for Lit Investor Blog
Gestisce task asincroni come invio email, processing immagini, etc.
"""
from celery import Celery
import os


def make_celery(app_name=__name__):
    """
    Crea istanza Celery
    
    Args:
        app_name: Nome dell'applicazione
    
    Returns:
        Celery instance configurata
    """
    broker_url = os.getenv('CELERY_BROKER_URL', os.getenv('REDIS_URL', 'redis://localhost:6379/0'))
    result_backend = os.getenv('CELERY_RESULT_BACKEND', broker_url)
    
    celery = Celery(
        app_name,
        broker=broker_url,
        backend=result_backend
    )
    
    # Configurazione
    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        task_track_started=True,
        task_time_limit=300,  # 5 minuti max per task
        task_soft_time_limit=240,  # Warning dopo 4 minuti
        worker_prefetch_multiplier=1,
        worker_max_tasks_per_child=1000,
    )
    
    return celery


# Crea istanza Celery
celery = make_celery()


# Task per email
@celery.task(name='tasks.send_email', bind=True, max_retries=3)
def send_email_task(self, to_email, subject, html_body, text_body=None):
    """
    Invia email in modo asincrono
    
    Args:
        to_email: Destinatario
        subject: Oggetto email
        html_body: Corpo HTML
        text_body: Corpo testo (opzionale)
    
    Returns:
        Boolean success
    """
    try:
        from src.utils.email_service import EmailService
        
        email_service = EmailService()
        success, message = email_service.send_email(
            to_email, 
            subject, 
            html_body, 
            text_body
        )
        
        if not success:
            # Retry se fallisce
            raise Exception(f"Email send failed: {message}")
        
        return {'status': 'sent', 'to': to_email, 'subject': subject}
    
    except Exception as exc:
        # Retry con exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)


@celery.task(name='tasks.send_newsletter_confirmation')
def send_newsletter_confirmation_task(email):
    """Invia conferma iscrizione newsletter"""
    try:
        from src.utils.email_service import EmailService
        
        email_service = EmailService()
        return email_service.send_newsletter_confirmation(email)
    
    except Exception as e:
        return {'status': 'failed', 'error': str(e)}


@celery.task(name='tasks.send_contact_emails')
def send_contact_emails_task(user_email, user_name, user_message):
    """
    Invia email per form contatti (conferma + notifica team)
    """
    try:
        from src.utils.email_service import EmailService
        
        email_service = EmailService()
        
        # Conferma a utente
        email_service.send_contact_confirmation(user_email, user_name, user_message)
        
        # Notifica al team
        email_service.send_contact_notification(user_email, user_name, user_message)
        
        return {'status': 'sent', 'emails': 2}
    
    except Exception as e:
        return {'status': 'failed', 'error': str(e)}


@celery.task(name='tasks.process_uploaded_image')
def process_uploaded_image_task(image_path, max_width=2000, quality=85):
    """
    Processa immagine caricata (resize, optimize)
    
    Args:
        image_path: Path dell'immagine
        max_width: Larghezza massima
        quality: Qualità JPEG (1-100)
    """
    try:
        from PIL import Image
        import os
        
        # Apri immagine
        with Image.open(image_path) as img:
            # Convert to RGB se necessario
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Resize se troppo grande
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Salva ottimizzata
            img.save(image_path, 'JPEG', quality=quality, optimize=True)
        
        return {'status': 'processed', 'path': image_path}
    
    except Exception as e:
        return {'status': 'failed', 'error': str(e)}


@celery.task(name='tasks.cleanup_old_sessions')
def cleanup_old_sessions_task():
    """
    Pulisce sessioni scadute (task schedulato)
    Eseguire giornalmente
    """
    try:
        from datetime import datetime, timedelta
        from src.extensions import db
        # Implementa logica cleanup se usi session DB-based
        
        return {'status': 'cleaned', 'timestamp': datetime.utcnow().isoformat()}
    
    except Exception as e:
        return {'status': 'failed', 'error': str(e)}


@celery.task(name='tasks.generate_sitemap')
def generate_sitemap_task():
    """
    Genera sitemap.xml
    Eseguire giornalmente o dopo pubblicazione articolo
    """
    try:
        from src.models.article import Article
        from src.models.category import Category
        from datetime import datetime
        
        # Ottieni articoli pubblicati
        articles = Article.query.filter_by(published=True).all()
        categories = Category.query.all()
        
        # Genera XML
        xml = ['<?xml version="1.0" encoding="UTF-8"?>']
        xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
        
        # Homepage
        xml.append('<url>')
        xml.append('<loc>https://litinvestor.com/</loc>')
        xml.append('<changefreq>daily</changefreq>')
        xml.append('<priority>1.0</priority>')
        xml.append('</url>')
        
        # Articles
        for article in articles:
            xml.append('<url>')
            xml.append(f'<loc>https://litinvestor.com/article/{article.slug}</loc>')
            if article.updated_at:
                xml.append(f'<lastmod>{article.updated_at.strftime("%Y-%m-%d")}</lastmod>')
            xml.append('<changefreq>weekly</changefreq>')
            xml.append('<priority>0.8</priority>')
            xml.append('</url>')
        
        # Categories
        for category in categories:
            xml.append('<url>')
            xml.append(f'<loc>https://litinvestor.com/categoria/{category.slug}</loc>')
            xml.append('<changefreq>weekly</changefreq>')
            xml.append('<priority>0.7</priority>')
            xml.append('</url>')
        
        xml.append('</urlset>')
        
        # Salva file
        import os
        sitemap_path = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            'static', 
            'sitemap.xml'
        )
        
        with open(sitemap_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(xml))
        
        return {
            'status': 'generated', 
            'articles': len(articles),
            'categories': len(categories)
        }
    
    except Exception as e:
        return {'status': 'failed', 'error': str(e)}


# Configurazione schedule (beat)
celery.conf.beat_schedule = {
    'cleanup-sessions-daily': {
        'task': 'tasks.cleanup_old_sessions',
        'schedule': 86400.0,  # Ogni 24 ore
    },
    'generate-sitemap-daily': {
        'task': 'tasks.generate_sitemap',
        'schedule': 86400.0,  # Ogni 24 ore
    },
}


# Esempio di utilizzo nelle route:
"""
# Prima (sincrono - blocca request):
@newsletter_bp.route('/subscribe', methods=['POST'])
def subscribe():
    email = request.json['email']
    # ... validazione ...
    
    email_service.send_newsletter_confirmation(email)  # BLOCCA!
    
    return jsonify({'message': 'Subscribed'})

# Dopo (asincrono - non blocca):
from src.celery_app import send_newsletter_confirmation_task

@newsletter_bp.route('/subscribe', methods=['POST'])
def subscribe():
    email = request.json['email']
    # ... validazione ...
    
    # Invia email in background
    send_newsletter_confirmation_task.delay(email)
    
    return jsonify({'message': 'Subscribed'})  # Ritorna subito!
"""

# Come avviare Celery worker:
"""
# Development:
celery -A src.celery_app:celery worker --loglevel=info

# Con beat scheduler:
celery -A src.celery_app:celery worker --beat --loglevel=info

# Production (con multiple workers):
celery -A src.celery_app:celery worker --concurrency=4 --loglevel=info
"""
