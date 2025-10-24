# src/routes/profile.py
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import secure_filename
import os
import uuid

from src.models.user import User
from src.extensions import db
from src.routes.auth import login_required

profile_bp = Blueprint("profile", __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@profile_bp.route('/avatar', methods=['POST'])
@login_required
def upload_avatar():
    if 'avatar' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['avatar']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = str(uuid.uuid4()) + "_" + filename

        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(save_path)

        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({"error": "User not found"}), 404

        file_url = f'/static/uploads/avatars/{unique_filename}'
        user.avatar_url = file_url
        db.session.commit()

        return jsonify({"message": "Avatar updated successfully", "avatar_url": file_url}), 200

    return jsonify({"error": "File type not allowed"}), 400