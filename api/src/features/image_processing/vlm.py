import os
import base64
from openai import OpenAI
from typing import Optional

def describe_image_base64(base64_image: str, mime_type: str = "image/jpeg") -> str:
    """
    Sends a base64 encoded image to a VLM (Vision-Language Model) to get a description.
    Prefers OpenRouter if OPENROUTER_API_KEY is set, otherwise falls back to OPENAI_API_KEY.
    """
    # Determine which client to use
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if openrouter_key:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=openrouter_key,
        )
        # We can use a popular vision model on OpenRouter like GPT-4o or Claude 3.5 Sonnet
        # It's good to allow overriding via ENV, default to gpt-4o
        model_name = os.getenv("VLM_MODEL", "openai/gpt-4o")
    elif openai_key:
        client = OpenAI(
            api_key=openai_key
        )
        model_name = os.getenv("VLM_MODEL", "gpt-4o")
    else:
        return "> [Image omitted: No VLM API key configured (OpenRouter or OpenAI)]"

    prompt = (
        "Describe this image accurately. If it is a chart or table, summarize the data. "
        "If it contains text, transcribe it. Be concise but do not lose important information."
    )

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        description = response.choices[0].message.content.strip()
        return f"> [Image Description: {description}]"
    except Exception as e:
        print(f"Error during VLM processing: {e}")
        return "> [Image omitted: Error during VLM processing]"

def describe_image_bytes(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """
    Helper function to describe an image from raw bytes.
    """
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    return describe_image_base64(base64_image, mime_type)
