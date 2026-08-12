"""Generates a TikTok voiceover script from the persona bible + a topic, via OpenRouter."""

import json

import httpx

from . import config

SYSTEM_PROMPT_TEMPLATE = """Du bist ein Ghostwriter fuer eine anonyme, fiktive TikTok-Persona.
Halte dich strikt an die folgende Persona-Beschreibung. Schreibe NIE aus der Ich-Perspektive
einer echten, identifizierbaren Person -- die Persona ist fiktiv.

PERSONA-BIBEL:
{persona_bible}

AUFGABE:
Schreibe ein gesprochenes Voiceover-Skript (kein Bild-/Kamerahinweise, nur Sprechtext) fuer ein
TikTok-Video von 30-60 Sekunden Laenge, in der Sprache: {language}.
Thema: {topic}

Regeln:
- Direkter Einstieg (Hook) in den ersten 2 Saetzen, kein "Hallo zusammen".
- Kurze, gesprochene Saetze, keine Bullet-Points, keine Emojis.
- Ton wie in der Persona-Bibel beschrieben.
- Gib NUR den reinen Sprechtext zurueck, keine Ueberschriften, keine Meta-Kommentare.
"""


def _load_persona_bible() -> str:
    return config.PERSONA_BIBLE_PATH.read_text(encoding="utf-8")


def generate_script(topic: str, language: str = "de") -> str:
    """language: 'de' or 'en'"""
    if not config.OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY ist nicht gesetzt (siehe .env.example)")

    persona_bible = _load_persona_bible()
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(persona_bible=persona_bible, language=language, topic=topic)

    response = httpx.post(
        f"{config.OPENROUTER_BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {config.OPENROUTER_API_KEY}"},
        json={
            "model": config.OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Schreibe das Skript zum Thema: {topic}"},
            ],
        },
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"].strip()


if __name__ == "__main__":
    import sys

    topic_arg = sys.argv[1] if len(sys.argv) > 1 else "Wie AI das Studieren veraendert"
    lang_arg = sys.argv[2] if len(sys.argv) > 2 else "de"
    print(generate_script(topic_arg, lang_arg))
