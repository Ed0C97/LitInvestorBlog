from functools import wraps
from flask import jsonify
from flask_login import current_user


def role_required(role_name):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # --- INIZIO CODICE DI DEBUG ---
            print("--- CONTROLLO PERMESSI IN CORSO ---")
            print(f"Utente attuale: {current_user}")
            print(f"L'utente è autenticato? {current_user.is_authenticated}")

            if current_user.is_authenticated:
                print(f"Ruolo dell'utente nel DB: '{current_user.role}'")
                print(f"Ruolo richiesto: '{role_name}'")
                print(f"Il ruolo corrisponde? {current_user.role == role_name}")
            else:
                print("L'utente non è autenticato.")

            print("------------------------------------")
            # --- FINE CODICE DI DEBUG ---

            if not current_user.is_authenticated:
                return jsonify({"success": False, "message": "Autenticazione richiesta"}), 401

            if current_user.role != role_name:
                return jsonify(
                    {"success": False, "message": "Permessi insufficienti"}), 403  # 403 è più corretto di 401

            return f(*args, **kwargs)

        return decorated_function

    return decorator


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # --- INIZIO CODICE DI DEBUG ---
        print("--- CONTROLLO PERMESSI ADMIN IN CORSO ---")
        print(f"Utente attuale: {current_user}")
        print(f"L'utente è autenticato? {current_user.is_authenticated}")

        if current_user.is_authenticated:
            # Usiamo hasattr per evitare errori se l'utente non ha un ruolo
            if hasattr(current_user, 'role'):
                print(f"Ruolo dell'utente nel DB: '{current_user.role}'")
                print("Ruolo richiesto: 'admin'")
                print(f"Il ruolo è 'admin'? {current_user.role == 'admin'}")
            else:
                print("L'oggetto utente non ha un attributo 'role'.")
        else:
            print("L'utente non è autenticato.")

        print("------------------------------------")
        # --- FINE CODICE DI DEBUG ---

        if not current_user.is_authenticated:
            return jsonify({"success": False, "message": "Autenticazione richiesta"}), 401

        # Controlliamo anche i collaboratori, come nel tuo RoleGuard del frontend
        allowed_roles = ['admin', 'collaborator']
        if not hasattr(current_user, 'role') or current_user.role not in allowed_roles:
            return jsonify({"success": False, "message": "Permessi di amministratore o collaboratore richiesti"}), 403

        return f(*args, **kwargs)

    return decorated_function