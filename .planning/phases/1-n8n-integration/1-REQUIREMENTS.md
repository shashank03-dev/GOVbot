# Phase 1 Context: n8n WhatsApp Integration

## Core Decisions
- **Architecture**: n8n acts as the primary orchestration layer. It receives webhooks from WhatsApp and calls the GOVbot API for message processing.
- **Communication Protocol**: REST via HTTP POST.
- **n8n -> GOVbot API**: GOVbot will expose a new endpoint `/n8n/chat` to handle requests from n8n.
- **Payload Schema**:
  - Request: `{"phone": "string", "message": "string"}`
  - Response: `{"reply": "string"}`
- **Fallback Policy**: Existing direct WhatsApp Graph API code (`whatsapp_sender.py` and direct webhook logic) will be kept as a secondary path/fallback.
- **Entry Point**: The `session_manager.handle_incoming` function remains the core logic processor.

## Reusable Assets
- `gov_agent/session_manager.py`: Logic for stateful conversations and RAG.
- `gov_agent/models.py`: `WhatsAppIncoming` model can be adapted or reused for the new endpoint.

## Locked Choices
- n8n is the "trigger" and "reply" executor.
- No direct removal of legacy WhatsApp code in this phase.

## Deferred / Gray Areas
- Authentication between n8n and GOVbot (will use a simple API key/token for now if needed, or open for prototyping).
- Dynamic n8n workflow switching based on intent.
