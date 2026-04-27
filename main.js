let allConcerts = [];

document.addEventListener('DOMContentLoaded', () => {
    // 💡 改回 data.json
    fetch('data.json')
        .then(res => {
            if (!res.ok) throw new Error("找不到 data.json");
            return res.json();
        })
        .then(data => {
            allConcerts = data;
            renderList(executeSort(allConcerts, 'date'));
        })
        .catch(err => {
            console.error(err);
            document.getElementById('concert-container').innerHTML = "<p>資料載入中或檔案遺失...</p>";
        });

    // 監聽按鈕
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const sorted = executeSort(allConcerts, btn.dataset.sort);
            renderList(sorted);
        });
    });
});

function executeSort(data, type) {
    let result = [...data];
    if (type === 'artist') {
        result.sort((a, b) => a.artist.localeCompare(b.artist, 'zh-Hant'));
    } else if (type === 'date') {
        // 使用 iso_date 確保排序精準
        result.sort((a, b) => new Date(b.iso_date || 0) - new Date(a.iso_date || 0));
    } else if (type === 'location') {
        result.sort((a, b) => a.location.localeCompare(b.location, 'zh-Hant'));
    }
    return result;
}

function renderList(data) {
    const container = document.getElementById('concert-container');
    if (!container) return;

    container.innerHTML = data.map(item => `
        <div class="concert-card" onclick="location.href='concert.html?id=${item.id}'">
            <div class="poster-wrapper">
                <img src="${item.poster_url}" alt="${item.artist}">
            </div>
            <div class="info">
                <div class="location-tag">${item.location}</div>
                <h3>${item.artist}</h3>
                <p class="venue">${item.venue}</p>
                <div class="date-box">📅 ${item.date_range}</div>
            </div>
        </div>
    `).join('');
}