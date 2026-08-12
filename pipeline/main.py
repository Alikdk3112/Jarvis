"""Orchestrates the full pipeline: topic -> script -> voiceover -> B-roll -> final video.

Usage:
    python -m pipeline.main "Warum fuehlen sich so viele Studierende gerade orientierungslos?" de broll,studying,laptop
"""

import argparse
import re
from pathlib import Path

from . import config, script_gen, tts, visuals, assemble


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:40] or "video"


def run(topic: str, language: str, keywords: list[str]) -> str:
    config.SCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    config.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    slug = _slugify(topic)
    print(f"[1/4] Generiere Skript ({language})...")
    script_text = script_gen.generate_script(topic, language)
    script_path = config.SCRIPTS_DIR / f"{slug}-{language}.txt"
    script_path.write_text(script_text, encoding="utf-8")
    print(script_text)

    print("[2/4] Generiere Voiceover...")
    audio_path = str(config.OUTPUT_DIR / f"{slug}-{language}.mp3")
    tts.generate_voiceover(script_text, language, audio_path)

    print(f"[3/4] Lade B-Roll fuer Keywords: {keywords}...")
    broll_dir = config.OUTPUT_DIR / f"{slug}-{language}-broll"
    broll_paths = visuals.fetch_broll_for_keywords(keywords, str(broll_dir))
    if not broll_paths:
        raise RuntimeError("Keine B-Roll-Clips gefunden -- Keywords anpassen.")

    print("[4/4] Baue finales Video zusammen...")
    output_path = str(config.OUTPUT_DIR / f"{slug}-{language}.mp4")
    assemble.assemble_video(script_text, audio_path, broll_paths, output_path)

    print(f"Fertig: {output_path}")
    return output_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("topic")
    parser.add_argument("language", choices=["de", "en"], default="de", nargs="?")
    parser.add_argument("keywords", nargs="?", default="", help="Kommagetrennte Keywords fuer B-Roll-Suche")
    args = parser.parse_args()

    keyword_list = [k.strip() for k in args.keywords.split(",") if k.strip()] or [args.topic]
    run(args.topic, args.language, keyword_list)
