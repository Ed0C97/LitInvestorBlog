# LitInvestorBlog-backend/src/routes/moderation.py

from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from src.extensions import db
from sqlalchemy import text
from src.models.user import User
from src.models.comment import Comment
from src.middleware.auth import admin_required
from src.utils.email_service import email_service
import json
from datetime import datetime
import os

moderation_bp = Blueprint('moderation', __name__)

@moderation_bp.route('/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    """Get all users with report counts"""
    try:
        query = text("""
            SELECT 
                u.id,
                u.username,
                u.email,
                u.first_name,
                u.last_name,
                u.role,
                u.created_at,
                u.is_active,
                u.avatar_url,
                COUNT(DISTINCT cr.id) as reports_count
            FROM user u
            LEFT JOIN comment c ON c.user_id = u.id
            LEFT JOIN comment_report cr ON cr.comment_id = c.id
            GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.created_at, u.is_active, u.avatar_url
            ORDER BY u.created_at DESC
        """)
        
        result = db.session.execute(query)
        users = [dict(row._mapping) for row in result]
        
        return jsonify({
            'users': users,
            'total': len(users)
        }), 200
        
    except Exception as e:
        print(f"Error in get_users: {e}")
        return jsonify({'error': str(e)}), 500


@moderation_bp.route('/users/<int:user_id>/comments', methods=['GET'])
@login_required
@admin_required
def get_user_comments(user_id):
    """Get user comments with reports"""
    try:
        query = text("""
            SELECT 
                c.id,
                c.content,
                c.created_at,
                c.article_id,
                a.title as article_title,
                COUNT(DISTINCT cr.id) as reports_count,
                GROUP_CONCAT(DISTINCT cr.reason) as report_reasons
            FROM comment c
            LEFT JOIN article a ON a.id = c.article_id
            LEFT JOIN comment_report cr ON cr.comment_id = c.id
            WHERE c.user_id = :user_id
            GROUP BY c.id, c.content, c.created_at, c.article_id, a.title
            ORDER BY c.created_at DESC
        """)
        
        result = db.session.execute(query, {'user_id': user_id})
        comments = [dict(row._mapping) for row in result]
        
        return jsonify({
            'comments': comments,
            'total': len(comments)
        }), 200
        
    except Exception as e:
        print(f"Error in get_user_comments: {e}")
        return jsonify({'error': str(e)}), 500


@moderation_bp.route('/users/<int:user_id>/warn', methods=['POST'])
@login_required
@admin_required
def warn_user(user_id):
    """Send warning email to user"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Warning message is required'}), 400
        
        # Get user info
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Log warning in database
        log_query = text("""
            INSERT INTO moderation_log (user_id, action_type, message, admin_id, created_at)
            VALUES (:user_id, 'warning', :message, :admin_id, datetime('now'))
        """)
        db.session.execute(log_query, {
            'user_id': user_id,
            'message': message,
            'admin_id': current_user.id
        })
        db.session.commit()
        
        # Send warning email
        success, msg = email_service.send_warning_email(
            user.email,
            user.username,
            user.first_name,
            message
        )
        
        if not success:
            return jsonify({'error': msg}), 500
        
        return jsonify({
            'success': True,
            'message': 'Warning email sent successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in warn_user: {e}")
        return jsonify({'error': str(e)}), 500


@moderation_bp.route('/users/<int:user_id>/ban', methods=['POST'])
@login_required
@admin_required
def ban_user(user_id):
    """Ban user"""
    try:
        data = request.get_json()
        reason = data.get('reason', '').strip()
        
        if not reason:
            return jsonify({'error': 'Ban reason is required'}), 400
        
        # Get user info
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update user status to banned
        user.is_active = False
        
        # Log ban in database
        log_query = text("""
            INSERT INTO moderation_log (user_id, action_type, message, admin_id, created_at)
            VALUES (:user_id, 'ban', :message, :admin_id, datetime('now'))
        """)
        db.session.execute(log_query, {
            'user_id': user_id,
            'message': reason,
            'admin_id': current_user.id
        })
        
        # Update blacklist JSON file
        blacklist_path = os.path.join(os.path.dirname(__file__), '../utils/forbidden_usernames.json')
        
        with open(blacklist_path, 'r', encoding='utf-8') as f:
            blacklist = json.load(f)
        
        # Create banned user entry
        banned_entry = {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'banned_at': datetime.now().isoformat(),
            'reason': reason
        }
        
        # Add to blacklist
        if 'banned_users' not in blacklist:
            blacklist['banned_users'] = []
        blacklist['banned_users'].append(banned_entry)
        
        # Also add username to substring_matches
        if user.username.lower() not in blacklist['substring_matches']:
            blacklist['substring_matches'].append(user.username.lower())
        
        # Save updated blacklist
        with open(blacklist_path, 'w', encoding='utf-8') as f:
            json.dump(blacklist, f, indent=2, ensure_ascii=False)
        
        db.session.commit()
        
        # Send ban notification email
        email_service.send_ban_notification_email(
            user.email,
            user.username,
            user.first_name,
            reason
        )
        
        return jsonify({
            'success': True,
            'message': 'User banned successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in ban_user: {e}")
        return jsonify({'error': str(e)}), 500


@moderation_bp.route('/comments/<int:comment_id>/dismiss-reports', methods=['POST'])
@login_required
@admin_required
def dismiss_reports(comment_id):
    """Dismiss all reports for a comment"""
    try:
        delete_query = text("DELETE FROM comment_report WHERE comment_id = :comment_id")
        db.session.execute(delete_query, {'comment_id': comment_id})
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reports dismissed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in dismiss_reports: {e}")
        return jsonify({'error': str(e)}), 500
