/**
 * main.js - 首頁列表與排序搜尋邏輯
 */
let allConcerts = []; // 儲存原始資料
let filteredData = []; // 儲存過濾/排序後的資料

document.addEventListener('DOMContentLoaded', () => {
    fetch('data_2024_final.json')
        .then(res => res.json())
        .then(data => {
            allConcerts = data;
            filteredData = [...data];
            // 預設執行日期排序
            applyFiltersAndSort('date');
        });

    // 監聽搜尋框 (假設 HTML ID 為 artistSearch)
    const searchInput = document.getElementById('artistSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            filteredData = allConcerts.filter(item => 
                item.artist.toLowerCase().includes(term) || 
                item.venue.toLowerCase().includes(term)
            );
            // 搜尋後保持當前的排序狀態
            const activeSort = document.querySelector('.sort-btn.active')?.dataset.sort || 'date';
            renderList(executeSort(filteredData, activeSort));
        });
    }

    // 監聽排序按鈕
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const sortType = e.target.dataset.sort;
            renderList(executeSort(filteredData, sortType));
        });
    });
});

// 排序執行器
function executeSort(data, type) {
    let result = [...data];
    if (type === 'artist') {
        result.sort((a, b) => a.artist.localeCompare(b.artist, 'zh-Hant'));
    } else if (type === 'date') {
        result.sort((a, b) => new Date(b.iso_date) - new Date(a.iso_date));
    } else if (type === 'location') {
        result.sort((a, b) => a.location.localeCompare(b.location, 'zh-Hant'));
    }
    return result;
}

// 渲染 HTML
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
                <p class="date">📅 ${item.date_range}</p>
            </div>
        </div>
    `).join('');
}

// 跳轉功能
function goToDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}