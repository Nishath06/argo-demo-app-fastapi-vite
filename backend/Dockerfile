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

# Step 1 — Bootstrap: upgrade pip + all packaging tools to safe versions first
RUN pip install --no-cache-dir --upgrade \
    "pip" \
    "setuptools==78.1.1" \
    "wheel==0.46.2" \
    "jaraco.context==6.1.0"

# Step 2 — Install all application dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Step 3 — Force-re-pin all CVE-affected packages AFTER requirements install.
#           This ensures no transitive dependency resolution can downgrade them.
RUN pip install --no-cache-dir --force-reinstall \
    "setuptools==78.1.1" \
    "wheel==0.46.2" \
    "jaraco.context==6.1.0" \
    "msgpack==1.2.1"

# Step 4 — Wipe every stale bundled setuptools/wheel copy that Trivy scans:
#   - ensurepip/_bundled/ ships old .whl files with the base image
#   - Any leftover dist-info for packages below the fixed versions
RUN rm -rf /usr/local/lib/python3.12/ensurepip/_bundled && \
    find /usr/local/lib/python3.12/site-packages -maxdepth 1 \
         \( -name "setuptools-*.dist-info" ! -name "setuptools-78*" \
         -o -name "wheel-*.dist-info"     ! -name "wheel-0.46*"    \
         -o -name "msgpack-*.dist-info"   ! -name "msgpack-1.2*"   \
         \) -exec rm -rf {} + 2>/dev/null || true

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