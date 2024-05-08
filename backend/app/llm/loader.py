from contextlib import asynccontextmanager
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    AutoModel,
    BitsAndBytesConfig,
)
import gc
import os
from dotenv import load_dotenv

load_dotenv()
model_id = os.getenv("MODEL_PATH")
query_encoder_id = os.getenv("QUERY_MODEL_PATH")
context_encoder_id = os.getenv("CONTEXT_MODEL_PATH")


def load_model(model_path):
    if torch.cuda.is_available():
        device = "cuda"

        quantization_config = BitsAndBytesConfig(load_in_4bit=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            device_map="auto",
            quantization_config=quantization_config,
            attn_implementation="flash_attention_2",
        )
    else:
        device = "cpu"

        model = AutoModelForCausalLM.from_pretrained(model_path)

    print("Device: " + device)

    model.eval()
    tokenizer = AutoTokenizer.from_pretrained(model_path, use_fast=True)
    return model, tokenizer


def load_encoders(query_encoder_path, context_encoder_path):
    retriever_tokenizer = AutoTokenizer.from_pretrained(query_encoder_path)
    query_encoder = AutoModel.from_pretrained(query_encoder_path)
    context_encoder = AutoModel.from_pretrained(context_encoder_path)
    return retriever_tokenizer, query_encoder, context_encoder


@asynccontextmanager
async def model_lifespan(app):
    model, tokenizer = load_model(model_id)
    app.state.model = model
    app.state.tokenizer = tokenizer

    retriever_tokenizer, query_encoder, context_encoder = load_encoders(
        query_encoder_id, context_encoder_id
    )
    app.state.retriever_tokenizer = retriever_tokenizer
    app.state.query_encoder = query_encoder
    app.state.context_encoder = context_encoder

    try:
        yield
    finally:
        del model
        del tokenizer
        app.state.model = None
        app.state.tokenizer = None

        del retriever_tokenizer
        del query_encoder
        del context_encoder
        app.state.retriever_tokenizer = None
        app.state.query_encoder = None
        app.state.context_encoder = None

        gc.collect()
        torch.cuda.empty_cache()
