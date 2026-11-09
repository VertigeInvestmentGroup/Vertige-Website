// Research hero: the river in the photo flows. A WebGL layer re-draws the same photo and slides the water
// (only where river_mask.png says "river", rocks and banks stay still) down-stream using two cross-faded
// phases so the foam keeps moving without a visible loop. If WebGL isn't available the plain photo stays.
(function () {
    var hero = document.querySelector('.rs-hero');
    if (!hero) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;opacity:0;transition:opacity .6s ease;';
    var gl2 = canvas.getContext('webgl2', { alpha: false, antialias: false });
    var gl = gl2 || canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;
    hero.insertBefore(canvas, hero.firstChild);

    var VS = 'attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; v.y = 1.0 - v.y; gl_Position = vec4(p, 0.0, 1.0); }';
    var FS = [
        'precision highp float;',
        'varying vec2 v;',
        'uniform sampler2D uImg; uniform sampler2D uMask;',
        'uniform vec2 uCanvas; uniform vec4 uDraw; uniform vec2 uImgPx; uniform float uT;',
        'vec3 col(vec2 u){ return texture2D(uImg, u).rgb; }',
        'float msk(vec2 u){ return texture2D(uMask, u).r; }',
        'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
        'float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
        '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }',
        // only the bright foam is carried along; dark water and rocks are never moved
        'vec3 foam(vec2 u){ vec3 c = col(u); float l = dot(c, vec3(0.299, 0.587, 0.114)); return c * smoothstep(0.30, 0.60, l) * msk(u); }',
        'void main(){',
        '  vec2 px = v * uCanvas;',
        '  vec2 uv = (px - uDraw.xy) / uDraw.zw;',
        '  vec3 base = col(uv);',
        '  float m = msk(uv);',
        '  if (m < 0.01) { gl_FragColor = vec4(base, 1.0); return; }',
        '  vec2 q = uv * uImgPx / 56.0;',
        '  float ph = vn(q);',                                           // every patch of water is on its own clock
        '  float a = (vn(q * 0.45 + 7.0) - 0.5) * 1.1;',               // flow direction meanders a little
        '  vec2 d = vec2(-0.22, 1.0); d = normalize(vec2(d.x * cos(a) - d.y * sin(a), d.x * sin(a) + d.y * cos(a)));',
        '  float amp = 30.0 * (0.75 + 0.5 * vn(q * 0.6 + 3.0));',      // and its speed varies from patch to patch
        '  vec2 dir = d / uImgPx;',
        '  float p0 = fract(uT / 3.4 + ph);',
        '  float p1 = fract(p0 + 0.5);',
        '  float w0 = 1.0 - abs(2.0 * p0 - 1.0);',
        '  vec3 moved = w0 * foam(uv - dir * p0 * amp) + (1.0 - w0) * foam(uv - dir * p1 * amp);',
        '  vec3 outc = base - m * foam(uv) + m * moved;',
        '  gl_FragColor = vec4(clamp(outc, 0.0, 1.0), 1.0);',
        '}'
    ].join('\n');

    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { canvas.remove(); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['uImg', 'uMask', 'uCanvas', 'uDraw', 'uImgPx', 'uT'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    function tex(unit, img, mips) {
        var t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (mips && gl2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
        else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        return t;
    }

    var img = new Image(), maskImg = new Image(), loaded = 0, iw = 0, ih = 0, W = 0, H = 0;
    var running = false, raf = 0, t0 = 0;

    function size() {
        var r = hero.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
        canvas.width = W; canvas.height = H;
        gl.viewport(0, 0, W, H);
        // same mapping as `background-size: cover; background-position: center 50%`
        var s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
        gl.uniform2f(U.uCanvas, W, H);
        gl.uniform4f(U.uDraw, (W - dw) * 0.5, (H - dh) * 0.5, dw, dh);
    }

    function frame(now) {
        raf = 0;
        if (!running) return;
        if (!t0) t0 = now;
        gl.uniform1f(U.uT, (now - t0) / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (canvas.style.opacity !== '1') canvas.style.opacity = '1';
        raf = requestAnimationFrame(frame);
    }
    function start() { if (loaded === 2 && !running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    function ready() {
        if (++loaded < 2) return;
        iw = img.naturalWidth; ih = img.naturalHeight;
        tex(0, img, true); tex(1, maskImg, false);
        gl.uniform1i(U.uImg, 0); gl.uniform1i(U.uMask, 1);
        gl.uniform2f(U.uImgPx, iw, ih);
        size();
        start();
    }
    img.onload = ready; maskImg.onload = ready;
    img.onerror = maskImg.onerror = function () { canvas.remove(); };
    img.src = 'research_hero.webp?v=5';
    maskImg.src = 'river_mask.png?v=1';

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (loaded === 2) size(); }, 150); });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
