/**
 * detail.js - 詳情頁讀取與評價顯示
 */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const concertId = params.get('id');

    if (!concertId) {
        window.location.href = 'index.html';
        return;
    }

    fetch('data_2024_final.json')
        .then(res => res.json())
        .then(data => {
            const concert = data.find(item => item.id === concertId);
            if (concert) {
                renderDetailView(concert);
            } else {
                alert('找不到演出資料');
                window.location.href = 'index.html';
            }
        });
});

function renderDetailView(item) {
    // 更新頁面上的元素 (需對應你的 detail.html ID)
    const titleEl = document.getElementById('detail-title');
    const artistEl = document.getElementById('detail-artist');
    const posterEl = document.getElementById('detail-poster');
    const infoEl = document.getElementById('detail-info');

    if (titleEl) titleEl.innerText = item.title;
    if (artistEl) artistEl.innerText = item.artist;
    if (posterEl) posterEl.src = item.poster_url;
    if (infoEl) {
        infoEl.innerHTML = `
            <p>📍 <strong>場地：</strong>${item.venue} (${item.location})</p>
            <p>📅 <strong>日期：</strong>${item.date_range}</p>
            <p>📝 <strong>簡介：</strong>${item.description}</p>
        `;
    }
    
    // 這裡可以接你原本的評論區邏輯...
}