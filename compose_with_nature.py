import sys
import os
from pathlib import Path
from typing import Tuple

import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
from rembg import remove


def load_image(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    return image


def remove_bg(image: Image.Image) -> Image.Image:
    # rembg expects bytes; return RGBA with alpha
    output = remove(image.tobytes(), alpha_matting=True, post_process_mask=True)
    cutout = Image.open(BytesIO(output)).convert("RGBA")
    return cutout


def remove_bg_file(path: Path) -> Image.Image:
    with open(path, "rb") as f:
        data = f.read()
    cutout_bytes = remove(data, alpha_matting=True, post_process_mask=True)
    from io import BytesIO

    cutout = Image.open(BytesIO(cutout_bytes)).convert("RGBA")
    return cutout


def create_nature_background(size: Tuple[int, int]) -> Image.Image:
    # Simple gradient green-blue background if no photo is supplied
    width, height = size
    gradient = Image.new("RGB", (width, height), color=0)
    top = np.array([80, 160, 90], dtype=np.float32)     # green
    bottom = np.array([120, 170, 210], dtype=np.float32)  # sky blue

    arr = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        t = y / max(1, height - 1)
        color = (1 - t) * bottom + t * top
        arr[y, :, :] = color.astype(np.uint8)

    bg = Image.fromarray(arr, mode="RGB")

    # Add lens blur and vignetting slightly
    bg = bg.filter(ImageFilter.GaussianBlur(radius=1.2))

    # Add a subtle vignette
    vignette = Image.new("L", (width, height), 0)
    vign_draw = ImageOps.expand(vignette, border=0)
    # radial vignette mask
    xv, yv = np.meshgrid(np.linspace(-1, 1, width), np.linspace(-1, 1, height))
    r = np.sqrt(xv**2 + yv**2)
    mask = (1 - np.clip((r - 0.6) / 0.6, 0, 1)) * 255
    bg.putalpha(Image.fromarray(mask.astype(np.uint8)))
    bg_rgb = Image.alpha_composite(Image.new("RGBA", (width, height), (0, 0, 0, 255)), bg).convert("RGB")
    return bg_rgb


def add_shadow(cutout: Image.Image, offset: Tuple[int, int] = (10, 18), blur: int = 18, opacity: float = 0.45) -> Image.Image:
    if cutout.mode != "RGBA":
        cutout = cutout.convert("RGBA")
    shadow = Image.new("RGBA", cutout.size, (0, 0, 0, 0))
    alpha = cutout.split()[-1]
    base = Image.new("RGBA", cutout.size, (0, 0, 0, int(255 * opacity)))
    shadow.paste(base, mask=alpha)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    canvas = Image.new("RGBA", (cutout.width + abs(offset[0]), cutout.height + abs(offset[1])), (0, 0, 0, 0))
    canvas.paste(shadow, (max(offset[0], 0), max(offset[1], 0)))
    canvas.paste(cutout, (0, 0), mask=cutout)
    return canvas


def match_tone(subject: Image.Image, background: Image.Image) -> Image.Image:
    # Simple color harmony: adjust temperature and contrast
    subject_rgb = subject.convert("RGB")
    bg_mean = ImageStat.Stat(background).mean
    sub_mean = ImageStat.Stat(subject_rgb).mean
    # Gain to match brightness roughly
    gain = (sum(bg_mean) / 3.0) / max(1e-3, (sum(sub_mean) / 3.0))
    subject_rgb = ImageEnhance.Brightness(subject_rgb).enhance(np.clip(gain, 0.8, 1.2))
    subject_rgb = ImageEnhance.Color(subject_rgb).enhance(1.05)
    subject_rgb = ImageEnhance.Contrast(subject_rgb).enhance(1.06)
    subject_rgba = Image.merge("RGBA", (*subject_rgb.split(), subject.split()[-1]))
    return subject_rgba


def place_side_by_side(bg: Image.Image, left: Image.Image, right: Image.Image) -> Image.Image:
    width, height = bg.size
    target_height = int(height * 0.78)

    def scale_to_height(img: Image.Image, h: int) -> Image.Image:
        ratio = h / img.height
        w = int(img.width * ratio)
        return img.resize((w, h), Image.LANCZOS)

    left_scaled = scale_to_height(left, target_height)
    right_scaled = scale_to_height(right, target_height)

    # Compute positions with slight overlap towards center
    total_width = left_scaled.width + right_scaled.width
    scale = min(width * 0.9 / total_width, 1.0)
    if scale < 1.0:
        left_scaled = left_scaled.resize((int(left_scaled.width * scale), int(left_scaled.height * scale)), Image.LANCZOS)
        right_scaled = right_scaled.resize((int(right_scaled.width * scale), int(right_scaled.height * scale)), Image.LANCZOS)

    y_base = height - max(left_scaled.height, right_scaled.height) - int(height * 0.05)
    x_left = int(width * 0.15)
    x_right = width - right_scaled.width - int(width * 0.15)

    canvas = bg.convert("RGBA")
    canvas.paste(left_scaled, (x_left, y_base), left_scaled)
    canvas.paste(right_scaled, (x_right, y_base), right_scaled)
    return canvas


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Compose two portraits onto a nature background.")
    parser.add_argument("--father", required=True, help="Path to father's image file")
    parser.add_argument("--you", required=True, help="Path to your image file")
    parser.add_argument("--output", default="/workspace/father_daughter_nature.jpg", help="Output image path")
    parser.add_argument("--background", default="", help="Optional path to nature background photo")
    parser.add_argument("--size", default="1600x2000", help="Output size WIDTHxHEIGHT, e.g., 1600x2000")
    args = parser.parse_args()

    width, height = [int(v) for v in args.size.lower().split("x")] 

    father_path = Path(args.father)
    you_path = Path(args.you)

    if not father_path.exists() or not you_path.exists():
        print("Input files not found.")
        sys.exit(1)

    # Prepare background
    if args.background and Path(args.background).exists():
        bg = Image.open(args.background).convert("RGB")
        bg = ImageOps.fit(bg, (width, height), Image.LANCZOS, bleed=0.0, centering=(0.5, 0.6))
    else:
        bg = create_nature_background((width, height))

    # Cut out subjects
    father_cut = remove_bg_file(father_path)
    you_cut = remove_bg_file(you_path)

    # Optional: tone match and shadows
    father_cut = match_tone(father_cut, bg)
    you_cut = match_tone(you_cut, bg)

    father_cut = add_shadow(father_cut)
    you_cut = add_shadow(you_cut)

    # Compose
    bg_rgba = bg.convert("RGBA")
    composed = place_side_by_side(bg_rgba, father_cut, you_cut)

    # Final subtle grain for realism
    final = composed.convert("RGB")
    final.save(args.output, quality=95)
    print(f"Saved: {args.output}")


if __name__ == "__main__":
    from PIL import ImageStat
    from io import BytesIO
    main()