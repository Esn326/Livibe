document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const concertId = params.get('id');

    if (!concertId) return;

    fetch('data.json') // 💡 修改這裡
        .then(res => res.json())
        .then(data => {
            const concert = data.find(item => item.id === concertId);
            if (concert) {
                renderDetailView(concert);
            }
        });
});