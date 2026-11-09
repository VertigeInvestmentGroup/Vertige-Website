// Research hero: the trees sway very slightly in the wind. A WebGL layer re-draws the same photo and nudges the
// dark foliage with a slow, smooth wind wave (more at the treetops, none in the sky, mist or river).
// If WebGL isn't available, or reduced motion is on, the plain photo stays.
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
        'uniform sampler2D uImg;',
        'uniform vec2 uCanvas; uniform vec4 uDraw; uniform vec2 uImgPx; uniform float uT;',
        'vec3 col(vec2 u){ return texture2D(uImg, u).rgb; }',
        'void main(){',
        '  vec2 px = v * uCanvas;',
        '  vec2 uv = (px - uDraw.xy) / uDraw.zw;',
        '  vec3 base = col(uv);',
        '  float l = dot(base, vec3(0.299, 0.587, 0.114));',
        '  float tree = smoothstep(0.34, 0.16, l);',                                  // dark foliage only: not sky, mist or foam
        '  float high = smoothstep(0.90, 0.15, uv.y);',                               // sway more toward the top of the frame
        '  float river = smoothstep(0.0, 0.06, uv.x - 0.30) * (1.0 - smoothstep(0.50, 0.58, uv.x)) * smoothstep(0.50, 0.56, uv.y);',
        '  float w = tree * (0.25 + 0.75 * high) * (1.0 - river);',
        '  float gust = 0.55 + 0.45 * sin(uT * 0.21 + uv.x * 2.0);',                  // the wind comes and goes
        '  float s = 0.65 * sin(uT * 0.85 + uv.x * 7.0 + uv.y * 3.0) + 0.35 * sin(uT * 0.55 - uv.y * 11.0 + uv.x * 3.0);',
        '  vec2 d = vec2(s, 0.22 * s * sin(uT * 0.7 + uv.x * 5.0)) * 0.0011 * gust * w;',
        '  gl_FragColor = vec4(col(uv + d), 1.0);',
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
    ['uImg', 'uCanvas', 'uDraw', 'uImgPx', 'uT'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

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

    var img = new Image(), loaded = 0, iw = 0, ih = 0, W = 0, H = 0;
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
        loaded = 2;
        iw = img.naturalWidth; ih = img.naturalHeight;
        tex(0, img, true);
        gl.uniform1i(U.uImg, 0);
        gl.uniform2f(U.uImgPx, iw, ih);
        size();
        start();
    }
    img.onload = ready;
    img.onerror = function () { canvas.remove(); };
    img.src = 'research_hero.webp?v=5';

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (loaded === 2) size(); }, 150); });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
