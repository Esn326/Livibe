let allConcerts = []; 

document.addEventListener('DOMContentLoaded', () => {
    // 💡 確保讀取的是 data.json
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            allConcerts = data;
            // 初始渲染：按日期排序
            const sorted = executeSort(allConcerts, 'date');
            renderList(sorted);
        })
        .catch(err => {
            console.error("載入失敗:", err);
            document.getElementById('concert-grid').innerHTML = "無法讀取 data.json";
        });

    // 監聽排序按鈕
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
        // 使用 iso_date 確保排序精準，若無則用 ID (Date.now) 墊後
        result.sort((a, b) => new Date(b.iso_date || 0) - new Date(a.iso_date || 0));
    } else if (type === 'location') {
        result.sort((a, b) => a.location.localeCompare(b.location, 'zh-Hant'));
    }
    return result;
}

function renderList(data) {
    const container = document.getElementById('concert-grid');
    if (!container) return;
    
    container.innerHTML = data.map(item => `
        <div class="concert-card" onclick="goToDetail('${item.id}')">
            <div class="poster-wrapper">
                <img src="${item.poster_url}" alt="${item.artist}" loading="lazy">
            </div>
            <div class="info">
                <span class="location-tag">${item.location}</span>
                <h3>${item.artist}</h3>
                <p class="venue">${item.venue}</p>
                <div class="date-box">📅 ${item.date_range}</div>
            </div>
        </div>
    `).join('');
}

// 保留你原本跳轉頁面的函式名稱
function goToDetail(id) {
    window.location.href = `concert.html?id=${id}`;
}