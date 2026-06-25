/*
 * 自定义前端脚本（Hugo 会自动编译加载，见主题 footer/components/script.html）
 * 1) Hero 打字机：随机诗词（一言·诗词 API，每次不同）↔ 签名
 * 2) 文章阅读进度条
 * 3) 滚动渐显
 * （留言板 Waline 已改为复用 Stack 内置评论 partial，不在此处加载）
 */

/* ---------- 1) Hero 打字机：每次调 API 取不同古诗词 ---------- */
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
        "山有木兮木有枝，心悦君兮君不知",
        "落霞与孤鹜齐飞，秋水共长天一色",
        "人生代代无穷已，江月年年望相似",
        "云想衣裳花想容，春风拂槛露华浓",
        "海上生明月，天涯共此时",
        "枕上诗书闲处好，门前风景雨来佳",
        "此情可待成追忆，只是当时已惘然",
    ];
    const randLine = () => FALLBACK[Math.floor(Math.random() * FALLBACK.length)];

    // 一言·诗词分类（c=i），支持 CORS、国内可达、每次返回不同诗句
    async function fetchPoem(): Promise<string> {
        try {
            const res = await fetch("https://v1.hitokoto.cn/?c=i&encode=json", { cache: "no-store" });
            const data = await res.json();
            const s = data && typeof data.hitokoto === "string" ? data.hitokoto.trim() : "";
            return s || randLine();
        } catch (e) {
            return randLine();
        }
    }

    const TYPE = 120, ERASE = 55, HOLD = 2200, GAP = 600;

    function typeText(text: string): Promise<void> {
        return new Promise((resolve) => {
            let i = 0;
            (function step() {
                el.textContent = text.slice(0, ++i);
                if (i < text.length) setTimeout(step, TYPE);
                else setTimeout(resolve, HOLD);
            })();
        });
    }
    function eraseText(): Promise<void> {
        return new Promise((resolve) => {
            let i = (el.textContent || "").length;
            const full = el.textContent || "";
            (function step() {
                i -= 1;
                el.textContent = full.slice(0, i < 0 ? 0 : i);
                if (i > 0) setTimeout(step, ERASE);
                else setTimeout(resolve, GAP);
            })();
        });
    }

    (async function loop() {
        // 无限循环：每轮取一句新诗词 → 打字 → 删除 → 签名 → 删除
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const poem = await fetchPoem();
            await typeText(poem);
            await eraseText();
            await typeText(SIGNATURE);
            await eraseText();
        }
    })();
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
