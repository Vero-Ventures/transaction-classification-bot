from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from api.dependencies import check_key
import asyncio


router = APIRouter()


class GenerationParameters(BaseModel):
    prompt: str
    context: str = None


def get_formatted_input(messages, context):
    """
    Format the input for the model

    ChatQA model prompt format:
        when context is available:
            System: {System}
            {Context}
            User: {Question}
            Assistant: {Response}
            User: {Question}
            Assistant:

        when context is not available:
            System: {System}
            User: {Question}
            Assistant: {Response}
            User: {Question}
            Assistant:

    :param messages:
    :param context:
    :return:
    """

    system = (
        "System: This is a chat between a user and an artificial intelligence assistant. "
        "The assistant gives helpful, detailed, and polite answers to the user's questions based on the context. "
        "The assistant should also indicate when the answer cannot be found in the context."
    )
    instruction = "Please give a short 1-3 word word classification answer for the question."

    # TODO: Temporary fix for the instruction
    messages = [
        {"role": "user", "content": messages},
    ]

    print("Messages:")
    print(messages)

    for item in messages:
        if item["role"] == "user":
            # only apply this instruction for the first user turn
            item["content"] = instruction + " " + item["content"]
            break

    conversation = (
        "\n\n".join(
            [
                (
                    "User: " + item["content"]
                    if item["role"] == "user"
                    else "Assistant: " + item["content"]
                )
                for item in messages
            ]
        )
        + "\n\nAssistant:"
    )
    formatted_input = system + "\n\n" + context + "\n\n" + conversation

    return formatted_input


def generate_response(request: Request, input_data: GenerationParameters):
    model = request.app.state.model
    tokenizer = request.app.state.tokenizer
    if not model or not tokenizer:
        raise HTTPException(status_code=503, detail="Model not loaded")

    prompt = input_data.prompt
    context = input_data.context

    if prompt is None:
        raise HTTPException(status_code=400, detail="Missing prompt")

    if context is None:
        raise HTTPException(status_code=400, detail="Missing context")

    formatted_input = get_formatted_input(prompt, context)

    print("Formatted input:")
    print(formatted_input)

    tokenized_prompt = tokenizer(
        tokenizer.bos_token + formatted_input, return_tensors="pt"
    ).to(model.device)

    terminators = [
        tokenizer.eos_token_id,
        tokenizer.convert_tokens_to_ids("<|eot_id|>"),
    ]

    # TODO: Fine-tune the generation_kwargs
    generation_kwargs = {
        "input_ids": tokenized_prompt.input_ids,
        "attention_mask": tokenized_prompt.attention_mask,
        "eos_token_id": terminators,
        "max_new_tokens": 128,
        "penalty_alpha": 0.6,
        "repetition_penalty": 1.0,
        "temperature": 0.1,
        "top_k": 40,
        "top_p": 1.0,
        "do_sample": True,
        "use_cache": True,
        "num_beams": 1,
    }

    generated_ids = model.generate(**generation_kwargs)
    response = generated_ids[0][tokenized_prompt.input_ids.shape[-1] :]
    response_text = tokenizer.decode(response, skip_special_tokens=True)

    print("Response:")
    print(response_text)

    return response_text


@router.post("/generate", dependencies=[Depends(check_key)])
async def generate(request: Request, input_data: GenerationParameters):
    """
    Endpoint for the LLM
    """

    response_text = await asyncio.to_thread(generate_response, request, input_data)
    return {"response": response_text}
