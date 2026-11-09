// Alumni hero: window lights in the skyline photo flicker on and off.
// A transparent canvas sits between the photo and the dark overlay; to "switch off" a light we paint a
// patch of the surrounding dark colour over it, fading in and out. Positions come from alumni-lights.js.
(function () {
    var hero = document.querySelector('.rs-hero');
    var data = window.VIG_LIGHTS;
    if (!hero || !data) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
    hero.insertBefore(canvas, hero.firstChild);
    var ctx = canvas.getContext('2d');

    var set, lights = [], W = 0, H = 0, dpr = 1, sx = 1, ox = 0, oy = 0;
    var mq = window.matchMedia ? window.matchMedia('(max-width: 768px)') : { matches: false };

    function build() {
        set = mq.matches ? data.m : data.d;
        var a = set.a, n = a.length / 7;
        lights = [];
        for (var i = 0; i < n; i++) {
            var k = i * 7;
            lights.push({
                x: a[k], y: a[k + 1], w: a[k + 2], h: a[k + 3],
                c: 'rgb(' + a[k + 4] + ',' + a[k + 5] + ',' + a[k + 6] + ')',
                off: Math.random() < 0.12 ? 1 : 0,   // current darkness 0..1
                tgt: 0, next: Math.random() * 20      // seconds until the next change
            });
            lights[i].tgt = lights[i].off;
        }
        size();
    }

    function size() {
        var r = hero.getBoundingClientRect();
        W = r.width; H = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // map source-image pixels to screen the same way `background-size: cover; background-position: center` does
        sx = Math.max(W / set.iw, H / set.ih);
        ox = (W - set.iw * sx) * 0.5;
        oy = (H - set.ih * sx) * 0.5;
    }

    var last = 0, running = true, raf = 0, acc = 0;
    function frame(now) {
        raf = 0;
        if (!running) return;
        var dt = Math.min((now - (last || now)) / 1000, 0.1);
        last = now;
        acc += dt;
        raf = requestAnimationFrame(frame);
        if (acc < 1 / 30) return;          // ~30fps is plenty for a flicker
        var step = acc; acc = 0;

        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < lights.length; i++) {
            var L = lights[i];
            L.next -= step;
            if (L.next <= 0) {
                if (L.tgt === 0) {                       // on -> off (a quarter of the time it is just a quick blink)
                    L.tgt = 1;
                    L.blink = Math.random() < 0.25;
                    L.next = L.blink ? 0.3 + Math.random() * 0.5 : 1.5 + Math.random() * 6;
                } else {                                  // off -> on (blinks often flicker straight off again)
                    L.tgt = 0;
                    L.next = (L.blink && Math.random() < 0.6) ? 0.2 + Math.random() * 0.4 : 8 + Math.random() * 32;
                    L.blink = false;
                }
            }
            var rate = L.tgt > L.off ? 6 : 3;           // fade out quickly, glow back on a little slower
            L.off += Math.max(-1, Math.min(1, (L.tgt - L.off) * rate * step * 1.4));
            if (L.off < 0.02) continue;
            ctx.globalAlpha = L.off;
            ctx.fillStyle = L.c;
            ctx.fillRect(ox + (L.x - 1.2) * sx, oy + (L.y - 1.2) * sx, (L.w + 2.4) * sx, (L.h + 2.4) * sx);
        }
        ctx.globalAlpha = 1;
    }

    function start() { if (!raf) { running = true; last = 0; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    build();
    start();

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var wasMobile = set === data.m; if (wasMobile !== mq.matches) build(); else size(); }, 150); });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
