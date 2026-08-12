import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

ROOT_DIR = Path(__file__).resolve().parent.parent
PERSONA_BIBLE_PATH = ROOT_DIR / "persona" / "persona_bible.md"
SCRIPTS_DIR = ROOT_DIR / "content" / "scripts"
OUTPUT_DIR = ROOT_DIR / "content" / "output"

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "deepseek/deepseek-chat-v3-0324:free")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY", "")

EDGE_TTS_VOICE_DE = os.environ.get("EDGE_TTS_VOICE_DE", "de-DE-FlorianMultilingualNeural")
EDGE_TTS_VOICE_EN = os.environ.get("EDGE_TTS_VOICE_EN", "en-US-AndrewMultilingualNeural")
