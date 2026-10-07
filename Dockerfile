FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
RUN useradd --create-home --shell /usr/sbin/nologin appuser

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ai_model ./ai_model
COPY backend ./backend
COPY alembic.ini ./alembic.ini

USER appuser
EXPOSE 5000
CMD ["python", "-m", "backend.app"]
