import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: str = os.getenv("DATABASE_URL", "")
APP_ENV: str = os.getenv("APP_ENV", "development")
