/**
 * main.js - 以 IMDB 風格為基底的排序邏輯
 */
let allConcerts = []; 

document.addEventListener('DOMContentLoaded', () => {
    // 💡 讀取你改名後的 data.json
    fetch('data.json')
        .then(res => {
            if (!res.ok) throw new Error("找不到 data.json");
            return res.json();
        })
        .then(data => {
            allConcerts = data;
            // 初始載入：預設依日期排序
            renderList(executeSort(allConcerts, 'date'));
        })
        .catch(err => {
            console.error(err);
            const container = document.getElementById('concert-grid');
            if(container) container.innerHTML = `<p style="text-align:center; color:red;">無法載入資料，請確認 data.json 檔案。</p>`;
        });

    // 監聽按鈕點擊
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 切換按鈕狀態
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 執行排序並重新渲染
            const sorted = executeSort(allConcerts, btn.dataset.sort);
            renderList(sorted);
        });
    });
});

// 排序功能
function executeSort(data, type) {
    let result = [...data];
    if (type === 'artist') {
        result.sort((a, b) => a.artist.localeCompare(b.artist, 'zh-Hant'));
    } else if (type === 'date') {
        // 使用 iso_date 排序 (若無則由 data_range 嘗試)
        result.sort((a, b) => new Date(b.iso_date || b.date_range) - new Date(a.iso_date || a.date_range));
    } else if (type === 'location') {
        result.sort((a, b) => a.location.localeCompare(b.location, 'zh-Hant'));
    }
    return result;
}

// 渲染函數：保留你原本的 Class 名稱
function renderList(data) {
    const container = document.getElementById('concert-grid');
    if (!container) return;
    
    container.innerHTML = data.map(item => `
        <div class="concert-card" onclick="location.href='concert.html?id=${item.id}'">
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