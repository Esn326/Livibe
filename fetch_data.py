import requests
import json
import time
import sys
import io
import re
from datetime import datetime
from urllib.parse import quote

# 🛠️ 1. 環境設定
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# === 參數設定 ===
SETLIST_API_KEY = "990AnMyDMx2yyaxXpEVxzO5VtJSG3b6_JLnI"
YEAR = "2024"
BASE_URL = "https://api.setlist.fm/rest/1.0/search/setlists"

HOT_VENUES = [
    "Arena", "Stadium", "Dome", "小巨蛋", "大巨蛋", "世運", 
    "流行音樂中心", "展覽館", "Legacy", "Zepp", "體育館", "體育場", "文化中心", "巨蛋"
]

def get_itunes_image(artist_name):
    """兩全其美搜圖引擎 (嚴格比對 + 寬鬆保底)"""
    clean_name = re.sub(r'\s*\(.*\)', '', artist_name).strip()
    target_name_lower = clean_name.lower()
    
    strategies = [
        {"params": f"term={quote(clean_name)}&entity=musicArtist&country=TW", "strict": True},
        {"params": f"term={quote(clean_name)}&entity=album&country=TW", "strict": False},
        {"params": f"term={quote(clean_name)}&entity=song&country=TW", "strict": False}
    ]

    try:
        for s in strategies:
            search_url = f"https://itunes.apple.com/search?{s['params']}&limit=3"
            time.sleep(0.6) 
            response = requests.get(search_url, timeout=10)
            if not response.ok: continue
            data = response.json()

            if data.get('resultCount', 0) > 0:
                results = data['results']
                if s['strict']:
                    for item in results:
                        returned_artist = item.get('artistName', '').lower()
                        if target_name_lower in returned_artist or returned_artist in target_name_lower:
                            img = item.get('artworkUrl100') or item.get('artworkUrl600')
                            return img.replace("100x100bb", "600x600bb")
                else:
                    res = results[0]
                    img = res.get('artworkUrl100') or res.get('artworkUrl600')
                    return img.replace("100x100bb", "600x600bb")
        
        if "mayday" in target_name_lower:
            return get_itunes_image("五月天")
    except: pass
    return "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000"

def main():
    all_formatted_list = []
    seen_performances = set()
    current_page = 1
    headers = {"Accept": "application/json", "x-api-key": SETLIST_API_KEY}
    
    print("="*60)
    print(f"📡 LIVIBE 採集引擎 | 排序優化版 | 年份: {YEAR}")
    print("="*60)

    while True:
        params = {"countryCode": "TW", "year": YEAR, "p": current_page}
        try:
            response = requests.get(BASE_URL, headers=headers, params=params)
            if response.status_code == 429:
                time.sleep(30); continue
            if response.status_code != 200: break

            data = response.json()
            setlists = data.get('setlist', [])
            if not setlists: break

            for s in setlists:
                artist = s['artist']['name']
                venue = s['venue']['name']
                date_str = s['eventDate'] # 格式: DD-MM-YYYY
                
                if any(hot in venue for hot in HOT_VENUES):
                    perf_key = (artist, venue)
                    if perf_key in seen_performances:
                        print(f"  [SKIP] {artist} @ {venue}")
                        continue
                    
                    print(f"✨ [NEW] {artist} @ {venue} ({date_str})")
                    seen_performances.add(perf_key)
                    
                    # 💡 核心改進：轉換日期為 ISO 格式 (YYYY-MM-DD)，方便前端排序
                    iso_date = datetime.strptime(date_str, "%d-%m-%Y").strftime("%Y-%m-%d")
                    
                    img_url = get_itunes_image(artist)
                    
                    all_formatted_list.append({
                        "id": s['id'],
                        "title": f"{artist} Live in Taiwan",
                        "artist": artist,
                        "date_range": date_str,
                        "iso_date": iso_date, # 新增排序專用欄位
                        "location": s['venue']['city']['name'],
                        "venue": venue,
                        "poster_url": img_url,
                        "ticket_url": "#",
                        "description": f"於 {venue} 舉行的現場演出。",
                        "avg_score": 0.0,
                        "reviews": []
                    })

            if current_page * 20 >= data.get('total', 0): break
            current_page += 1
            time.sleep(1.2)

        except Exception as e:
            print(f"❌ 錯誤: {e}"); break

    # 存檔
        output_name = 'data.json'
    with open(output_name, 'w', encoding='utf-8') as f:
        json.dump(all_formatted_list, f, ensure_ascii=False, indent=4)
    
    print("="*60)
    print(f"✅ 成功導出 {len(all_formatted_list)} 筆資料！")
    print("="*60)

if __name__ == "__main__":
    main()