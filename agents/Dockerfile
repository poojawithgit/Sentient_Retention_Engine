FROM python:3.11-slim
WORKDIR /app

# Install requirements
COPY agents/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY agents .

EXPOSE 8002
CMD ["uvicorn", "api.ai_api:app", "--host", "0.0.0.0", "--port", "8002"]
