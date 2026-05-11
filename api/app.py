from fastapi import FastAPI

app = FastAPI(
    title="GovBot",
    description="WhatsApp Gov Services",
    version="1.0.0"
)

# Router registration is handled exclusively by gov_agent/main.py.
# This module only creates the FastAPI instance so that main.py can
# import and extend it without circular dependencies.
