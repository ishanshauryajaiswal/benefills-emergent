import os
import shutil
import base64
from PIL import Image

src_imgs = [
    "/Users/test/.gemini/antigravity/brain/2d7ff662-c539-41d4-bbe4-bb6453b824cd/jar_spoon_lifestyle_benefills_1772046575642.png",
    "/Users/test/.gemini/antigravity/brain/2d7ff662-c539-41d4-bbe4-bb6453b824cd/smoothie_bowl_benefills_1772046666146.png",
    "/Users/test/.gemini/antigravity/brain/2d7ff662-c539-41d4-bbe4-bb6453b824cd/rice_cracker_benefills_1772046748547.png",
    "/Users/test/.gemini/antigravity/brain/2d7ff662-c539-41d4-bbe4-bb6453b824cd/pre_workout_bar_benefills_1772046818296.png",
    "/Users/test/.gemini/antigravity/brain/2d7ff662-c539-41d4-bbe4-bb6453b824cd/desk_bar_benefills_1772046854972.png",
    "/Users/test/.gemini/antigravity/brain/2d7ff662-c539-41d4-bbe4-bb6453b824cd/commute_bar_benefills_1772046883411.png"
]

dest_dir = "/Users/test/Desktop/Antigravity/benefills emergent/frontend/public/images/lifestyle"
names = ["jar_spoon.webp", "smoothie_bowl.webp", "rice_cracker.webp", "pre_workout.webp", "desk_bar.webp", "commute_bar.webp"]

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

for src, name in zip(src_imgs, names):
    dest = os.path.join(dest_dir, name)
    try:
        img = Image.open(src)
        img.thumbnail((600, 600))
        img.save(dest, 'WEBP', quality=80)
        print(f"Saved {dest}")
    except Exception as e:
        print(f"Failed to process {src}: {e}")
