let concertData = [];
let isAdmin = localStorage.getItem('isAdmin') === 'true';

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resp = await fetch('data.json');
        concertData = await resp.json();
        
        const grid = document.getElementById('concertGrid');
        const detailApp = document.getElementById('detailApp');

        if (grid) renderList(concertData);
        if (detailApp) renderDetail();

        // 搜尋功能
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = concertData.filter(c => 
                c.title.toLowerCase().includes(query) || c.artist.toLowerCase().includes(query)
            );
            renderList(filtered);
        });

        // 管理員登入模擬
        document.getElementById('adminBtn')?.addEventListener('click', () => {
            const pw = prompt("Enter Admin Password:");
            if (pw === "admin123") {
                localStorage.setItem('isAdmin', 'true');
                location.reload();
            }
        });
    } catch (e) {
        console.error("Data load error", e);
    }
});

// 渲染列表頁
function renderList(data) {
    const grid = document.getElementById('concertGrid');
    if (!grid) return;
    grid.innerHTML = data.map(c => `
        <div class="concert-card" onclick="location.href='concert.html?id=${c.id}'">
            <img src="${c.poster_url}" class="card-img">
            <div class="card-body">
                <div style="color:var(--brand-main); font-weight:bold;">★ ${(c.avg_score).toFixed(1)}</div>
                <div style="font-weight:bold; margin-top:5px;">${c.title}</div>
                <div style="color:var(--text-muted); font-size:0.8rem;">${c.artist}</div>
            </div>
        </div>
    `).join('');
}

// 渲染詳情頁
function renderDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const c = concertData.find(x => x.id == id);
    const app = document.getElementById('detailApp');

    if (!c) { app.innerHTML = "<h1>Concert Not Found</h1>"; return; }

    const stats = {
        stage: (c.reviews.reduce((a, b) => a + b.score_stage, 0) / c.reviews.length || 0).toFixed(1),
        content: (c.reviews.reduce((a, b) => a + b.score_content, 0) / c.reviews.length || 0).toFixed(1),
        vibe: (c.reviews.reduce((a, b) => a + b.score_vibe, 0) / c.reviews.length || 0).toFixed(1)
    };

    app.innerHTML = `
        <div class="detail-hero">
            <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h1 style="font-size:3rem; margin:0;">${c.title}</h1>
                    <div style="color:var(--text-muted); margin-top:10px;">${c.date_range} | ${c.location} | ${c.venue}</div>
                </div>
                <div class="score-circle">
                    <span style="color:var(--text-muted); font-size:0.8rem; text-transform:uppercase;">LIVIBE SCORE</span>
                    <span class="score-num">${(c.avg_score).toFixed(1)}<small style="font-size:1rem; color:#444">/10</small></span>
                </div>
            </div>
        </div>

        <div class="container main-layout">
            <div class="left-col">
                <img src="${c.poster_url}" class="poster-sticky">
            </div>
            <div class="right-col">
                <div class="info-row"><span class="info-label">Artist</span><span class="info-value">${c.artist}</span></div>
                <div class="info-row"><span class="info-label">Venue</span><span class="info-value">${c.venue}</span></div>
                <div class="info-row"><span class="info-label">Stats</span><span>視覺 ${stats.stage} | 內容 ${stats.content} | 氣氛 ${stats.vibe}</span></div>
                
                <p style="padding:30px 0; font-size:1.1rem; border-bottom:var(--border)">${c.description}</p>
                
                <h2 style="margin-top:40px; border-left:4px solid var(--brand-main); padding-left:15px;">User Reviews</h2>
                <div style="margin-top:20px;">
                    ${c.reviews.map(r => `
                        <div class="review-card">
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                                <strong style="color:var(--brand-main)">★ ${((r.score_stage+r.score_content+r.score_vibe)/3).toFixed(1)} - ${r.user_id}</strong>
                                <span style="color:var(--text-muted); font-size:0.8rem;">${r.visit_date}</span>
                            </div>
                            <div style="color:#888; font-size:0.85rem; margin-bottom:10px;">座位: ${r.seat_zone}</div>
                            <p style="margin:0;">${r.comment_text}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}