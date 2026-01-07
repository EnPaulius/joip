import requests
import json
import os

def load_config():
    """Loads the API token from config.json."""
    try:
        with open("config.json", "r") as f:
            config = json.load(f)
            return config.get("API_TOKEN")
    except FileNotFoundError:
        print("Error: config.json not found. Please create it and add your API token.")
        return None

def get_album_data(url_or_id, token):
    """Fetches and formats data from an ImgChest album."""
    # 1. Get user input for the full block
    title = input("Enter the Title for this album: ")
    narration_url = input("Paste the Narration URL (e.g., soundgasm): ")
    
    # 2. Extract ID and make API call
    if "/" in url_or_id:
        post_id = url_or_id.strip().split("/")[-1]
    else:
        post_id = url_or_id.strip()
        
    api_url = f"https://api.imgchest.com/v1/post/{post_id}"
    headers = {"Authorization": f"Bearer {token}"}

    print(f"\nFetching data for ID: {post_id}...")
    
    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        data = response.json()

        # 3. Parse and build the 'items' list
        if "data" not in data or "images" not in data["data"]:
            print("Error: Could not find 'images' in the API response.")
            return

        images = data["data"]["images"]
        if not images:
            print("Album found, but it contains no images.")
            return

        items_list = []
        for img in images:
            link = img.get("link")
            if not link:
                continue
            
            extension = link.split('.')[-1].lower()
            item_type = 'video' if extension in ['mp4', 'webm', 'mov'] else 'image'
            
            # We explicitly put type first, then src, to match your requested order
            items_list.append({"type": item_type, "src": link})
            
        # 4. Generate Output Filename
        safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '-', '_')]).rstrip()
        output_filename = f"{safe_title.replace(' ', '_')[:30]}.json"

        # 5. CUSTOM SAVING (The Magic Part)
        # Instead of standard json.dump, we write line-by-line to get your specific format.
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write('{\n')
            # json.dumps(string) automatically handles escaping quotes inside the title
            f.write(f'  "title": {json.dumps(title)},\n')
            f.write(f'  "thumbnail": "{items_list[0]["src"]}",\n')
            f.write(f'  "narration": "{narration_url}",\n')
            f.write('  "items": [\n')
            
            # Loop through items and write them one per line
            for i, item in enumerate(items_list):
                # This creates: { "type": "image", "src": "..." }
                line_string = json.dumps(item)
                
                # Add a comma if it's not the last item
                if i < len(items_list) - 1:
                    f.write(f'{line_string},\n')
                else:
                    f.write(f'{line_string}\n') # No comma on the last item
            
            f.write('  ]\n')
            f.write('}')

        print("\n" + "="*40)
        print(f"✅ Success! Album block generated.")
        print(f"💾 Saved to: {output_filename}")
        print("="*40 + "\n")

    except requests.exceptions.RequestException as e:
        print(f"\n❌ Network Error: Could not connect to the API. Details: {e}")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    API_TOKEN = load_config()
    if not API_TOKEN:
        exit()

    print("--- ImgChest to GitHub JSON Block Generator ---")
    while True:
        user_input = input("Paste ImgChest URL (or press Enter to exit): ")
        if not user_input:
            break
        get_album_data(user_input, API_TOKEN)

    print("Exiting.")
