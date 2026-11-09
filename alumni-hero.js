// Alumni hero: a few window lights in the skyline photo slowly fade off and back on.
// A transparent canvas sits between the photo and the dark overlay. To "switch off" a light we cross-fade in the
// same spot from a copy of the photo with the lights painted out (alumni_hero_off.webp), so the window simply
// returns to the dark facade behind it. Positions come from alumni-lights.js.
(function () {
    var hero = document.querySelector('.rs-hero');
    var data = window.VIG_LIGHTS;
    if (!hero || !data) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var off = new Image();
    var ready = false;
    off.onload = function () { ready = true; };
    off.src = 'alumni_hero_off.webp?v=1';

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
    hero.insertBefore(canvas, hero.firstChild);
    var ctx = canvas.getContext('2d');

    var glist = [], groups = {}, set, lights = [], W = 0, H = 0, dpr = 1, sx = 1, ox = 0, oy = 0;
    var mq = window.matchMedia ? window.matchMedia('(max-width: 768px)') : { matches: false };
    var PAD = 2;   // source pixels of margin around each light, so the patch blends into its surroundings

    function build() {
        set = mq.matches ? data.m : data.d;
        var a = set.a, n = a.length / 4;
        lights = []; groups = {};
        for (var i = 0; i < n; i++) {
            var k = i * 4;
            lights.push({
                x: a[k], y: a[k + 1], w: a[k + 2], h: a[k + 3],
                v: 0,                                   // how far "off" it is, 0 (lit) to 1 (dark)
                tgt: 0,
                delay: 0
            });
            var gk = Math.floor(a[k] / 70) + ':' + Math.floor(a[k + 1] / 45);
            (groups[gk] = groups[gk] || { m: [], tgt: 0, next: 1 + Math.random() * 14 }).m.push(lights[i]);
        }
        glist = Object.keys(groups).map(function (q) { return groups[q]; });
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
        if (acc < 1 / 30 || !ready) return;
        var step = acc; acc = 0;

        var os = data.offScale;   // off-image pixels per source pixel
        ctx.clearRect(0, 0, W, H);
        // a group (a few windows close together, like one floor) goes dark and comes back as one
        for (var g = 0; g < glist.length; g++) {
            var G = glist[g];
            G.next -= step;
            if (G.next <= 0) {
                G.tgt = G.tgt ? 0 : 1;
                G.next = G.tgt ? 3 + Math.random() * 5 : 6 + Math.random() * 14;
                for (var j = 0; j < G.m.length; j++) G.m[j].delay = Math.random() * 0.5;
                G.fire = true;
            }
            for (var j2 = 0; j2 < G.m.length; j2++) {
                var M = G.m[j2];
                if (G.fire && M.delay > 0) { M.delay -= step; if (M.delay <= 0) M.tgt = G.tgt; }
                else if (G.fire === false || M.delay <= 0) M.tgt = G.tgt;
            }
            if (G.fire && G.m.every(function (m) { return m.delay <= 0; })) G.fire = false;
        }
        for (var i = 0; i < lights.length; i++) {
            var L = lights[i];
            // ease: well under a second to fade either way
            L.v += (L.tgt - L.v) * Math.min(1, step * 3.2);
            if (L.v < 0.015) continue;
            var px = L.x - PAD, py = L.y - PAD, pw = L.w + PAD * 2, ph = L.h + PAD * 2;
            ctx.globalAlpha = L.v;
            ctx.drawImage(off, (px + set.ox) * os, py * os, pw * os, ph * os,
                ox + px * sx, oy + py * sx, pw * sx, ph * sx);
        }
        ctx.globalAlpha = 1;
    }

    function start() { if (!raf) { running = true; last = 0; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    build();
    start();

    window.addEventListener('resize', function () {
        clearTimeout(build.t);
        build.t = setTimeout(function () { var wasMobile = set === data.m; if (wasMobile !== mq.matches) build(); else size(); }, 150);
    });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
