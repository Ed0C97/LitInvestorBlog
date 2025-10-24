# LitInvestorBlog-backend/src/routes/comments.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc, or_
from src.models.comment import Comment, CommentLike
from src.models.article import Article
from src.models.user import User
from src.extensions import db
from src.middleware.auth import admin_required
import logging
import re

comments_bp = Blueprint("comments", __name__)

# Blacklist parole offensive (esempio base)
BLACKLIST_WORDS = ["spam", "offensive_word_1", "offensive_word_2"]

def contains_blacklisted_words(text):
    """Controlla se il testo contiene parole nella blacklist"""
    text_lower = text.lower()
    return any(word in text_lower for word in BLACKLIST_WORDS)

def extract_mentions(text):
    """Estrae gli @username dal testo"""
    return re.findall(r'@(\w+)', text)

@comments_bp.route("/api/articles/<int:article_id>/comments", methods=["GET"])
def get_article_comments(article_id):
    """Ottieni commenti di un articolo (solo top-level, le risposte sono nested)"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 10, type=int), 50)
        
        # Get current user id if authenticated
        current_user_id = current_user.id if current_user.is_authenticated else None

        # Conta TUTTI i commenti (top-level + replies)
        total_comments_count = Comment.query.filter_by(article_id=article_id).filter_by(status="approved").count()
        
        # Query solo commenti di primo livello (parent_id = None)
        query = Comment.query.filter_by(article_id=article_id, parent_id=None)

        # Se non è admin, mostra solo commenti approvati
        if not (current_user.is_authenticated and current_user.role == "admin"):
            query = query.filter_by(status="approved")

        # Ordina per più recenti
        comments_paginated = query.order_by(desc(Comment.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )

        # Serializza commenti con risposte
        comments_data = [
            comment.to_dict(include_replies=True, current_user_id=current_user_id) 
            for comment in comments_paginated.items
        ]

        return jsonify({
            "success": True,
            "comments": comments_data,
            "pagination": {
                "page": page,
                "pages": comments_paginated.pages,
                "per_page": per_page,
                "total": comments_paginated.total,
                "total_all_comments": total_comments_count,  # Tutti i commenti incluse risposte
                "has_next": comments_paginated.has_next,
                "has_prev": comments_paginated.has_prev,
            },
        })

    except Exception as e:
        logging.error(f"Errore nel caricamento commenti: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments", methods=["POST"])
@login_required
def create_comment():
    """Crea un nuovo commento o risposta"""
    try:
        data = request.get_json()

        if not data or not data.get("content") or not data.get("article_id"):
            return jsonify({"success": False, "message": "Dati mancanti"}), 400

        content = data["content"].strip()
        
        # Verifica lunghezza massima (5000 caratteri)
        if len(content) > 5000:
            return jsonify({"success": False, "message": "Comment cannot exceed 5000 characters"}), 400

        # Check blacklist
        if contains_blacklisted_words(content):
            return jsonify({"success": False, "message": "Il commento contiene parole non consentite"}), 400

        article = Article.query.get(data["article_id"])
        if not article:
            return jsonify({"success": False, "message": "Articolo non trovato"}), 404

        parent_id = data.get("parent_id")
        
        # Se è una risposta, valida il parent
        if parent_id:
            parent_comment = Comment.query.get(parent_id)
            if not parent_comment or parent_comment.article_id != data["article_id"]:
                return jsonify({"success": False, "message": "Commento padre non valido"}), 400
            
            # IMPORTANTE: Non permettere più di 1 livello di nidificazione
            # Se il parent ha già un parent_id, usa il parent del parent come parent_id
            if parent_comment.parent_id is not None:
                parent_id = parent_comment.parent_id

        # Estrai mention (@username)
        mentions = extract_mentions(content)

        comment = Comment(
            content=content,
            article_id=data["article_id"],
            user_id=current_user.id,
            parent_id=parent_id,
            status="approved",  # Auto-approva i commenti (puoi cambiare in "pending" per moderazione)
        )

        db.session.add(comment)
        db.session.commit()

        # TODO: Invia notifiche agli utenti menzionati (@username)
        # Implementeremo questo dopo

        return jsonify({
            "success": True,
            "message": "Commento pubblicato con successo",
            "comment": comment.to_dict(include_replies=False, current_user_id=current_user.id),
        }), 201

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nella creazione commento: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments/<int:comment_id>", methods=["PUT"])
@login_required
def update_comment(comment_id):
    """Aggiorna un commento (solo il proprietario)"""
    try:
        comment = Comment.query.get_or_404(comment_id)

        if comment.user_id != current_user.id:
            return jsonify({"success": False, "message": "Non autorizzato"}), 403

        data = request.get_json()
        if not data or not data.get("content"):
            return jsonify({"success": False, "message": "Contenuto mancante"}), 400

        content = data["content"].strip()
        
        # Verifica lunghezza massima
        if len(content) > 5000:
            return jsonify({"success": False, "message": "Comment cannot exceed 5000 characters"}), 400

        # Check blacklist
        if contains_blacklisted_words(content):
            return jsonify({"success": False, "message": "Il commento contiene parole non consentite"}), 400

        comment.content = content
        # Opzionale: rimetti in pending dopo modifica
        # comment.status = "pending"

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Commento aggiornato",
            "comment": comment.to_dict(include_replies=False, current_user_id=current_user.id),
        })

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nell'aggiornamento commento: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments/<int:comment_id>", methods=["DELETE"])
@login_required
def delete_comment(comment_id):
    """Elimina un commento (proprietario o admin)"""
    try:
        comment = Comment.query.get_or_404(comment_id)

        if comment.user_id != current_user.id and current_user.role != "admin":
            return jsonify({"success": False, "message": "Non autorizzato"}), 403

        # Elimina anche tutte le risposte (cascade)
        db.session.delete(comment)
        db.session.commit()

        return jsonify({"success": True, "message": "Commento eliminato"})

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nell'eliminazione commento: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments/<int:comment_id>/like", methods=["POST"])
@login_required
def toggle_comment_like(comment_id):
    """Toggle like su un commento"""
    try:
        comment = Comment.query.get_or_404(comment_id)

        # Controlla se l'utente ha già messo like
        existing_like = CommentLike.query.filter_by(
            comment_id=comment_id, 
            user_id=current_user.id
        ).first()

        if existing_like:
            # Rimuovi like
            db.session.delete(existing_like)
            db.session.commit()
            liked = False
        else:
            # Aggiungi like
            new_like = CommentLike(
                comment_id=comment_id,
                user_id=current_user.id
            )
            db.session.add(new_like)
            db.session.commit()
            liked = True

        # Conta i likes aggiornati
        likes_count = CommentLike.query.filter_by(comment_id=comment_id).count()

        return jsonify({
            "success": True,
            "liked": liked,
            "likes_count": likes_count
        })

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nel toggle like: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments/<int:comment_id>/report", methods=["POST"])
@login_required
def report_comment(comment_id):
    """Segnala un commento"""
    try:
        from src.models.comment import CommentReport
        
        comment = Comment.query.get_or_404(comment_id)
        
        # Gestisci il caso in cui non ci sia body JSON
        try:
            data = request.get_json(force=True) or {}
        except Exception:
            data = {}
        
        reason = data.get('reason', 'inappropriate_content')
        additional_info = data.get('additional_info', '')
        
        # Controlla se l'utente ha già segnalato questo commento usando ORM
        existing_report = CommentReport.query.filter_by(
            comment_id=comment_id,
            reporter_id=current_user.id
        ).first()
        
        if existing_report:
            return jsonify({"success": False, "message": "You have already reported this comment"}), 400
        
        # Crea il report usando ORM
        new_report = CommentReport(
            comment_id=comment_id,
            reporter_id=current_user.id,
            reason=reason,
            additional_info=additional_info,
            status='pending'
        )
        
        db.session.add(new_report)
        
        # Aggiorna anche il flag reported nel commento per compatibilità
        comment.reported = True
        
        db.session.commit()

        return jsonify({"success": True, "message": "Comment reported successfully"})

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nella segnalazione commento: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


# ============================================
# ADMIN ROUTES - Moderazione
# ============================================

@comments_bp.route("/api/admin/comments/moderation", methods=["GET"])
@admin_required
def get_comments_for_moderation():
    """Ottieni commenti per moderazione (ADMIN)"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 50, type=int), 100)
        status = request.args.get("status", "all")
        reported_only = request.args.get("reported", "false").lower() == "true"

        query = Comment.query.join(User).join(Article)

        if status != "all":
            query = query.filter(Comment.status == status)
        
        if reported_only:
            query = query.filter(Comment.reported == True)

        comments = query.order_by(desc(Comment.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )

        comments_data = []
        for comment in comments.items:
            comment_dict = comment.to_dict(include_replies=False, current_user_id=current_user.id)
            comment_dict["article_title"] = comment.article.title
            comment_dict["article_slug"] = comment.article.slug
            comments_data.append(comment_dict)

        return jsonify({
            "success": True,
            "comments": comments_data,
            "pagination": {
                "page": page,
                "pages": comments.pages,
                "per_page": per_page,
                "total": comments.total,
            },
        })

    except Exception as e:
        logging.error(f"Errore nel caricamento commenti per moderazione: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/admin/comments/<int:comment_id>/moderate", methods=["PATCH"])
@admin_required
def moderate_comment(comment_id):
    """Modera un commento (ADMIN)"""
    try:
        comment = Comment.query.get_or_404(comment_id)
        data = request.get_json()

        action = data.get("action")
        reason = data.get("reason", "")

        if action == "approve":
            comment.status = "approved"
            comment.reported = False
        elif action == "reject":
            comment.status = "rejected"
        elif action == "unreport":
            comment.reported = False
        elif action == "delete":
            db.session.delete(comment)
            db.session.commit()
            return jsonify({"success": True, "message": "Commento eliminato"})
        else:
            return jsonify({"success": False, "message": "Azione non valida"}), 400

        if reason:
            comment.moderation_reason = reason

        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Commento {action}d",
            "comment": comment.to_dict(include_replies=False, current_user_id=current_user.id)
        })

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nella moderazione commento: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/admin/comments/moderate-bulk", methods=["PATCH"])
@admin_required
def moderate_comments_bulk():
    """Modera più commenti contemporaneamente (ADMIN)"""
    try:
        data = request.get_json()
        comment_ids = data.get("comment_ids", [])
        action = data.get("action")
        reason = data.get("reason", "")

        if not comment_ids or not action:
            return jsonify({"success": False, "message": "Dati mancanti"}), 400

        comments = Comment.query.filter(Comment.id.in_(comment_ids)).all()

        for comment in comments:
            if action == "approve":
                comment.status = "approved"
                comment.reported = False
            elif action == "reject":
                comment.status = "rejected"
            elif action == "delete":
                db.session.delete(comment)
                continue

            if reason:
                comment.moderation_reason = reason

        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"{len(comment_ids)} commenti processati",
        })

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nella moderazione bulk: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500
