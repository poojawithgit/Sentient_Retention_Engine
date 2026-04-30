import os
import re

dir_paths = [
    (r"d:\Hackathon\Sentient-Retention Engine\frontend\src\components\landing", "../../assets/landing/"),
    (r"d:\Hackathon\Sentient-Retention Engine\frontend\src\pages", "../assets/landing/")
]

for d, asset_prefix in dir_paths:
    if not os.path.exists(d): continue
    for filename in os.listdir(d):
        if filename.endswith(".jsx"):
            file_path = os.path.join(d, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Fix asset paths
            content = re.sub(r'import\s+(\w+)\s+from\s+"[\./]+assets/landing/([^"]+)"', rf'import \1 from "{asset_prefix}\2"', content)
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)

print("Fixed asset paths in all landing components and pages")
