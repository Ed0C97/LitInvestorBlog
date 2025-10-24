# src/utils/convert_img.py

import os
from PIL import Image
from werkzeug.datastructures import FileStorage

def convert_and_save_image(
        file: FileStorage,
        base_upload_folder: str,
        subfolder: str,
        *,  # Il simbolo '*' forza i parametri successivi a essere specificati per nome (keyword-only)
        slug: str = None,
        username: str = None,
        image_type: str = 'content',
        index: int = 0
) -> str:
    """
    Converte un'immagine in WebP e la salva in una struttura di cartelle logica.
    Gestisce sia le immagini degli articoli che gli avatar degli utenti.

    Args:
        file: L'oggetto file.
        base_upload_folder: Il percorso della cartella 'uploads'.
        subfolder: 'articles' o 'avatars'.
        slug: (Richiesto per articoli) Lo slug dell'articolo.
        username: (Richiesto per avatar) Lo username dell'utente.
        image_type: 'cover' o 'content' per gli articoli.
        index: Numero progressivo per le immagini di contenuto degli articoli.

    Returns:
        L'URL pubblico del file salvato.
    """
    try:
        if subfolder == 'articles':
            if not slug:
                raise ValueError("Lo 'slug' è richiesto per le immagini degli articoli.")

            # Es: .../static/uploads/articles/il-mio-primo-articolo
            destination_folder = os.path.join(base_upload_folder, subfolder, slug)

            if image_type == 'cover':
                new_filename = f"img_{slug}_copertina.webp"
            else:
                new_filename = f"img_{slug}_{index}.webp"

        elif subfolder == 'avatars':
            if not username:
                raise ValueError("Lo 'username' è richiesto per gli avatar.")

            # Es: .../static/uploads/avatars
            destination_folder = os.path.join(base_upload_folder, subfolder)

            new_filename = f"profile_img_{username}.webp"

        else:
            raise ValueError(f"Sottocartella '{subfolder}' non supportata.")

        os.makedirs(destination_folder, exist_ok=True)
        save_path = os.path.join(destination_folder, new_filename)

        with Image.open(file.stream) as img:
            if img.mode != "RGB":
                img = img.convert("RGB")

            # Ridimensionamento specifico per tipo
            if subfolder == 'avatars':
                # Avatar sono quadrati e più piccoli
                size = (256, 256)
                img = img.resize(size, Image.Resampling.LANCZOS)
            else:
                # Immagini articoli più grandi
                max_width = 1200
                if img.width > max_width:
                    height = int((max_width / img.width) * img.height)
                    img = img.resize((max_width, height), Image.Resampling.LANCZOS)

            img.save(save_path, "webp", quality=85)

        # Costruisce l'URL pubblico corretto
        if subfolder == 'articles':
            public_url = f"/static/uploads/{subfolder}/{slug}/{new_filename}"
        else:  # per 'avatars'
            public_url = f"/static/uploads/{subfolder}/{new_filename}"

        return public_url

    except Exception as e:
        print(f"Errore in convert_and_save_image: {e}")
        raise e