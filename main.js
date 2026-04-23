let concertData = [];
// 修正：從 localStorage 讀取管理員狀態時，確保初始值正確
let isAdmin = localStorage.getItem('isAdmin') === 'true';

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // ✅ 優化 1：使用相對路徑 './' 確保在 GitHub Pages 子目錄下能讀到 JSON
        const resp = await fetch('./data.json');
        if (!resp.ok) throw new Error("無法取得資料");
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
            } else if (pw !== null) {
                alert("密碼錯誤！");
            }
        });
    } catch (e) {
        console.error("Data load error:", e);
        // 可以在畫面上顯示錯誤訊息給用戶
        const container = document.getElementById('concertGrid') || document.getElementById('detailApp');
        if (container) container.innerHTML = `<p style="color:red; text-align:center;">資料載入失敗，請檢查網路連線。</p>`;
    }
});

// 渲染列表頁
function renderList(data) {
    const grid = document.getElementById('concertGrid');
    if (!grid) return;
    
    if (data.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted); text-align:center; grid-column: 1/-1;">找不到相關演唱會。</p>`;
        return;
    }

    grid.innerHTML = data.map(c => `
        <div class="concert-card" onclick="location.href='concert.html?id=${c.id}'">
            <div class="card-img-wrap">
                <img src="${c.poster_url}" class="card-img" alt="${c.title}" onerror="this.src='https://placehold.co/400x600?text=No+Image'">
            </div>
            <div class="card-body">
                <div style="color:var(--brand-main); font-weight:bold;">★ ${(c.avg_score || 0).toFixed(1)}</div>
                <div style="font-weight:bold; margin-top:5px; color:white;">${c.title}</div>
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

    if (!c) { 
        app.innerHTML = "<div class='container' style='padding:100px 0; text-align:center;'><h1>404 Concert Not Found</h1><a href='index.html' style='color:var(--brand-main)'>返回首頁</a></div>"; 
        return; 
    }

    // ✅ 優化 2：增加評論長度檢查，避免除以 0 的錯誤
    const reviewCount = c.reviews ? c.reviews.length : 0;
    const stats = {
        stage: reviewCount > 0 ? (c.reviews.reduce((a, b) => a + b.score_stage, 0) / reviewCount).toFixed(1) : "N/A",
        content: reviewCount > 0 ? (c.reviews.reduce((a, b) => a + b.score_content, 0) / reviewCount).toFixed(1) : "N/A",
        vibe: reviewCount > 0 ? (c.reviews.reduce((a, b) => a + b.score_vibe, 0) / reviewCount).toFixed(1) : "N/A"
    };

    app.innerHTML = `
        <div class="detail-hero">
            <div class="container" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                <div>
                    <h1 style="font-size:3rem; margin:0; line-height:1.1;">${c.title}</h1>
                    <div style="color:var(--text-muted); margin-top:10px;">${c.date_range} | ${c.location} | ${c.venue}</div>
                </div>
                <div class="score-circle">
                    <div style="color:var(--text-muted); font-size:0.8rem; text-transform:uppercase; letter-spacing:1px;">LIVIBE SCORE</div>
                    <div class="score-num">${(c.avg_score || 0).toFixed(1)}<small style="font-size:1rem; color:#666">/10</small></div>
                </div>
            </div>
        </div>

        <div class="container main-layout">
            <div class="left-col">
                <img src="${c.poster_url}" class="poster-sticky" onerror="this.src='https://placehold.co/400x600?text=No+Image'">
            </div>
            <div class="right-col">
                <div class="info-row"><span class="info-label">Artist</span><span class="info-value">${c.artist}</span></div>
                <div class="info-row"><span class="info-label">Venue</span><span class="info-value">${c.venue}</span></div>
                <div class="info-row"><span class="info-label">Stats</span><span style="color:var(--brand-main)">視覺 ${stats.stage} | 內容 ${stats.content} | 氣氛 ${stats.vibe}</span></div>
                
                <div class="description-box" style="padding:30px 0; font-size:1.1rem; border-bottom:var(--border); color:#ddd; line-height:1.8;">
                    ${c.description}
                </div>
                
                <h2 style="margin-top:40px; border-left:4px solid var(--brand-main); padding-left:15px; font-size:1.5rem;">User Reviews</h2>
                <div class="reviews-list" style="margin-top:20px;">
                    ${reviewCount > 0 ? c.reviews.map(r => `
                        <div class="review-card">
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                                <strong style="color:var(--brand-main)">★ ${((r.score_stage + r.score_content + r.score_vibe) / 3).toFixed(1)} - ${r.user_id}</strong>
                                <span style="color:var(--text-muted); font-size:0.8rem;">${r.visit_date}</span>
                            </div>
                            <div style="color:#888; font-size:0.85rem; margin-bottom:10px;">座位: ${r.seat_zone}</div>
                            <p style="margin:0; color:#ccc;">${r.comment_text}</p>
                        </div>
                    `).join('') : '<p style="color:#666">尚無評論，快來分享你的現場體驗！</p>'}
                </div>
            </div>
        </div>
    `;
}