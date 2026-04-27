document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const concertId = params.get('id');

    // 💡 同步讀取 data.json
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            const concert = data.find(item => item.id === concertId);
            if (concert) {
                renderDetailView(concert);
            }
        });
});

function renderDetailView(item) {
    // 這裡維持你原本 detail.html 內的 ID 綁定
    const titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.innerText = item.artist + " Live";
    // ...以此類推
}