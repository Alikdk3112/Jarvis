"""Generates a voiceover audio file from a script using edge-tts (free, no API key)."""

import asyncio

import edge_tts

from . import config


async def _synthesize(text: str, voice: str, output_path: str) -> None:
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)


def generate_voiceover(text: str, language: str, output_path: str) -> str:
    """language: 'de' or 'en'. Returns the output_path."""
    voice = config.EDGE_TTS_VOICE_DE if language == "de" else config.EDGE_TTS_VOICE_EN
    asyncio.run(_synthesize(text, voice, output_path))
    return output_path


if __name__ == "__main__":
    import sys

    text_arg = sys.argv[1] if len(sys.argv) > 1 else "Das ist ein Test."
    lang_arg = sys.argv[2] if len(sys.argv) > 2 else "de"
    out_arg = sys.argv[3] if len(sys.argv) > 3 else "test.mp3"
    generate_voiceover(text_arg, lang_arg, out_arg)
    print(f"Gespeichert unter {out_arg}")
