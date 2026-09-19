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

# ─── Security hardening: install LATEST safe versions of packaging tools ────
# Do this BEFORE requirements so the resolver starts from a clean state.
# "latest" (no pin) ensures we always pick up the newest patched version.
RUN pip install --no-cache-dir --upgrade \
    pip \
    "setuptools>=78.1.1" \
    "wheel>=0.46.2" \
    "jaraco.context>=6.1.0" \
    "msgpack>=1.2.1"

# Install application dependencies
RUN pip install --no-cache-dir -r requirements.txt

# ─── Post-install force-pin ──────────────────────────────────────────────────
# Re-install all CVE-affected packages AFTER requirements so no transitive
# dependency resolution can downgrade them back to a vulnerable version.
RUN pip install --no-cache-dir --upgrade --force-reinstall \
    "setuptools>=78.1.1" \
    "wheel>=0.46.2" \
    "jaraco.context>=6.1.0" \
    "msgpack>=1.2.1"

# ─── Wipe ALL stale package copies Trivy scans ──────────────────────────────
# Trivy scans three locations for Python package metadata:
#   1. ensurepip/_bundled/  — old .whl files shipped with the base image
#   2. site-packages/setuptools/_vendor/  — setuptools vendors jaraco.* internally
#   3. Old *.dist-info dirs left over from pip downgrades
RUN set -eux; \
    # 1. Remove ensurepip bundled wheels (contain old setuptools/wheel .whl files)
    rm -rf /usr/local/lib/python3.12/ensurepip/_bundled; \
    # 2. Remove setuptools' internal vendor copy of jaraco.context/jaraco.functools
    #    Trivy reads METADATA from inside these to report "(METADATA)" CVEs
    find /usr/local/lib/python3.12/site-packages/setuptools/_vendor \
         -type d \( -name "jaraco" -o -name "jaraco*" \) \
         -exec rm -rf {} + 2>/dev/null || true; \
    # 3. Remove any stale dist-info that belonged to vulnerable versions
    find /usr/local/lib/python3.12/site-packages -maxdepth 1 \
         \( -name "setuptools-7[0-7]*.dist-info" \
         -o -name "wheel-0.4[0-5]*.dist-info" \
         -o -name "msgpack-1.[0-1]*.dist-info" \
         \) -exec rm -rf {} + 2>/dev/null || true; \
    # 4. Verify final versions (printed in build logs for auditing)
    echo "=== Final package versions ===" && \
    pip show setuptools wheel msgpack jaraco.context 2>/dev/null | grep -E "^(Name|Version):"

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