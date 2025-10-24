# src/utils/file_helpers.py

import os
import shutil
from flask import current_app


def delete_article_folder(slug: str):
    """
    Cancella la cartella di un articolo e tutto il suo contenuto in modo sicuro.

    Args:
        slug: Lo slug dell'articolo da cancellare.
    """
    try:
        # Costruisce il percorso completo della cartella dell'articolo
        base_path = os.path.join(current_app.root_path, 'static', 'uploads', 'articles')
        article_path = os.path.join(base_path, slug)

        # Controlla se la cartella esiste prima di tentare di cancellarla
        if os.path.isdir(article_path):
            # shutil.rmtree cancella una cartella e tutto il suo contenuto
            shutil.rmtree(article_path)
            print(f"Cartella dell'articolo '{slug}' eliminata con successo: {article_path}")
        else:
            print(f"La cartella per l'articolo '{slug}' non esisteva, nessuna azione richiesta.")

    except Exception as e:
        # Logga l'errore ma non blocca l'operazione principale (la cancellazione dal DB)
        print(f"ERRORE: Impossibile eliminare la cartella per l'articolo '{slug}'. Dettagli: {e}")

def delete_image_file(public_url: str):
    """
    Cancella un singolo file immagine dato il suo URL pubblico.

    Args:
        public_url: L'URL del file come salvato nel DB (es. /static/uploads/articles/slug/img.webp).
    """
    if not public_url or not public_url.startswith('/static/'):
        print(f"URL non valido o non gestito, impossibile cancellare: {public_url}")
        return

    try:
        # Rimuovi il prefisso /static/ per ottenere il percorso relativo
        relative_path = public_url[len('/static/'):]

        # Costruisci il percorso assoluto del file sul server
        file_path = os.path.join(current_app.root_path, 'static', relative_path)

        # Controlla se il file esiste prima di tentare di cancellarlo
        if os.path.isfile(file_path):
            os.remove(file_path)
            print(f"File immagine eliminato con successo: {file_path}")
        else:
            print(f"Il file immagine non esisteva, nessuna azione richiesta: {file_path}")

    except Exception as e:
        print(f"ERRORE: Impossibile eliminare il file immagine {public_url}. Dettagli: {e}")


def delete_avatar_file(avatar_url: str):
    """
    Cancella un singolo file avatar dato il suo URL pubblico.

    Args:
        avatar_url: L'URL del file come salvato nel DB (es. /static/uploads/avatars/profile_img_user.webp).
    """
    # Se l'URL è nullo, vuoto o non è un file statico gestito da noi, non fare nulla.
    if not avatar_url or not avatar_url.startswith('/static/uploads/avatars/'):
        print(f"URL avatar non valido o non gestito, nessuna azione richiesta: {avatar_url}")
        return

    try:
        # Rimuovi il prefisso /static/ per ottenere il percorso relativo
        relative_path = avatar_url[len('/static/'):]

        # Costruisci il percorso assoluto del file sul server
        file_path = os.path.join(current_app.root_path, 'static', relative_path)

        if os.path.isfile(file_path):
            os.remove(file_path)
            print(f"File avatar eliminato con successo: {file_path}")
        else:
            print(f"Il file avatar non esisteva, nessuna azione richiesta: {file_path}")

    except Exception as e:
        print(f"ERRORE: Impossibile eliminare il file avatar {avatar_url}. Dettagli: {e}")

