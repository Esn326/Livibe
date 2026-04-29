let allEvents = [];

async function init() {
    const r = await fetch('data.json');
    allEvents = await r.json();

    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('filter-tag').addEventListener('change', applyFilters);
    document.getElementById('sort-order').addEventListener('change', applyFilters);

    applyFilters();
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const tag = document.getElementById('filter-tag').value;
    const sort = document.getElementById('sort-order').value;

    let filtered = allEvents.filter(item => {
        const matchSearch = item.title.toLowerCase().includes(search) || 
                            item.all_artists.some(a => a.toLowerCase().includes(search));
        const matchTag = (tag === 'all' || item.tag === tag);
        return matchSearch && matchTag;
    });

    filtered.sort((a, b) => {
        const dA = new Date(a.start_date), dB = new Date(b.start_date);
        return sort === 'newest' ? dB - dA : dA - dB;
    });

    render(filtered);
}

function render(events) {
    const grid = document.getElementById('concert-grid');
    grid.innerHTML = events.map(item => `
        <div class="concert-card" onclick="location.href='concert.html?id=${item.id}'">
            <div class="fest-tag tag-${item.tag.toLowerCase()}">${item.tag}</div>
            <div class="poster-wrapper"><img src="${item.poster}"></div>
            <div class="card-content">
                <div class="card-title">${item.title}</div>
                <div class="card-artist">${item.display_artist}</div>
                <div class="card-artist" style="margin-top:8px;">
                    📅 ${item.sessions.length > 1 ? item.start_date + ' 起' : item.start_date}
                </div>
            </div>
        </div>
    `).join('');
}
init();