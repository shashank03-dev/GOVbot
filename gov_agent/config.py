"""
Environment variable configuration module.

This module loads environment variables from a .env file and exports them
as configurable constants for the application.

- WHATSAPP_TOKEN: The authentication token for the WhatsApp API.
- WHATSAPP_PHONE_NUMBER_ID: The unique phone number identifier for WhatsApp.
- WHATSAPP_VERIFY_TOKEN: The verification token used to authenticate
  WhatsApp webhooks.
- SUPABASE_URL: The endpoint URL for the Supabase project database.
- SUPABASE_KEY: The API key for authenticating with the Supabase project.
- GEMINI_API_KEY: The API key for accessing Google's Gemini AI services.
"""
import os
from dotenv import load_dotenv

load_dotenv()

WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
if WHATSAPP_TOKEN is None:
    raise ValueError("WHATSAPP_TOKEN")

WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
if WHATSAPP_PHONE_NUMBER_ID is None:
    raise ValueError("WHATSAPP_PHONE_NUMBER_ID")

WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN")
if WHATSAPP_VERIFY_TOKEN is None:
    raise ValueError("WHATSAPP_VERIFY_TOKEN")

SUPABASE_URL = os.getenv("SUPABASE_URL")
if SUPABASE_URL is None:
    raise ValueError("SUPABASE_URL")

SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if SUPABASE_KEY is None:
    raise ValueError("SUPABASE_KEY")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY is None:
    raise ValueError("GEMINI_API_KEY")

SECRET_KEY = os.getenv("SECRET_KEY")
if SECRET_KEY is None:
    raise ValueError("SECRET_KEY")
