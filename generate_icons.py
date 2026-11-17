from PIL import Image
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
src_path = BASE_DIR / "public" / "paw_icon.png"
res_dir = BASE_DIR / "android" / "app" / "src" / "main" / "res"

sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

img = Image.open(src_path).convert("RGBA")

for folder, dim in sizes.items():
    dest = os.path.join(res_dir, folder)
    os.makedirs(dest, exist_ok=True)
    
    # Square ic_launcher
    resized = img.resize((dim, dim), Image.Resampling.LANCZOS)
    resized.save(os.path.join(dest, 'ic_launcher.png'), 'PNG')
    
    # Round ic_launcher_round
    resized.save(os.path.join(dest, 'ic_launcher_round.png'), 'PNG')
    
    # Foreground with padding for adaptive icon
    pad = int(dim * 0.15)
    inner_dim = dim - (pad * 2)
    inner_resized = img.resize((inner_dim, inner_dim), Image.Resampling.LANCZOS)
    fg = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    fg.paste(inner_resized, (pad, pad), inner_resized)
    fg.save(os.path.join(dest, 'ic_launcher_foreground.png'), 'PNG')

print("All Android launcher icons generated successfully!")
