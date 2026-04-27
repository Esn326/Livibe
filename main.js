let allConcerts = [];

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('concert-container');

    // 1. 載入資料
    fetch('data_2024_final.json') // 請確保檔名與 Python 輸出一致
        .then(response => response.json())
        .then(data => {
            allConcerts = data;
            // 預設依時間排序
            sortAndRender('date');
        })
        .catch(error => {
            console.error('Error loading data:', error);
            container.innerHTML = '<p>載入資料時發生錯誤。</p>';
        });

    // 2. 綁定排序按鈕事件 (透過 index.html 的按鈕)
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 切換 Active 樣式
            sortButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const sortBy = this.getAttribute('data-sort');
            sortAndRender(sortBy);
        });
    });
});

// 3. 排序並渲染函數
function sortAndRender(criteria) {
    let sortedData = [...allConcerts];

    if (criteria === 'artist') {
        // 依藝人 A-Z
        sortedData.sort((a, b) => a.artist.localeCompare(b.artist, 'zh-Hant'));
    } else if (criteria === 'date') {
        // 依 ISO 日期 (最新在前)
        sortedData.sort((a, b) => new Date(b.iso_date) - new Date(a.iso_date));
    } else if (criteria === 'location') {
        // 依地區
        sortedData.sort((a, b) => a.location.localeCompare(b.location, 'zh-Hant'));
    }

    renderConcerts(sortedData);
}

function renderConcerts(data) {
    const container = document.getElementById('concert-container');
    if (!container) return;

    container.innerHTML = data.map(concert => `
        <div class="concert-card" onclick="window.location.href='concert.html?id=${concert.id}'">
            <div class="poster-wrapper">
                <img src="${concert.poster_url}" alt="${concert.artist}" loading="lazy">
            </div>
            <div class="info">
                <span class="location-tag">${concert.location}</span>
                <h3>${concert.artist}</h3>
                <p class="venue">${concert.venue}</p>
                <div class="date-box">
                    <span>📅 ${concert.date_range}</span>
                </div>
            </div>
        </div>
    `).join('');
}