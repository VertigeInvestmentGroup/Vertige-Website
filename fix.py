import json

with open('chart_data.json', 'r', encoding='utf-8') as f:
    chart_data = f.read()

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

target = """            // Fetch the generated data from chart_data.json
            const res = await fetch('chart_data.json');
            if (!res.ok) throw new Error("HTTP error " + res.status);
            const data = await res.json();"""

replacement = "            // Use inline data instead of fetching to support file:/// protocol\n            const data = " + chart_data + ";"

new_js = js.replace(target, replacement)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(new_js)

print('Success!' if target in js else 'Target not found!')
