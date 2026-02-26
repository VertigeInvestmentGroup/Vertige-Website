import os, glob, re

for file in glob.glob('*.html'):
    if file == 'gs.html':
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(r'\s*<a href="[^"]*">Privacy and Security</a>', '', content)
    new_content = re.sub(r'\s*<a href="[^"]*">Terms of Use</a>', '', new_content)
    new_content = re.sub(r'\s*<a href="[^"]*">Site Map</a>', '', new_content)

    if content != new_content:
        print(f'Updated {file}')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)

print('Done removing links!')
