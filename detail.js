async function loadDetail() {
    const id = new URLSearchParams(window.location.search).get('id');
    const r = await fetch('data.json');
    const data = await r.json();
    const item = data.find(i => i.id === id || i.sessions.some(s => s.id === id));
    if (!item) return;

    // 渲染分貝標註
    const dbHtml = `
        <div style="display:flex; align-items:center; gap:10px; margin:15px 0; color:#F5C518;">
            <span style="font-size:1.5rem;">🔊</span>
            <span style="font-size:1.3rem; font-weight:900;">${item.db} dB</span>
            <span style="color:#A3A3A3; font-size:0.8rem;">現場震撼度 (LIVIBE Volume)</span>
        </div>
    `;

    document.getElementById('detail-poster').src = item.poster;
    document.getElementById('detail-title').innerText = item.title;
    document.getElementById('detail-title').insertAdjacentHTML('afterend', dbHtml);
    
    const tagEl = document.getElementById('tag-display');
    tagEl.innerText = item.tag;
    tagEl.className = `ui-tag tag-${item.tag.toLowerCase()}`;

    const dateEl = document.getElementById('display-date');
    const venueEl = document.getElementById('display-venue');
    const mapEl = document.getElementById('display-map');
    const sessionBox = document.querySelector('.session-box');
    const dropdown = document.getElementById('session-dropdown');
    const artistList = document.getElementById('artist-list');

    const update = (s) => {
        dateEl.innerText = s.date;
        venueEl.innerText = s.venue;
        mapEl.href = `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(s.venue)}`;
    };

    update(item.sessions[0]);

    if (item.tag === 'FESTIVAL' || item.tag === 'VARIETY') {
        sessionBox.style.display = 'none';
        artistList.innerHTML = `<h3>陣容名單</h3>` + item.performance_days.map(d => `
            <div style="margin-bottom:20px; padding:15px; background:#1A1A1A; border-left:4px solid #F5C518;">
                <strong style="color:#F5C518;">${d.date}</strong>
                <ul style="list-style:none; padding:10px 0 0 5px;">
                    ${d.artists.map(a => `<li style="color:#fff; margin-bottom:5px;">• ${a}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    } else {
        sessionBox.style.display = item.sessions.length > 1 ? 'block' : 'none';
        if (item.sessions.length > 1) {
            dropdown.innerHTML = item.sessions.map((s, i) => `<option value="${i}">${s.date} - ${s.venue}</option>`).join('');
            dropdown.onchange = (e) => update(item.sessions[e.target.value]);
        }
        artistList.innerHTML = `<h3>演出藝人</h3><ul style="list-style:none; padding-left:5px;">
            ${item.all_artists.map(a => `<li style="color:#fff; margin-bottom:8px;">• ${a}</li>`).join('')}
        </ul>`;
    }
}
loadDetail();