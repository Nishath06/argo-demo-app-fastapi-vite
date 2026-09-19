FROM python:3.12-slim

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Working directory
WORKDIR /app

# Install system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency file first (better Docker layer caching)
COPY requirements.txt .

# Upgrade pip + packaging tools BEFORE requirements (bootstrap)
RUN pip install --no-cache-dir --upgrade pip setuptools==78.1.1 wheel

# Install application dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Force-remove every stale/bundled copy of setuptools that Trivy may detect:
#   1. ensurepip bundled wheels (ships with python:3.12-slim, contains old setuptools)
#   2. Any leftover dist-info folders for setuptools < 78.x
RUN rm -rf /usr/local/lib/python3.12/ensurepip/_bundled && \
    find /usr/local/lib/python3.12 -maxdepth 2 \
         -name "setuptools-*.dist-info" \
         ! -name "setuptools-78*" \
         -exec rm -rf {} + 2>/dev/null || true && \
    pip install --no-cache-dir --upgrade setuptools==78.1.1

# Create non-root user
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --create-home --shell /bin/bash appuser

# Copy application code
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:8000/health || exit 1

# Start FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]