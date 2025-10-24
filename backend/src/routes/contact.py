# LitInvestorBlog-backend/src/routes/contact.py

from flask import Blueprint, request, jsonify
from datetime import datetime
from src.utils.email_service import email_service

contact_bp = Blueprint("contact", __name__)

@contact_bp.route("/contact", methods=["POST"])
def submit_contact():
    try:
        data = request.get_json()

        required_fields = ["name", "email", "subject", "message"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} è obbligatorio"}), 400

        import re

        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, data["email"]):
            return jsonify({"error": "Email non valida"}), 400

        contact_data = {
            "name": data["name"],
            "email": data["email"],
            "subject": data["subject"],
            "message": data["message"],
            "type": data.get("type", "general"),
            "timestamp": datetime.now().isoformat(),
        }

        print(f"Nuovo messaggio di contatto: {contact_data}")

        # Invia email conferma al mittente
        success, msg = email_service.send_contact_confirmation(
            data["email"],
            data["name"],
            data["message"]
        )
        if not success:
            print(f"Errore invio conferma: {msg}")

        # Invia notifica al team
        success, msg = email_service.send_contact_notification(
            data["email"],
            data["name"],
            data["message"]
        )
        if not success:
            print(f"Errore invio notifica: {msg}")

        return (
            jsonify(
                {"message": "Messaggio inviato con successo", "data": contact_data}
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
