# LitInvestorBlog-backend/src/routes/seo.py

from flask import Blueprint, Response
from datetime import datetime
from src.models.article import Article
from src.extensions import db

seo_bp = Blueprint('seo', __name__)

@seo_bp.route('/sitemap.xml')
def sitemap():
    """Genera sitemap.xml dinamica"""
    articles = Article.query.filter_by(published=True).all()
    
    sitemap_xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Homepage
    sitemap_xml.append(f'''
      <url>
        <loc>https://tuosito.com/</loc>
        <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
    ''')
    
    # Articoli
    for article in articles:
        lastmod = article.updated_at or article.created_at
        sitemap_xml.append(f'''
          <url>
            <loc>https://tuosito.com/article/{article.slug}</loc>
            <lastmod>{lastmod.strftime('%Y-%m-%d')}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>
        ''')
    
    sitemap_xml.append('</urlset>')
    
    return Response(''.join(sitemap_xml), mimetype='application/xml')

@seo_bp.route('/robots.txt')
def robots():
    """Genera robots.txt"""
    return Response('''User-agent: *
Allow: /
Sitemap: https://tuosito.com/sitemap.xml
    ''', mimetype='text/plain')
