# src/routes/upload.py

import os
from flask import Blueprint, request, jsonify, current_app, session
from src.routes.auth import login_required
from src.utils.convert_img import convert_and_save_image  # Assicurati che l'import sia corretto

# Importa i modelli e le estensioni necessarie
from src.models.user import User
from src.extensions import db

upload_bp = Blueprint("upload", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename):
    """Controlla se l'estensione del file è consentita."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ====================================================================
# Rotta per caricare immagini per gli articoli del blog (MODIFICATA)
# Ora accetta parametri extra per organizzare i file.
# ====================================================================
@upload_bp.route("/image", methods=["POST"])
@login_required
def upload_image():
    # Controlla che il file sia presente
    if "image" not in request.files:
        return jsonify({"error": "Nessun file immagine trovato"}), 400

    file = request.files["image"]

    # Leggi i dati aggiuntivi inviati dal frontend (dal form)
    slug = request.form.get('slug')
    image_type = request.form.get('image_type', 'content')  # 'content' o 'cover'
    index = request.form.get('index', 0, type=int)

    # Validazione dei dati
    if not slug:
        return jsonify({"error": "Lo slug dell'articolo è obbligatorio per l'upload"}), 400
    if file.filename == "":
        return jsonify({"error": "Nessun file selezionato"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Tipo di file non consentito"}), 400

    try:
        # Definisce la cartella base per tutti gli upload
        base_upload_folder = os.path.join(current_app.root_path, "static", "uploads")

        # Chiama la nuova funzione di conversione passando tutti i parametri
        file_url = convert_and_save_image(
            file=file,
            base_upload_folder=base_upload_folder,
            subfolder='articles',
            slug=slug,
            image_type=image_type,
            index=index
        )

        # Restituisce l'URL dell'immagine salvata
        return jsonify({"url": file_url}), 200

    except Exception as e:
        print(f"Errore in upload_image: {str(e)}")
        return jsonify({"error": f"Impossibile elaborare il file: {str(e)}"}), 500


@upload_bp.route('/avatar', methods=['POST'])
@login_required
def upload_avatar():
    if 'avatar' not in request.files:
        return jsonify({"error": "Nessun file avatar trovato"}), 400

    file = request.files['avatar']

    if file.filename == '':
        return jsonify({"error": "Nessun file selezionato"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Tipo di file non consentito"}), 400

    try:
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({"error": "Utente non trovato"}), 404

        base_upload_folder = os.path.join(current_app.root_path, "static", "uploads")

        # Chiama la funzione aggiornata con i parametri per l'avatar
        file_url = convert_and_save_image(
            file=file,
            base_upload_folder=base_upload_folder,
            subfolder='avatars',
            username=user.username  # Passiamo lo username per il nome del file
        )

        user.avatar_url = file_url
        db.session.commit()

        return jsonify({"message": "Avatar aggiornato con successo", "avatar_url": file_url}), 200

    except Exception as e:
        print(f"Errore durante l'upload dell'avatar: {str(e)}")
        return jsonify({"error": f"Impossibile elaborare il file: {str(e)}"}), 500