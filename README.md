# Anonyme TikTok-Persona -- Content-Pipeline

Automatisierte Pipeline zur Erstellung von "faceless" TikTok-Videos (Voiceover
+ B-Roll + Untertitel) fuer eine fiktive, anonyme Persona. Kein echtes Gesicht,
keine echte Stimme -- vollstaendig KI-generiert, auf minimalem Budget
(kostenlose/guenstige Tools).

Details zur Persona (Ton, Themen, Grenzen) stehen in
[`persona/persona_bible.md`](persona/persona_bible.md) -- **das ist der
wichtigste Ort im Repo**, weil er den Ton aller generierten Videos steuert.

## Tech-Stack

| Schritt | Tool | Kosten |
|---|---|---|
| Skript-Generierung | OpenRouter (LLM) | ~0 (guenstige/freie Modelle) |
| Stimme | [edge-tts](https://github.com/rany2/edge-tts) | kostenlos |
| B-Roll | [Pexels API](https://www.pexels.com/api/) | kostenlos |
| Video-Zusammenbau + Untertitel | moviepy / ffmpeg (lokal) | kostenlos |

Upload auf TikTok ist **nicht** automatisiert -- die Pipeline erzeugt fertige
`.mp4`-Dateien, die manuell hochgeladen werden.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# .env mit OPENROUTER_API_KEY und PEXELS_API_KEY befuellen
```

`ffmpeg` muss zusaetzlich systemweit installiert sein (wird von moviepy
benoetigt).

## Nutzung

```bash
python -m pipeline.main "Warum fuehlen sich so viele Studierende gerade orientierungslos?" de "studying,laptop,city walk"
```

Ergebnis landet in `content/output/`:
- `<slug>-<sprache>.mp3` -- Voiceover
- `<slug>-<sprache>-broll/` -- heruntergeladene Stock-Clips
- `<slug>-<sprache>.mp4` -- fertiges Video

Das generierte Skript wird zusaetzlich in `content/scripts/` als `.txt`
abgelegt (zur Kontrolle/Archivierung).

## Status

Entwurf/MVP -- Persona-Bibel ist noch nicht final (siehe offene Punkte dort).
Untertitel-Timing ist aktuell eine Schaetzung nach Zeichenanzahl pro Satz,
nicht per Spracherkennung synchronisiert -- fuer echtes Wort-Timing kann
spaeter z.B. `faster-whisper` ergaenzt werden.
