import urllib.request, re, json
html = urllib.request.urlopen('https://www.youtube.com/playlist?list=PLuRJywfkv_0zEScfeRiK22sXe6y_eO2q8').read().decode('utf-8')
match = re.search(r'ytInitialData = (\{.*?\});</script>', html)
if match:
    data = json.loads(match.group(1))
    tabs = data.get('contents', {}).get('twoColumnBrowseResultsRenderer', {}).get('tabs', [])
    for tab in tabs:
        items = tab.get('tabRenderer', {}).get('content', {}).get('sectionListRenderer', {}).get('contents', [])
        for item in items:
            playlist_items = item.get('itemSectionRenderer', {}).get('contents', [{}])[0].get('playlistVideoListRenderer', {}).get('contents', [])
            for vid in playlist_items[:5]:
                video = vid.get('playlistVideoRenderer', {})
                title = video.get('title', {}).get('runs', [{}])[0].get('text', '')
                print(title)
