import json
import os
import glob

# Configuration
ALBUMS_DIR = "src/albums"
MASTER_FILE = "src/albums.json"

def build_index():
    print("🔨 Building Master Album List...")
    
    albums = []
    # Find all .json files in the albums folder
    files = glob.glob(os.path.join(ALBUMS_DIR, "*.json"))

    # Sort files by "Date Modified" (Newest first)
    # This ensures your latest uploads appear at the top of the site
    files.sort(key=os.path.getmtime, reverse=True)

    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Quick check to make sure it's a real album file
                if "title" in data and "items" in data:
                    albums.append(data)
                else:
                    print(f"⚠️  Skipping invalid file: {file_path}")
        except Exception as e:
            print(f"❌ Error reading {file_path}: {e}")

    # Write the master file that script.js reads
    with open(MASTER_FILE, 'w', encoding='utf-8') as f:
        json.dump(albums, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Success! Added {len(albums)} albums to {MASTER_FILE}")

if __name__ == "__main__":
    build_index()