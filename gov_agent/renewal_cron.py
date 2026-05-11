"""
Renewal Reminder Cron Script
Standalone entry point for triggering renewal reminders externally.
Can be run via:
- Supabase pg_cron (call POST /renewals/run-reminders)
- External cron job (cron-job.org, GitHub Actions, etc.)
- Cloud Run scheduled job
- Render cron job

The actual reminder logic lives in renewal_router.run_renewal_reminders()
so both the HTTP endpoint and this script share a single implementation.
"""
import asyncio
import os
import sys
from datetime import datetime

# Add parent directory to path for imports when run as a script
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def send_renewal_reminders() -> dict:
    """
    Delegate to renewal_router.run_renewal_reminders so the cron script
    and the HTTP endpoint share a single implementation.
    """
    from gov_agent.renewal_router import run_renewal_reminders
    result = await run_renewal_reminders()
    return {"sent": result.sent_count, "failed": 0}


async def main():
    """Main entry point for cron job."""
    print(f"[{datetime.now()}] Starting renewal reminder cron job")
    result = await send_renewal_reminders()
    print(f"[{datetime.now()}] Renewal reminder job completed: {result}")


if __name__ == "__main__":
    asyncio.run(main())
