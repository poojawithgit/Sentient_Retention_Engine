import os
import re

dir_paths = [
    r"d:\Hackathon\Sentient-Retention Engine\frontend\src\components\landing",
    r"d:\Hackathon\Sentient-Retention Engine\frontend\src\pages"
]

replacements = [
    (r":\s*\{[^}]+\}", ""), # Remove prop type annotations
    (r"<HTMLDivElement>", ""), # Remove useRef generics
    (r"<HTMLCanvasElement>", ""),
    (r":\s*MouseEvent", ""), # Remove event types
    (r"import\s+(\w+)\s+from\s+\"@/assets/([^\"]+)\"", r'import \1 from "../assets/landing/\2"'), # Fix assets
    (r"import\s+(\w+)\s+from\s+\"@/components/landing/([^\"]+)\"", r'import { \1 } from "../components/landing/\2"'),
    (r"from\s+\"@/components/landing/([^\"]+)\"", r'from "../components/landing/\1"'),
    (r"@/components/ui/([^\"]+)", r"../components/ui/\1"), # Fix UI components
    (r"@/lib/utils", "../lib/utils"), # Fix utils
    (r":\s*Intl\.DateTimeFormatOptions", ""), # Remove specific types
    (r"\s+as\s+\w+", ""), # Remove 'as HTMLElement' style assertions
]

for d in dir_paths:
    if not os.path.exists(d): continue
    for filename in os.listdir(d):
        if filename.endswith(".jsx"):
            file_path = os.path.join(d, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            for pattern, replacement in replacements:
                content = re.sub(pattern, replacement, content)
            
            # Special case for depth fix in components/landing
            if "components\\landing" in d:
                content = content.replace('../assets/landing/', '../../assets/landing/')
                content = content.replace('../components/ui/', '../ui/')
                content = content.replace('../lib/utils', '../../lib/utils')
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)

print("Cleaned up landing components and pages")
