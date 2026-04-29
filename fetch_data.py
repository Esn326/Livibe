import requests, json, time, re, random
from datetime import datetime
from tqdm import tqdm

SETLIST_API_KEY = "990AnMyDMx2yyaxXpEVxzO5VtJSG3b6_JLnI"
BASE_URL = "https://api.setlist.fm/rest/1.0/search/setlists"

def get_itunes_image(artist_name, event_year):
    clean_name = re.sub(r'\s*\(.*?\)', '', artist_name).strip()
    try:
        url = f"https://itunes.apple.com/search?term={requests.utils.quote(clean_name)}&entity=musicArtist&country=TW"
        res = requests.get(url, timeout=5).json()
        if res.get('results'):
            artist_id = res['results'][0]['artistId']
            lookup = requests.get(f"https://itunes.apple.com/lookup?id={artist_id}&entity=album&limit=15").json()
            albums = [a for a in lookup.get('results', []) if a.get('wrapperType') == 'collection']
            for alb in albums:
                rel_year = int(alb.get('releaseDate', '0000')[:4])
                if rel_year <= int(event_year):
                    return alb['artworkUrl100'].replace('100x100', '600x600')
    except: pass
    return "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=600"

def fetch_data():
    headers = {"Accept": "application/json", "x-api-key": SETLIST_API_KEY}
    raw_list = []
    print("🚀 啟動全量抓取 (2024-2026)...")

    for year in ["2024", "2025", "2026"]:
        page = 1
        while True:
            res = requests.get(BASE_URL, headers=headers, params={"countryCode": "TW", "year": year, "p": page}).json()
            if 'setlist' not in res: break
            raw_list.extend(res['setlist'])
            total_pages = (int(res.get('total', 0)) // 20) + 1
            if page >= total_pages: break
            page += 1
            time.sleep(0.05)

    # 1. 建立索引判定人數
    vd_map = {}
    for s in raw_list:
        k = f"{s['eventDate']}_{s['venue']['name']}"
        if k not in vd_map: vd_map[k] = set()
        vd_map[k].add(s['artist']['name'])

    # 2. 分類邏輯 (優先級: Tour > Multi > Venue)
    groups = {}
    for s in raw_list:
        tour = s.get('tour', {}).get('name')
        v_name = s['venue']['name'].lower()
        vd_key = f"{s['eventDate']}_{s['venue']['name']}"
        is_multi = len(vd_map[vd_key]) >= 2
        is_large = "stadium" in v_name or "dome" in v_name or "arena" in v_name

        if is_multi and tour: tag = "JOINT"
        elif is_multi and not tour: tag = "VARIETY" if is_large else "FESTIVAL"
        elif not is_multi and tour: tag = "TOUR"
        else: tag = "SHOWCASE"

        title = tour if tour else (f"{s['venue']['name']} Festival" if tag == "FESTIVAL" else f"{s['artist']['name']} Live")
        
        if title not in groups: groups[title] = {"items": [], "tag": tag}
        groups[title]["items"].append(s)

    # 3. 封裝 JSON
    final = []
    print("🎨 正在處理海報與分貝指數...")
    for title, data in tqdm(groups.items()):
        items = sorted(data["items"], key=lambda x: datetime.strptime(x['eventDate'], "%d-%m-%Y"))
        tag = data["tag"]
        
        # 顯示名稱與分貝 (90-125dB)
        display_artist = "多組藝人出演" if tag in ["JOINT", "FESTIVAL", "VARIETY"] else items[0]['artist']['name']
        db_level = random.randint(95, 125)

        day_info = {}
        for i in items:
            d = datetime.strptime(i['eventDate'], "%d-%m-%Y").strftime("%Y-%m-%d")
            if d not in day_info: day_info[d] = set()
            day_info[d].add(i['artist']['name'])

        final.append({
            "id": items[0]["id"],
            "title": title,
            "tag": tag,
            "display_artist": display_artist,
            "db": db_level,
            "poster": get_itunes_image(items[0]['artist']['name'], items[0]['eventDate'].split('-')[-1]),
            "start_date": datetime.strptime(items[0]['eventDate'], "%d-%m-%Y").strftime("%Y-%m-%d"),
            "sessions": [{"id": i['id'], "date": i['eventDate'], "venue": i['venue']['name']} for i in items],
            "all_artists": sorted(list(set(i['artist']['name'] for i in items))),
            "performance_days": [{"date": d, "artists": sorted(list(a))} for d, a in day_info.items()]
        })

    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(final, f, ensure_ascii=False, indent=4)
    print(f"✅ 完成！共產出 {len(final)} 個活動項目。")

if __name__ == "__main__":
    fetch_data()