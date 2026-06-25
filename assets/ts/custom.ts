/*
 * 自定义前端脚本（Hugo 会自动编译加载，见主题 footer/components/script.html）
 * 1) Hero 打字机：随机诗词 ↔ 签名
 * 2) 文章阅读进度条
 * 3) 滚动渐显
 * 4) 留言板（Waline）滚动到可视区再懒加载
 */

/* ---------- 1) Hero 打字机 ---------- */
(function heroTyper() {
    const el = document.getElementById("hero-typer");
    if (!el) return;

    const SIGNATURE = "二象无常，遇而无往";
    const FALLBACK = [
        "人生若只如初见",
        "春水碧于天，画船听雨眠",
        "此心安处是吾乡",
        "何当共剪西窗烛，却话巴山夜雨时",
        "众里寻他千百度，蓦然回首，那人却在灯火阑珊处",
    ];
    let poem = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];

    // 动态加载「今日诗词」SDK
    (function loadSDK() {
        const w = window as any;
        if (w.jinrishici) return;
        const s = document.createElement("script");
        s.src = "https://sdk.jinrishici.com/v2/browser/jinrishici.js";
        s.async = true;
        document.head.appendChild(s);
    })();

    function fetchPoem(cb: (s: string) => void) {
        const w = window as any;
        if (w.jinrishici && typeof w.jinrishici.load === "function") {
            try {
                w.jinrishici.load(
                    (r: any) => cb((r && r.data && r.data.content) || poem),
                    () => cb(poem)
                );
                return;
            } catch (e) { /* fall through */ }
        }
        cb(poem);
    }

    const TYPE = 120, ERASE = 55, HOLD = 2000, GAP = 550;
    let showSignature = false;

    function type(text: string, done: () => void) {
        let i = 0;
        (function step() {
            el.textContent = text.slice(0, ++i);
            if (i < text.length) setTimeout(step, TYPE);
            else setTimeout(done, HOLD);
        })();
    }
    function erase(done: () => void) {
        const text = el.textContent || "";
        let i = text.length;
        (function step() {
            el.textContent = text.slice(0, i-- > 0 ? i : 0);
            if (i > 0) setTimeout(step, ERASE);
            else setTimeout(done, GAP);
        })();
    }
    function loop() {
        if (showSignature) {
            type(SIGNATURE, () => erase(() => { showSignature = false; loop(); }));
        } else {
            fetchPoem((p) => {
                poem = p;
                type(poem, () => erase(() => { showSignature = true; loop(); }));
            });
        }
    }
    loop();
})();

/* ---------- 2) 文章阅读进度条 ---------- */
(function readingProgress() {
    if (!document.querySelector(".article-content")) return;
    const bar = document.createElement("div");
    bar.className = "reading-progress";
    document.body.appendChild(bar);
    function update() {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
})();

/* ---------- 3) 滚动渐显 ---------- */
(function scrollReveal() {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!els.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        els.forEach((e) => e.classList.add("revealed"));
        return;
    }
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add("revealed");
                    io.unobserve(en.target);
                }
            });
        },
        { threshold: 0.12 }
    );
    els.forEach((e) => io.observe(e));
})();

/* ---------- 4) 留言板 Waline 懒加载 ---------- */
(function guestbook() {
    const el = document.getElementById("waline-guestbook");
    if (!el) return;
    const serverURL = el.getAttribute("data-server");
    if (!serverURL) return;

    let loaded = false;
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (!en.isIntersecting || loaded) return;
            loaded = true;
            io.disconnect();

            const css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = "https://cdn.jsdelivr.net/npm/@waline/client@v3/dist/waline.css";
            document.head.appendChild(css);

            const s = document.createElement("script");
            s.src = "https://cdn.jsdelivr.net/npm/@waline/client@v3/dist/waline.umd.js";
            s.onload = () => {
                const W = (window as any).Waline;
                if (W && typeof W.init === "function") {
                    W.init({
                        el: "#waline-guestbook",
                        serverURL: serverURL,
                        lang: el.getAttribute("data-lang") || "zh-CN",
                        path: "/guestbook",
                        login: "disable",
                        requiredMeta: ["nick"],
                        pageview: false,
                    });
                }
            };
            document.body.appendChild(s);
        });
    }, { threshold: 0.05 });
    io.observe(el);
})();
