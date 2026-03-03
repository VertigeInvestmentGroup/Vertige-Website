import glob
import re
import time

html_files = glob.glob('*.html')
stamp = int(time.time())

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = re.sub(r'href="styles\.css\?v=[0-9]+"', f'href="styles.css?v={stamp}"', content)
    content = re.sub(r'src="script\.js\?v=[0-9]+"', f'src="script.js?v={stamp}"', content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print(f"Cache dynamically busted to v={stamp}")
