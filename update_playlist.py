import subprocess
import json
import codecs
import sys
import os

print("Fetching latest playlist data from YouTube...")
playlist_url = 'https://www.youtube.com/playlist?list=PLuRJywfkv_0zEScfeRiK22sXe6y_eO2q8'

try:
    # Run yt-dlp to get the flat playlist JSON
    result = subprocess.run(
        ['yt-dlp', '--flat-playlist', '--dump-json', playlist_url],
        capture_output=True,
        text=True,
        encoding='utf-8',
        check=True
    )
except subprocess.CalledProcessError as e:
    print("Error fetching playlist. Make sure yt-dlp is installed and you have an internet connection.")
    print("Error details:", e.stderr)
    os.system("pause")
    sys.exit(1)

videos = []
for line in result.stdout.splitlines():
    line = line.strip()
    if not line: continue
    try:
        data = json.loads(line)
        if 'id' in data and 'title' in data:
            title = data['title'].replace('[Private video]', '').replace('[Deleted video]', '').strip()
            if not title: continue
            
            videos.append({
                "title": title,
                "artist": "Bhojpuri Wala",
                "album": "Playlist",
                "year": 2026,
                "genres": ["Bhojpuri"],
                "youtube_id": data['id'],
                "id": len(videos) + 1,
                "plays": 0
            })
    except Exception as e:
        pass

print(f"Successfully extracted {len(videos)} videos.")

if len(videos) > 0:
    out_path = os.path.join('bhojpuriwala', 'js', 'catalog.js')
    with codecs.open(out_path, "w", "utf-8") as f:
        f.write(f"window.CATALOG = {json.dumps(videos, indent=2)};\n")
    print("Updated catalog.js successfully!")
else:
    print("No videos found. catalog.js was not updated.")

print("\nYou can now refresh your browser!")
os.system("pause")
