FROM nvidia/cuda:12.3.2-devel-ubuntu22.04

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    git

RUN pip3 install fastapi uvicorn torch torchvision torchaudio transformers bitsandbytes accelerate python-dotenv
RUN pip3 install flash-attn

COPY ./app /app

COPY .env /app/.env

EXPOSE 80

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80", "--reload"]