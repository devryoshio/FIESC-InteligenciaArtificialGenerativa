##############################
# Etapa 1 - Build do React
##############################

FROM node:22-alpine AS frontend

WORKDIR /frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend .

RUN npm run build


##############################
# Etapa 2 - Backend FastAPI
##############################

FROM python:3.10-slim

WORKDIR /app

# Dependências do sistema
RUN apt-get update && apt-get install -y \
    ffmpeg \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Dependências Python
COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copia o backend
COPY backend .

# Copia o React compilado
COPY --from=frontend /frontend/dist ./frontend/dist

# Cria pasta uploads
RUN mkdir -p uploads

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]