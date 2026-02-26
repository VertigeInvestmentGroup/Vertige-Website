import os, glob, re

for file in glob.glob('*.html'):
    if file == 'gs.html':
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'Regulatory Disclosures' in content:
        print(f'Found in {file}')
        new_content = re.sub(r'<a href=\"#\">Regulatory Disclosures</a>', r'<a href="disclosures.html">Regulatory Disclosures</a>', content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
print('Done updating links!')
