# Dockerfile per backend Flask (opzionale, Render può usare buildpack Python)
FROM python:3.11-slim

WORKDIR /app

# Installa dipendenze di sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements e installa dipendenze Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia il codice dell'applicazione
COPY . .

# Espone la porta
EXPOSE 10000

# Comando di avvio
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "4", "wsgi:app"]
