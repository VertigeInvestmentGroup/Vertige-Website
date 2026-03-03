import glob

for file in glob.glob('*.html'):
    if file == 'downloaded.html':
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    btn_html = '<div class="mobile-close-btn" id="mobile-close-btn">&times;</div>'
    if btn_html not in content:
        content = content.replace('<div class="mobile-menu" id="mobile-menu">', f'<div class="mobile-menu" id="mobile-menu">\n        {btn_html}')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('Done')
