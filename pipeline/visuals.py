"""Fetches free stock B-roll video clips from Pexels matching given keywords."""

from pathlib import Path

import httpx

from . import config

PEXELS_VIDEO_SEARCH_URL = "https://api.pexels.com/videos/search"


def search_clip_urls(keyword: str, per_page: int = 3) -> list[str]:
    if not config.PEXELS_API_KEY:
        raise RuntimeError("PEXELS_API_KEY ist nicht gesetzt (siehe .env.example)")

    response = httpx.get(
        PEXELS_VIDEO_SEARCH_URL,
        headers={"Authorization": config.PEXELS_API_KEY},
        params={"query": keyword, "orientation": "portrait", "per_page": per_page},
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    urls = []
    for video in data.get("videos", []):
        # Pick the smallest portrait file that's still reasonable quality (keeps downloads/storage light).
        files = sorted(video.get("video_files", []), key=lambda f: f.get("width") or 9999)
        for f in files:
            if f.get("width") and f["width"] >= 720:
                urls.append(f["link"])
                break
    return urls


def download_clip(url: str, output_path: str) -> str:
    with httpx.stream("GET", url, timeout=60) as response:
        response.raise_for_status()
        with open(output_path, "wb") as f:
            for chunk in response.iter_bytes():
                f.write(chunk)
    return output_path


def fetch_broll_for_keywords(keywords: list[str], output_dir: str) -> list[str]:
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    paths = []
    for i, keyword in enumerate(keywords):
        urls = search_clip_urls(keyword, per_page=1)
        if not urls:
            continue
        clip_path = str(Path(output_dir) / f"broll_{i}.mp4")
        download_clip(urls[0], clip_path)
        paths.append(clip_path)
    return paths
