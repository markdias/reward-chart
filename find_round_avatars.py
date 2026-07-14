import os
from PIL import Image

avatar_dir = '/Users/mdias9/myprojects/reward-chart/public/avatars'

def is_round(image_path):
    try:
        with Image.open(image_path) as img:
            img = img.convert('RGBA')
            width, height = img.size
            
            # Check corners (top-left, top-right, bottom-left, bottom-right)
            corners = [
                (0, 0),
                (width - 1, 0),
                (0, height - 1),
                (width - 1, height - 1)
            ]
            
            # If all corners are white or transparent, it's likely a round background
            corner_pixels = [img.getpixel(pos) for pos in corners]
            
            for r, g, b, a in corner_pixels:
                # check if transparent
                if a < 255:
                    continue
                # check if white or very close to white
                if r > 240 and g > 240 and b > 240:
                    continue
                # check if black
                if r < 15 and g < 15 and b < 15:
                    continue
                
                # If we found a colored pixel in the corner, it's likely a square background
                return False
                
            return True
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return False

round_avatars = []
for filename in os.listdir(avatar_dir):
    if filename.endswith('.png'):
        full_path = os.path.join(avatar_dir, filename)
        if is_round(full_path):
            round_avatars.append(filename)

print("Round avatars found:", round_avatars)
