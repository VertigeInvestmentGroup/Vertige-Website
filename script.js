document.addEventListener("DOMContentLoaded", async () => {

    // --- Intersection Observer for Fade Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => observer.observe(el));

    // --- Counter Logic for Impact Section ---
    const counterOptions = {
        threshold: 0.5,
        rootMargin: "0px"
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class to trigger the bottom bar animation
                entry.target.classList.add('visible');

                // Animate the numbers
                const counter = entry.target.querySelector('.counter');
                if (counter && !counter.classList.contains('counted')) {
                    counter.classList.add('counted');
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // 2 seconds
                    const increment = target / (duration / 16); // 60fps
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCounter();
                }
                counterObserver.unobserve(entry.target);
            }
        });
    }, counterOptions);

    const statElements = document.querySelectorAll('.impact-stat');
    statElements.forEach(el => counterObserver.observe(el));

    // --- Navbar Hide on Scroll Down ---
    const navbar = document.getElementById("navbar");
    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;

        // Add frosted glass when not at top
        if (currentScrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        // Hide navbar when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down
            navbar.classList.add("nav-hidden");
        } else {
            // Scrolling up
            navbar.classList.remove("nav-hidden");
        }

        lastScrollY = currentScrollY;
    });

    // --- Living Organism Background Engine ---
    const antigravityBg = document.getElementById('antigravity-bg');

    if (antigravityBg) {
        // Clear out the old CSS orb and particles
        antigravityBg.innerHTML = '';
        initCanvasOrganism(antigravityBg);
    }

    function initCanvasOrganism(container) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none'; // Ensure canvas doesn't block clicks
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d', { alpha: true });
        let width, height;
        let textRects = [];

        function updateTextRects() {
            textRects = [];
            const elements = document.querySelectorAll('h1, h2, h3, p, a, span');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    textRects.push({
                        left: rect.left,
                        right: rect.right,
                        top: rect.top,
                        bottom: rect.bottom,
                        centerX: rect.left + rect.width / 2,
                        centerY: rect.top + rect.height / 2
                    });
                }
            });
        }
        window.addEventListener('scroll', updateTextRects);

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            updateTextRects();
        }
        window.addEventListener('resize', resize);
        resize();

        // One-time brief wait to ensure fonts and layout finish loading
        setTimeout(updateTextRects, 500);

        const pagePath = window.location.pathname.toLowerCase();
        let shapeType = 'sphere'; // default (Index)
        if (pagePath.includes('about')) shapeType = 'octahedron';
        else if (pagePath.includes('portfolio')) shapeType = 'cube';
        else if (pagePath.includes('team')) shapeType = 'tetrahedron';
        else if (pagePath.includes('join')) shapeType = 'torus';

        let numParticles = 700;
        const particles = [];
        const phi = Math.PI * (3 - Math.sqrt(5));

        // Generate points based on the assigned geometric shape for the active page
        for (let i = 0; i < numParticles; i++) {
            let x, y, z;

            if (shapeType === 'sphere') {
                const yPos = 1 - (i / (numParticles - 1)) * 2;
                const radiusAtY = Math.sqrt(1 - yPos * yPos);
                const theta = phi * i;
                x = Math.cos(theta) * radiusAtY;
                y = yPos;
                z = Math.sin(theta) * radiusAtY;
            } else if (shapeType === 'cube') {
                const face = i % 6;
                const u = Math.random() * 2 - 1;
                const v = Math.random() * 2 - 1;
                if (face === 0) { x = 1; y = u; z = v; }
                else if (face === 1) { x = -1; y = u; z = v; }
                else if (face === 2) { x = u; y = 1; z = v; }
                else if (face === 3) { x = u; y = -1; z = v; }
                else if (face === 4) { x = u; y = v; z = 1; }
                else { x = u; y = v; z = -1; }
                x *= 0.65; y *= 0.65; z *= 0.65;
            } else if (shapeType === 'octahedron') {
                let u = Math.random(), v = Math.random();
                if (u + v > 1) { u = 1 - u; v = 1 - v; }
                const w = 1 - u - v;
                x = (Math.random() > 0.5 ? 1 : -1) * u;
                y = (Math.random() > 0.5 ? 1 : -1) * v;
                z = (Math.random() > 0.5 ? 1 : -1) * w;
            } else if (shapeType === 'tetrahedron') {
                const face = i % 4;
                let u = Math.random(), v = Math.random();
                if (u + v > 1) { u = 1 - u; v = 1 - v; }
                const w = 1 - u - v;
                const v1 = [1, 1, 1], v2 = [1, -1, -1], v3 = [-1, 1, -1], v4 = [-1, -1, 1];
                let p1, p2, p3;
                if (face === 0) { p1 = v1; p2 = v2; p3 = v3; }
                else if (face === 1) { p1 = v1; p2 = v2; p3 = v4; }
                else if (face === 2) { p1 = v1; p2 = v3; p3 = v4; }
                else { p1 = v2; p2 = v3; p3 = v4; }
                x = p1[0] * u + p2[0] * v + p3[0] * w;
                y = p1[1] * u + p2[1] * v + p3[1] * w;
                z = p1[2] * u + p2[2] * v + p3[2] * w;
                x *= 0.6; y *= 0.6; z *= 0.6;
            } else if (shapeType === 'torus') {
                const u = Math.random() * Math.PI * 2;
                const v = Math.random() * Math.PI * 2;
                const R = 0.7; const r = 0.3;
                x = (R + r * Math.cos(v)) * Math.cos(u);
                z = (R + r * Math.cos(v)) * Math.sin(u);
                y = r * Math.sin(v);
            }

            particles.push({
                baseX: x, baseY: y, baseZ: z,
                radius: Math.random() * 1.8 + 0.90, // Base resting size
                randomPhase: Math.random() * Math.PI * 2,
                randomSpeed: Math.random() * 0.0015 + 0.0005,
                neighbors: []
            });
        }

        // Pre-calculate nearest spatial neighbors to generate stable wireframe geometry
        for (let i = 0; i < particles.length; i++) {
            if (shapeType === 'sphere') {
                // Sphere retains exact sequential fibonacci mapping
                if (i - 21 >= 0) particles[i].neighbors.push(i - 21);
                if (i - 34 >= 0) particles[i].neighbors.push(i - 34);
            } else {
                // Customized shapes structurally link to physically closest points
                const distances = [];
                for (let j = 0; j < particles.length; j++) {
                    if (i === j) continue;
                    const dx = particles[i].baseX - particles[j].baseX;
                    const dy = particles[i].baseY - particles[j].baseY;
                    const dz = particles[i].baseZ - particles[j].baseZ;
                    distances.push({ index: j, distSq: dx * dx + dy * dy + dz * dz });
                }
                distances.sort((a, b) => a.distSq - b.distSq);
                particles[i].neighbors.push(distances[0].index, distances[1].index);
            }
        }

        // Initialize mouse tracking variables for reactive rotation
        let targetMouseX = 0;
        let targetMouseY = 0;
        let currentMouseX = 0;
        let currentMouseY = 0;

        window.addEventListener('mousemove', (e) => {
            // Normalized mouse coordinates from -1 to 1
            targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
        });

        function getDotColor(x, width, alpha) {
            const ratio = Math.max(0, Math.min(1, x / width));

            // Hue shifts from Deep Blue (230) on left to Sky Blue (190) on right
            const hue = 230 - (ratio * 40);

            // Lightness explicitly shifts from Dark Blue (25%) on left to Light Blue (60%) on right
            const lightness = 25 + (ratio * 35);

            return `hsla(${hue}, 85%, ${lightness}%, ${alpha})`;
        }

        function animate(time) {
            ctx.clearRect(0, 0, width, height);

            // Smoothly ease current mouse towards target mouse
            currentMouseX += (targetMouseX - currentMouseX) * 0.05;
            currentMouseY += (targetMouseY - currentMouseY) * 0.05;

            // Positioning on the right side of the screen
            const isMobile = width < 768;
            const centerX = isMobile ? width * 0.5 : width * 0.70;
            const centerY = isMobile ? height * 0.3 : height * 0.5;

            // Responsive sizing of the shape with a subtle continuous pulse
            const baseRadius = Math.min(width, height) * (isMobile ? 0.35 : 0.45);
            const pulse = Math.sin(time * 0.0015) * 0.02; // +/- 2% scale over time
            const dynamicRadius = baseRadius * (1 + pulse);

            // Simple 3D rotation matrix angles (base auto-rotation + mouse parallax influence)
            const rotationX = time * 0.00015 - (currentMouseY * 0.1);
            const rotationY = time * 0.00025 - (currentMouseX * 0.15);

            const cosX = Math.cos(rotationX);
            const sinX = Math.sin(rotationX);
            const cosY = Math.cos(rotationY);
            const sinY = Math.sin(rotationY);

            const zCamera = 3; // Synthetic camera distance

            // Pass 1: Calculate 3D rotations, organic floating, and screen projections
            particles.forEach((p) => {
                // Organic float makes each dot "breathe" independent of the rigid sphere
                const floatOffset = Math.sin(time * p.randomSpeed + p.randomPhase) * 0.06;
                const pX = p.baseX * (1 + floatOffset);
                const pY = p.baseY * (1 + floatOffset);
                const pZ = p.baseZ * (1 + floatOffset);

                // Rotate points around X axis
                const y1 = pY * cosX - pZ * sinX;
                const z1 = pY * sinX + pZ * cosX;

                // Rotate points around Y axis
                const x2 = pX * cosY + z1 * sinY;
                const z2 = -pX * sinY + z1 * cosY;
                const y2 = y1;

                // Perspective projection factor
                const scale = 2.5 / (zCamera + z2);

                p.screenX = centerX + x2 * dynamicRadius * scale;
                p.screenY = centerY + y2 * dynamicRadius * scale;
                p.z2 = z2;
                p.y2 = y2;
                p.scale = scale;
            });

            // Pass 2: Draw Wireframe Network (Connecting geometric neighbors)
            ctx.lineWidth = 0.6;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                p.neighbors.forEach(neighborIdx => {
                    if (neighborIdx >= 0 && neighborIdx < particles.length) {
                        const n = particles[neighborIdx];

                        // Calculate average depth, only render lines on the front 60% of the sphere for clarity
                        const depthAvg = (p.z2 + n.z2) / 2;
                        if (depthAvg > -0.2) {
                            ctx.beginPath();
                            ctx.moveTo(p.screenX, p.screenY);
                            ctx.lineTo(n.screenX, n.screenY);

                            // Line opacity fades out rapidly towards the horizon/edges
                            const lineOpacity = Math.max(0.02, 0.25 - (depthAvg * 0.25));
                            ctx.strokeStyle = `rgba(100, 150, 255, ${lineOpacity})`;
                            ctx.stroke();
                        }
                    }
                });
            }

            // Pass 3: Draw the Nodes (dots) on top of the lines
            particles.forEach((p) => {
                // Dots facing the camera are highly opaque, back dots fade dramatically 
                const opacity = Math.max(0.05, 0.95 - (p.z2 * 0.5));
                const projectedRadius = p.radius * p.scale;

                // Map vertical coordinate dynamically to the blue color gradient
                const colorRatio = (p.y2 + 1) / 2;
                const color = getDotColor(width * colorRatio, width, opacity);

                ctx.beginPath();
                ctx.arc(p.screenX, p.screenY, projectedRadius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    // --- Chart.js Performance Graph (Fund Page) ---
    const ctxChart = document.getElementById('performanceChart');
    if (ctxChart) {
        try {
            // Use inline data instead of fetching to support file:/// protocol
            const data = { "labels": ["2025-09-02", "2025-09-03", "2025-09-04", "2025-09-05", "2025-09-08", "2025-09-09", "2025-09-10", "2025-09-11", "2025-09-12", "2025-09-15", "2025-09-16", "2025-09-17", "2025-09-18", "2025-09-19", "2025-09-22", "2025-09-23", "2025-09-24", "2025-09-25", "2025-09-26", "2025-09-29", "2025-09-30", "2025-10-01", "2025-10-02", "2025-10-03", "2025-10-06", "2025-10-07", "2025-10-08", "2025-10-09", "2025-10-10", "2025-10-13", "2025-10-14", "2025-10-15", "2025-10-16", "2025-10-17", "2025-10-20", "2025-10-21", "2025-10-22", "2025-10-23", "2025-10-24", "2025-10-27", "2025-10-28", "2025-10-29", "2025-10-30", "2025-10-31", "2025-11-03", "2025-11-04", "2025-11-05", "2025-11-06", "2025-11-07", "2025-11-10", "2025-11-11", "2025-11-12", "2025-11-13", "2025-11-14", "2025-11-17", "2025-11-18", "2025-11-19", "2025-11-20", "2025-11-21", "2025-11-24", "2025-11-25", "2025-11-26", "2025-11-28", "2025-12-01", "2025-12-02", "2025-12-03", "2025-12-04", "2025-12-05", "2025-12-08", "2025-12-09", "2025-12-10", "2025-12-11", "2025-12-12", "2025-12-15", "2025-12-16", "2025-12-17", "2025-12-18", "2025-12-19", "2025-12-22", "2025-12-23", "2025-12-24", "2025-12-26", "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-02", "2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", "2026-01-09", "2026-01-12", "2026-01-13", "2026-01-14", "2026-01-15", "2026-01-16", "2026-01-20", "2026-01-21", "2026-01-22", "2026-01-23", "2026-01-26", "2026-01-27", "2026-01-28", "2026-01-29", "2026-01-30", "2026-02-02", "2026-02-03", "2026-02-04", "2026-02-05", "2026-02-06", "2026-02-09", "2026-02-10", "2026-02-11", "2026-02-12", "2026-02-13", "2026-02-17", "2026-02-18", "2026-02-19", "2026-02-20", "2026-02-23", "2026-02-24", "2026-02-25"], "spData": [100.0, 100.51, 101.35, 101.03, 101.24, 101.51, 101.82, 102.68, 102.63, 103.11, 102.98, 102.88, 103.37, 103.88, 104.34, 103.76, 103.47, 102.95, 103.56, 103.83, 104.25, 104.61, 104.67, 104.68, 105.06, 104.66, 105.27, 104.98, 102.13, 103.73, 103.57, 103.98, 103.33, 103.87, 104.98, 104.98, 104.42, 105.03, 105.86, 107.16, 107.41, 107.4, 106.34, 106.62, 106.8, 105.55, 105.93, 104.75, 104.88, 106.5, 106.72, 106.79, 105.02, 104.97, 104.0, 103.15, 103.53, 101.92, 102.92, 104.51, 105.46, 106.19, 106.76, 106.19, 106.45, 106.77, 106.88, 107.09, 106.72, 106.62, 107.34, 107.57, 106.42, 106.25, 106.0, 104.77, 105.6, 106.53, 107.22, 107.7, 108.05, 108.02, 107.64, 107.49, 106.7, 106.9, 107.58, 108.25, 107.88, 107.89, 108.58, 108.76, 108.54, 107.97, 108.24, 108.17, 105.94, 107.17, 107.76, 107.79, 108.33, 108.78, 108.77, 108.63, 108.16, 108.74, 107.83, 107.28, 105.97, 108.05, 108.56, 108.2, 108.2, 106.5, 106.56, 106.67, 107.26, 106.96, 107.7, 106.58, 107.4, 107.99], "fundData": [102.11, 102.56, 103.5, 103.33, 103.36, 104.06, 104.2, 105.36, 105.47, 105.5, 105.09, 105.21, 105.57, 106.68, 106.72, 106.94, 105.93, 105.78, 106.91, 107.17, 107.66, 107.58, 108.23, 107.52, 108.02, 107.54, 108.88, 108.53, 105.15, 107.07, 107.43, 107.62, 107.21, 107.55, 109.19, 108.34, 107.95, 108.57, 109.82, 111.61, 111.39, 111.32, 110.58, 111.24, 111.45, 109.47, 110.6, 109.12, 109.74, 111.5, 111.08, 111.1, 109.33, 109.26, 108.63, 107.69, 108.22, 106.9, 107.71, 109.7, 110.9, 111.63, 111.84, 111.07, 112.1, 112.13, 111.85, 112.31, 112.07, 111.84, 112.8, 113.11, 111.85, 111.53, 111.96, 111.07, 111.16, 112.74, 113.66, 113.94, 114.55, 114.29, 113.76, 114.1, 113.38, 113.19, 113.83, 115.11, 114.32, 114.22, 115.09, 115.58, 115.62, 114.77, 114.91, 114.64, 112.98, 113.8, 115.09, 114.68, 115.49, 116.44, 116.35, 115.69, 115.67, 116.0, 114.96, 114.96, 113.34, 115.53, 116.53, 115.88, 115.48, 113.96, 114.69, 114.33, 115.02, 115.1, 115.45, 114.49, 115.06, 116.6], "quantData": [100.0, 101.31, 101.19, 102.15, 103.21, 103.48, 104.04, 103.98, 103.75, 104.58, 104.45, 104.28, 105.43, 105.6, 105.99, 106.64, 107.03, 106.67, 106.38, 106.81, 107.41, 108.21, 107.93, 107.5, 108.6, 108.86, 110.07, 110.03, 109.36, 110.99, 111.65, 112.14, 112.5, 113.4, 113.37, 114.03, 114.2, 114.78, 114.76, 114.98, 115.46, 116.25, 116.82, 117.95, 118.5, 118.35, 119.14, 119.37, 120.23, 120.78, 120.37, 119.89, 119.9, 119.39, 119.34, 119.71, 120.84, 121.27, 122.36, 123.73, 125.19, 125.0, 124.74, 125.32, 126.02, 126.47, 127.61, 128.26, 128.52, 129.29, 129.22, 129.07, 129.34, 129.03, 129.76, 129.64, 130.96, 131.37, 131.24, 132.03, 132.06, 132.35, 131.92, 132.36, 132.83, 133.04, 133.68, 134.95, 134.94, 134.49, 135.66, 136.35, 137.45, 136.8, 138.03, 137.57, 138.07, 138.84, 138.64, 138.95, 140.1, 141.29, 141.18, 141.78, 142.04, 142.19, 142.25, 142.11, 141.37, 142.1, 142.69, 143.25, 143.57, 143.13, 144.04, 143.99, 144.32, 144.66, 145.95, 146.28, 146.82, 148.05] };

            const labels = data.labels;
            const spData = data.spData;

            const fundDataRaw = data.fundData;
            const offset = fundDataRaw[0] - 100.0;
            const fundData = fundDataRaw.map(v => Number((v - offset).toFixed(2)));

            const quantData = data.quantData;


            new Chart(ctxChart, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'S&P 500',
                            data: spData,
                            borderColor: '#d4af37',
                            backgroundColor: 'rgba(212, 175, 55, 0.05)',
                            borderWidth: 2,
                            pointBackgroundColor: '#d4af37',
                            pointBorderColor: '#ffffff',
                            pointHoverBackgroundColor: '#ffffff',
                            pointHoverBorderColor: '#d4af37',
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            fill: 'origin',
                            tension: 0.1,
                            borderDash: [5, 5]
                        },
                        {
                            label: 'Vertige Fundamental',
                            data: fundData,
                            borderColor: '#0a192f',
                            backgroundColor: 'rgba(10, 25, 47, 0.05)',
                            borderWidth: 2,
                            pointBackgroundColor: '#0a192f',
                            pointBorderColor: '#ffffff',
                            pointHoverBackgroundColor: '#ffffff',
                            pointHoverBorderColor: '#0a192f',
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            fill: '-1',
                            tension: 0.1
                        },
                        {
                            label: 'Vertige Quantitative',
                            data: quantData,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.05)',
                            borderWidth: 2,
                            pointBackgroundColor: '#3b82f6',
                            pointBorderColor: '#ffffff',
                            pointHoverBackgroundColor: '#ffffff',
                            pointHoverBorderColor: '#3b82f6',
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            fill: '-1',
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#0a192f',
                            titleFont: { family: 'Inter', size: 14 },
                            bodyFont: { family: 'Figtree', size: 13 },
                            padding: 12,
                            cornerRadius: 4,
                            displayColors: false, // User specifically requested no white boxes around colors
                            usePointStyle: true,
                            boxBorderWidth: 0,
                            callbacks: {
                                label: function (context) {
                                    return context.dataset.label + ': ' + context.parsed.y + ' Indexed';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false
                            },
                            ticks: {
                                font: { family: 'Figtree', size: 12 },
                                color: '#64748b',
                                autoSkip: false,
                                maxRotation: 0,
                                callback: function (val, index) {
                                    // labels are "YYYY-MM-DD" e.g., "2025-09-02"
                                    const dateStr = this.getLabelForValue(val);
                                    const [year, month, day] = dateStr.split('-');
                                    // Only show month abbreviations on the first trading day of the month roughly
                                    if (index === 0 || labels[index - 1] && labels[index - 1].split('-')[1] !== month) {
                                        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                        return `${months[parseInt(month) - 1]} ${year}`;
                                    }
                                    return '';
                                }
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(10, 25, 47, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                font: { family: 'Figtree', size: 12 },
                                color: '#64748b',
                                stepSize: 10
                            }
                        }
                    }
                }
            });
        } catch (e) {
            console.error("Failed to load chart_data.json: ", e);
        }
    }

    // --- Team Modal Logic ---
    const teamModal = document.getElementById('teamModal');
    if (teamModal) {
        const span = document.getElementsByClassName('team-modal-close')[0];
        const nameEl = document.getElementById('modalName');
        const roleEl = document.getElementById('modalRole');
        const bioEl = document.getElementById('modalBio');

        document.querySelectorAll('.team-card').forEach(card => {
            card.addEventListener('click', () => {
                const name = card.querySelector('h3').innerText;
                const role = card.querySelector('.team-role').innerText;

                nameEl.innerText = name;
                roleEl.innerText = role;

                if (bioEl) {
                    bioEl.style.display = 'none';
                }

                teamModal.style.display = 'flex';
                // Trigger reflow
                void teamModal.offsetWidth;
                teamModal.classList.add('show');
            });
        });

        const closeModal = () => {
            teamModal.classList.remove('show');
            setTimeout(() => {
                teamModal.style.display = 'none';
            }, 300); // match transition duration
        };

        if (span) {
            span.onclick = closeModal;
        }

        window.onclick = (event) => {
            if (event.target == teamModal) {
                closeModal();
            }
        };
    }

    // --- Chart.js Portfolio Allocation Graph ---
    const ctxAlloc = document.getElementById('allocationChart');
    if (ctxAlloc) {
        new Chart(ctxAlloc, {
            type: 'doughnut',
            data: {
                labels: ['Technology', 'Healthcare', 'Consumer Discretionary', 'Industrials', 'Financials & Other'],
                datasets: [{
                    data: [35, 25, 15, 15, 10],
                    backgroundColor: [
                        '#0a192f', // Dark Indigo
                        '#21437a', // Medium Blue
                        '#3b82f6', // Brand Blue (Light)
                        '#8da4d6', // Muted Blue
                        '#d4af37'  // Brand Gold
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%', // Makes the donut ring thinner
                plugins: {
                    legend: {
                        display: false // We built a custom HTML legend instead
                    },
                    tooltip: {
                        backgroundColor: '#0a192f',
                        titleFont: { family: 'Inter', size: 14 },
                        bodyFont: { family: 'Figtree', size: 13 },
                        padding: 12,
                        cornerRadius: 4,
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Fund Page DNA Helix Visual ---
    const fundCanvasContainer = document.getElementById('fund-local-canvas-container');
    if (fundCanvasContainer) {
        initFundDNA(fundCanvasContainer);
    }

    function initFundDNA(container) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d', { alpha: true });
        let width, height;

        function resize() {
            width = container.clientWidth;
            height = container.clientHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        }
        window.addEventListener('resize', resize);
        resize();

        const numParticles = 250;
        const particles = [];

        for (let i = 0; i < numParticles; i++) {
            const u = Math.random() * 2 - 1;
            const xPos = u;
            const maxRadius = Math.cos(u * Math.PI / 2) * 0.35;

            const theta = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * maxRadius;

            const yPos = r * Math.sin(theta);
            const zPos = r * Math.cos(theta);

            particles.push({
                baseX: xPos,
                baseY: yPos,
                baseZ: zPos,
                radius: Math.random() * 1.8 + 0.9,
                randomPhase: Math.random() * Math.PI * 2,
                randomSpeed: Math.random() * 0.0015 + 0.0005,
                neighbors: []
            });
        }

        for (let i = 0; i < particles.length; i++) {
            const distances = [];
            for (let j = 0; j < particles.length; j++) {
                if (i === j) continue;
                const dx = particles[i].baseX - particles[j].baseX;
                const dy = particles[i].baseY - particles[j].baseY;
                const dz = particles[i].baseZ - particles[j].baseZ;
                distances.push({ index: j, distSq: dx * dx + dy * dy + dz * dz });
            }
            distances.sort((a, b) => a.distSq - b.distSq);
            particles[i].neighbors.push(distances[0].index, distances[1].index, distances[2].index);
        }

        let targetMouseX = 0;
        let targetMouseY = 0;
        let currentMouseX = 0;
        let currentMouseY = 0;

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            targetMouseX = ((e.clientX - rect.left) / width) * 2 - 1;
            targetMouseY = ((e.clientY - rect.top) / height) * 2 - 1;
        });

        container.addEventListener('mouseleave', () => {
            targetMouseX = 0;
            targetMouseY = 0;
        });

        function getDotColor(ratio, alpha) {
            const clamped = Math.max(0, Math.min(1, ratio));
            const hue = 230 - (clamped * 40);
            const lightness = 25 + (clamped * 35);
            return `hsla(${hue}, 85%, ${lightness}%, ${alpha})`;
        }

        function animate(time) {
            ctx.clearRect(0, 0, width, height);

            currentMouseX += (targetMouseX - currentMouseX) * 0.05;
            currentMouseY += (targetMouseY - currentMouseY) * 0.05;

            const centerX = width / 2;
            const centerY = height / 2;

            const dynamicRadius = width * 0.45;

            const rotationX = time * 0.00025 - (currentMouseY * 0.5);
            const rotationY = Math.sin(time * 0.0003) * 0.15 - (currentMouseX * 0.3);

            const cosX = Math.cos(rotationX);
            const sinX = Math.sin(rotationX);
            const cosY = Math.cos(rotationY);
            const sinY = Math.sin(rotationY);

            const zCamera = 3;

            particles.forEach((p) => {
                const floatOffset = Math.sin(time * p.randomSpeed + p.randomPhase) * 0.06;
                const pX = p.baseX * (1 + floatOffset);
                const pY = p.baseY * (1 + floatOffset);
                const pZ = p.baseZ * (1 + floatOffset);

                const y1 = pY * cosX - pZ * sinX;
                const z1 = pY * sinX + pZ * cosX;

                const x2 = pX * cosY + z1 * sinY;
                const z2 = -pX * sinY + z1 * cosY;
                const y2 = y1;

                const scale = 2.5 / (zCamera + z2);

                p.screenX = centerX + x2 * dynamicRadius * scale;
                p.screenY = centerY + y2 * dynamicRadius * scale;
                p.z2 = z2;
                p.x2 = x2;
                p.scale = scale;
            });

            ctx.lineWidth = 0.6;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.neighbors.forEach(neighborIdx => {
                    const n = particles[neighborIdx];
                    const depthAvg = (p.z2 + n.z2) / 2;
                    if (depthAvg > -0.2) {
                        ctx.beginPath();
                        ctx.moveTo(p.screenX, p.screenY);
                        ctx.lineTo(n.screenX, n.screenY);
                        const lineOpacity = Math.max(0.02, 0.25 - (depthAvg * 0.25));
                        ctx.strokeStyle = `rgba(100, 150, 255, ${lineOpacity})`;
                        ctx.stroke();
                    }
                });
            }

            particles.forEach((p) => {
                const opacity = Math.max(0.05, 0.95 - (p.z2 * 0.5));
                const projectedRadius = p.radius * p.scale;

                const colorRatio = (p.x2 + 1) / 2;
                const color = getDotColor(colorRatio, opacity);

                ctx.beginPath();
                ctx.arc(p.screenX, p.screenY, projectedRadius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }
});
