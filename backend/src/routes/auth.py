import os
import re
import json
from flask import Blueprint, request, jsonify, session, url_for, redirect
from src.models.user import User
from src.extensions import db
from flask_login import login_user, logout_user, login_required, current_user # AGGIUNTO
from functools import wraps
from src.extensions import oauth
from sqlalchemy import func

auth_bp = Blueprint("auth", __name__)

def admin_required(f):
    @wraps(f)
    @login_required # Usa il decoratore standard per assicurare il login
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin(): # Usa current_user
            return jsonify({"error": "Accesso negato: privilegi amministratore richiesti"}), 403
        return f(*args, **kwargs)

    return decorated_function


def author_required(f):
    @wraps(f)
    @login_required # Usa il decoratore standard per assicurare il login
    def decorated_function(*args, **kwargs):
        if not current_user.can_write_articles(): # Usa current_user
            return jsonify({"error": "Accesso negato: privilegi di scrittura richiesti"}), 403
        return f(*args, **kwargs)

    return decorated_function

try:
    base_dir = os.path.dirname(__file__)
    json_path = os.path.join(base_dir, '..', 'utils', 'forbidden_usernames.json')
    with open(json_path, 'r') as f:
        forbidden_data = json.load(f)
        # Converti le liste in 'set' per ricerche molto più veloci (O(1) invece di O(n))
        FORBIDDEN_EXACT_MATCHES = set(forbidden_data.get("exact_matches", []))
        FORBIDDEN_SUBSTRINGS = set(forbidden_data.get("substring_matches", []))
except (FileNotFoundError, json.JSONDecodeError):
    print("ATTENZIONE: Impossibile caricare 'forbidden_usernames.json'. I controlli saranno limitati.")
    FORBIDDEN_EXACT_MATCHES = set()
    FORBIDDEN_SUBSTRINGS = set()

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not all(key in data for key in ["username", "email", "password"]):
            return jsonify({"error": "Username, email e password sono obbligatori"}), 400

        if User.query.filter_by(username=data["username"]).first():
            return jsonify({"error": "Username già esistente"}), 400
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email già registrata"}), 400

        user = User(
            username=data["username"],
            email=data["email"],
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            role=data.get("role", "reader"),
        )
        user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()

        # Usa la funzione standard di Flask-Login
        login_user(user)

        return jsonify({
            "message": "Registrazione completata con successo",
            "user": user.to_dict(),
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data.get("username") or not data.get("password"):
            return jsonify({"error": "Username e password sono obbligatori"}), 400

        user = User.query.filter_by(username=data["username"]).first()

        if user and user.check_password(data["password"]) and user.is_active:
            # Usa la funzione standard di Flask-Login
            login_user(user)
            return jsonify({
                "message": "Login effettuato con successo",
                "user": user.to_dict()
            }), 200
        else:
            return jsonify({"error": "Credenziali non valide"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user() # Usa la funzione standard di Flask-Login
    return jsonify({"message": "Logout effettuato con successo"}), 200


@auth_bp.route("/me", methods=["GET"])
@login_required
def get_current_user():
    # current_user è popolato da Flask-Login
    if current_user.is_authenticated:
        return jsonify({"user": current_user.to_dict()}), 200
    else:
        # Questo caso non dovrebbe accadere grazie a @login_required
        return jsonify({"error": "Utente non trovato"}), 404


@auth_bp.route("/change-password", methods=["POST"])
@login_required
def change_password():
    try:
        data = request.get_json()
        if not data.get("current_password") or not data.get("new_password"):
            return jsonify({"error": "Password attuale e nuova password sono obbligatorie"}), 400

        # Usa current_user
        if not current_user.check_password(data["current_password"]):
            return jsonify({"error": "Password attuale non corretta"}), 400

        current_user.set_password(data["new_password"])
        db.session.commit()
        return jsonify({"message": "Password cambiata con successo"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/google/login")
def google_login():
    redirect_uri = url_for("auth.google_callback", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@auth_bp.route("/google/callback")
def google_callback():
    try:
        token = oauth.google.authorize_access_token()
        user_info = token.get("userinfo")
        if not user_info:
            return redirect("http://localhost:5173/login?error=oauth_failed" )

        email = user_info.get("email")
        user = User.query.filter_by(email=email).first()

        if user:
            # Usa la funzione standard di Flask-Login
            login_user(user)
            return redirect("http://localhost:5173/" )
        else:
            session["oauth_profile"] = {
                "email": email,
                "first_name": user_info.get("given_name", ""),
                "last_name": user_info.get("family_name", ""),
            }
            session.modified = True
            return redirect("http://localhost:5173/complete-profile" )
    except Exception as e:
        print(f"Errore nel callback di Google: {e}")
        return redirect("http://localhost:5173/login?error=oauth_generic_error" )


@auth_bp.route("/complete-oauth", methods=["POST"])
def complete_oauth_registration():
    try:
        if "oauth_profile" not in session:
            return jsonify({"error": "Nessuna sessione OAuth in corso."}), 400

        data = request.get_json()
        username = data.get("username")
        if not username:
            return jsonify({"error": "Username obbligatorio"}), 400

        oauth_profile = session["oauth_profile"]
        email = oauth_profile.get("email")

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email già registrata"}), 409
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username già in uso"}), 409

        new_user = User(
            username=username,
            email=email,
            first_name=oauth_profile.get("first_name"),
            last_name=oauth_profile.get("last_name"),
        )
        random_password = os.urandom(16).hex()
        new_user.set_password(random_password)

        db.session.add(new_user)
        db.session.commit()

        session.pop("oauth_profile", None)
        # Usa la funzione standard di Flask-Login
        login_user(new_user)

        return jsonify({"user": new_user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERRORE CRITICO in complete_oauth_registration: {e} !!!")
        return jsonify({"error": "Errore interno del server"}), 500

@auth_bp.route('/check-username', methods=['POST'])
def check_username():
    data = request.get_json()
    username = data.get('username')

    if not username:
        return jsonify({"error": "Username is required"}), 400

    username_lower = username.lower()

    # --- CONTROLLO PROFESSIONALE DEI CARATTERI (REGEX) ---
    if not re.match(r"^[a-zA-Z0-9][a-zA-Z0-9_]{1,18}[a-zA-Z0-9]$", username):
        if len(username) < 3 or len(username) > 20:
            return jsonify({"available": False, "message": "Username must be 3-20 characters long."}), 200
        return jsonify({"available": False, "message": "Can contain letters, numbers, and underscores, but not at the start or end."}), 200

    # --- CONTROLLO PROFESSIONALE DELLE PAROLE PROIBITE (dal JSON) ---
    # Controllo 1: Corrispondenza esatta
    if username_lower in FORBIDDEN_EXACT_MATCHES:
        return jsonify({"available": False, "message": "This username is a reserved word."}), 200

    # Controllo 2: Contenuto proibito (substring)
    if any(sub in username_lower for sub in FORBIDDEN_SUBSTRINGS):
        return jsonify({"available": False, "message": "This username contains a restricted word."}), 200

    # Controllo 3: Esistenza nel database (case-insensitive)
    if User.query.filter(func.lower(User.username) == username_lower).first():
        return jsonify({"available": False, "message": "This username is already taken."}), 200

    # Se tutti i controlli passano
    return jsonify({"available": True, "message": "Username is available!"}), 200