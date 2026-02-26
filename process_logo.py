from PIL import Image

def process():
    img = Image.open('logo.jpg').convert('RGB')
    pixels = img.load()
    width, height = img.size
    
    new_img = Image.new('RGB', (width, height), (255, 255, 255))
    new_pixels = new_img.load()
    
    for x in range(width):
        for y in range(height):
            r, g, b = pixels[x, y]
            
            luma = max(r, g, b)
            if luma < 25:
                intensity = 0.0
            else:
                intensity = (luma - 25) / 230.0
                intensity = min(1.0, max(0.0, intensity))
                # sharpen the dots
                intensity = intensity ** 0.7
            
            ratio = y / float(height)
            
            # Dark blue at top, black at bottom
            target_r = int(24 * (1 - ratio))
            target_g = int(32 * (1 - ratio))
            target_b = int(90 * (1 - ratio))
            
            final_r = int(target_r * intensity + 255 * (1 - intensity))
            final_g = int(target_g * intensity + 255 * (1 - intensity))
            final_b = int(target_b * intensity + 255 * (1 - intensity))
            
            new_pixels[x, y] = (final_r, final_g, final_b)
            
    new_img.save("logo_generated.jpg", quality=95)

if __name__ == "__main__":
    process()
