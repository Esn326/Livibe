document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const concertId = params.get('id');

    fetch('data.json') // 💡 統一路徑
        .then(res => res.json())
        .then(data => {
            const concert = data.find(item => item.id === concertId);
            if (concert) {
                // 渲染邏輯維持你原本的內容...
                document.getElementById('detail-title').innerText = concert.artist;
            }
        });
});