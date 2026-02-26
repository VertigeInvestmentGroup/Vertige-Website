from PIL import Image

def make_transparent(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Calculate brightness (0 to 255)
        brightness = sum(item[:3]) / 3.0
        
        # Calculate alpha: 255 (opaque) when brightness is 0 (black), 0 (transparent) when brightness is 255 (white)
        alpha = int(255 * (1 - (brightness / 255.0)))
        
        # The user requested only black dots, so we force the color to pitch black
        # and use the calculated alpha for smooth anti-aliasing edges
        newData.append((0, 0, 0, alpha))
        
    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    make_transparent("Gemini_Generated_Image_ix8rw5ix8rw5ix8r.png", "logo_transparent.png")
