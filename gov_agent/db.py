from supabase import create_client
from gov_agent.config import SUPABASE_URL, SUPABASE_KEY

supabase = create_client(str(SUPABASE_URL), str(SUPABASE_KEY))
