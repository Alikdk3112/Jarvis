"""Assembles voiceover + B-roll clips + burned-in captions into a final vertical mp4."""

import re
from pathlib import Path

from moviepy.editor import (
    AudioFileClip,
    CompositeVideoClip,
    TextClip,
    VideoFileClip,
    concatenate_videoclips,
)

VIDEO_SIZE = (1080, 1920)


def _split_sentences(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [s for s in sentences if s]


def _build_broll_track(broll_paths: list[str], total_duration: float):
    clips = [VideoFileClip(p) for p in broll_paths]
    per_clip_duration = total_duration / len(clips)

    segments = []
    for clip in clips:
        segment = clip.subclip(0, min(per_clip_duration, clip.duration)).resize(height=VIDEO_SIZE[1])
        segment = segment.crop(x_center=segment.w / 2, width=VIDEO_SIZE[0])
        segments.append(segment)

    track = concatenate_videoclips(segments, method="compose")
    if track.duration < total_duration:
        track = track.loop(duration=total_duration)
    return track.subclip(0, total_duration)


def _build_caption_clips(script_text: str, total_duration: float):
    sentences = _split_sentences(script_text)
    if not sentences:
        return []

    total_chars = sum(len(s) for s in sentences)
    captions = []
    t = 0.0
    for sentence in sentences:
        duration = total_duration * (len(sentence) / total_chars)
        caption = (
            TextClip(
                sentence,
                fontsize=64,
                color="white",
                font="DejaVu-Sans-Bold",
                method="caption",
                size=(int(VIDEO_SIZE[0] * 0.85), None),
                stroke_color="black",
                stroke_width=3,
            )
            .set_position(("center", "center"))
            .set_start(t)
            .set_duration(duration)
        )
        captions.append(caption)
        t += duration
    return captions


def assemble_video(script_text: str, audio_path: str, broll_paths: list[str], output_path: str) -> str:
    audio = AudioFileClip(audio_path)
    duration = audio.duration

    broll_track = _build_broll_track(broll_paths, duration)
    captions = _build_caption_clips(script_text, duration)

    final = CompositeVideoClip([broll_track, *captions], size=VIDEO_SIZE).set_audio(audio)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    final.write_videofile(output_path, fps=30, codec="libx264", audio_codec="aac")
    return output_path
