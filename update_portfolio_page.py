import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace head to include Chart.js and update CSS cache buster
head_target = r'<link rel="stylesheet" href="styles.css">'
head_replacement = '''<link rel="stylesheet" href="styles.css?v=5">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>'''
html = html.replace(head_target, head_replacement)

# Update Title
html = html.replace('<title>Fund Performance | Vertige Investment Group</title>', '<title>Portfolio & Positions | Vertige Investment Group</title>')

# Update Navigation Active State
# Make sure "Portfolio" remains active, "Fund" is completely separate

# Extract the <style> block and replace it
new_styles = '''
        .portfolio-dashboard {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 2rem;
            margin-bottom: 4rem;
        }

        .portfolio-main-stat {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 4rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .stat-large {
            font-size: clamp(3rem, 6vw, 5rem);
            font-family: var(--font-heading);
            font-weight: 700;
            line-height: 1;
            color: var(--brand-indigo);
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 2;
        }

        .stat-label-large {
            font-size: 1.25rem;
            color: var(--text-muted);
            font-weight: 500;
            position: relative;
            z-index: 2;
        }

        .portfolio-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
        }

        .metric-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            transition: all var(--transition-base);
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(46, 26, 71, 0.1);
        }

        .metric-value {
            font-size: 2.25rem;
            font-family: var(--font-heading);
            font-weight: 600;
            color: var(--brand-indigo);
            margin-bottom: 0.5rem;
        }

        .metric-name {
            color: var(--text-muted);
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Allocation Section */
        .allocation-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            margin-bottom: 6rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 3rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .chart-wrapper {
            position: relative;
            height: 350px;
            width: 100%;
        }

        .allocation-text h3 {
            font-size: 1.75rem;
            color: var(--brand-indigo);
            margin-bottom: 1.5rem;
            font-family: var(--font-heading);
        }

        .allocation-text p {
            color: var(--text-muted);
            margin-bottom: 2rem;
            line-height: 1.8;
        }

        .allocation-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .allocation-list li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-color);
            font-weight: 500;
        }
        
        .allocation-list li:last-child {
            border-bottom: none;
        }

        .allocation-item-name {
            display: flex;
            align-items: center;
        }

        .allocation-list li span:last-child {
            color: var(--brand-indigo);
            font-weight: 600;
        }
        
        .color-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 12px;
        }

        /* Holdings Section */
        .holdings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 2rem;
            margin-bottom: 6rem;
        }

        .holding-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 2rem;
            transition: all var(--transition-base);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .holding-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px -10px rgba(46, 26, 71, 0.15);
            border-color: rgba(46, 26, 71, 0.2);
        }

        .holding-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1rem;
        }

        .holding-ticker {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--brand-indigo);
        }

        .holding-name {
            font-size: 0.95rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .holding-sector {
            display: inline-block;
            padding: 0.35rem 0.75rem;
            background: var(--brand-indigo-light);
            color: var(--brand-indigo);
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 1rem 0;
        }

        .holding-thesis {
            color: var(--text-color);
            font-size: 0.95rem;
            line-height: 1.6;
        }

        @media (max-width: 900px) {
            .portfolio-dashboard {
                grid-template-columns: 1fr;
            }
            .allocation-container {
                grid-template-columns: 1fr;
                gap: 2rem;
                padding: 1.5rem;
            }
        }
'''
html = re.sub(r'<style>.*?</style>', f'<style>\n{new_styles}\n    </style>', html, flags=re.DOTALL)

new_main = '''
    <main class="page-wrapper container">
        <div class="page-header fade-up">
            <h1 class="hero-title">Portfolio & Positions</h1>
            <p class="hero-subtitle">Explore the fund's current capital deployments, sector allocations, and high-conviction fundamental equity pitches.</p>
        </div>

        <!-- Portfolio Dashboard -->
        <h2 class="hero-title fade-up" style="font-size: 2rem; margin-bottom: 2rem; border-bottom: 2px solid var(--brand-indigo); padding-bottom: 0.5rem; display: inline-block;">Current Overview</h2>
        <div class="portfolio-dashboard fade-up">
            <div class="portfolio-main-stat">
                <div class="stat-label-large" style="margin-bottom: 0.5rem; color: var(--brand-indigo); font-weight: 600;">Overall Capital</div>
                <div class="stat-large">$4.2M</div>
                <div class="stat-label-large">Total Assets Under Management</div>
            </div>

            <div class="portfolio-metrics">
                <div class="metric-card">
                    <span class="metric-value">24</span>
                    <span class="metric-name">Active Positions</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value">0.85</span>
                    <span class="metric-name">Portfolio Beta</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value">62%</span>
                    <span class="metric-name">Active Share</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value">4.5%</span>
                    <span class="metric-name">Cash Position</span>
                </div>
            </div>
        </div>

        <!-- Asset Allocation Section -->
        <div class="fade-up" style="margin-bottom: 4rem;">
            <h2 class="hero-title" style="font-size: 2rem; margin-bottom: 2rem; border-bottom: 2px solid var(--brand-indigo); padding-bottom: 0.5rem; display: inline-block;">Sector Allocation</h2>
            <div class="allocation-container">
                <div class="chart-wrapper">
                    <canvas id="allocationChart"></canvas>
                </div>
                <div class="allocation-text">
                    <h3>Strategic Positioning</h3>
                    <p>Our portfolio is currently overweight in Technology and Healthcare, reflecting our conviction in secular growth trends and inelastic demand. We maintain strict sector limits to isolate idiosyncratic risk while hedging core macroeconomic exposures.</p>
                    <ul class="allocation-list">
                        <li>
                            <div class="allocation-item-name"><span class="color-dot" style="background-color: #0a192f;"></span> Technology</div>
                            <span>35%</span>
                        </li>
                        <li>
                            <div class="allocation-item-name"><span class="color-dot" style="background-color: #21437a;"></span> Healthcare</div>
                            <span>25%</span>
                        </li>
                        <li>
                            <div class="allocation-item-name"><span class="color-dot" style="background-color: #3b82f6;"></span> Consumer Discretionary</div>
                            <span>15%</span>
                        </li>
                        <li>
                            <div class="allocation-item-name"><span class="color-dot" style="background-color: #8da4d6;"></span> Industrials</div>
                            <span>15%</span>
                        </li>
                        <li>
                            <div class="allocation-item-name"><span class="color-dot" style="background-color: #d4af37;"></span> Financials & Other</div>
                            <span>10%</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Featured Holdings Section -->
        <div class="fade-up">
            <h2 class="hero-title" style="font-size: 2rem; margin-bottom: 2rem; border-bottom: 2px solid var(--brand-indigo); padding-bottom: 0.5rem; display: inline-block;">Featured Holdings</h2>
            <div class="holdings-grid">
                
                <div class="holding-card">
                    <div class="holding-header">
                        <div class="holding-ticker">MSFT</div>
                        <div class="holding-name">Microsoft Corp.</div>
                    </div>
                    <div class="holding-sector">Technology</div>
                    <p class="holding-thesis">Core holding driven by insurmountable enterprise software moats and accelerated Azure cloud growth. Early AI monetization via Copilot provides significant upside optionality not fully captured by consensus estimates.</p>
                </div>

                <div class="holding-card">
                    <div class="holding-header">
                        <div class="holding-ticker">LLY</div>
                        <div class="holding-name">Eli Lilly and Co.</div>
                    </div>
                    <div class="holding-sector">Healthcare</div>
                    <p class="holding-thesis">Unmatched pipeline density in the GLP-1 space. Our models indicate terminal market size for obesity treatments is structurally underappreciated, yielding a sustained premium valuation compared to peer pharma majors.</p>
                </div>

                <div class="holding-card">
                    <div class="holding-header">
                        <div class="holding-ticker">LVMUY</div>
                        <div class="holding-name">LVMH</div>
                    </div>
                    <div class="holding-sector">Consumer Discretionary</div>
                    <p class="holding-thesis">Diversified exposure to the resilient ultra-high-net-worth consumer base. Best-in-class brand equity allows for pricing power that outpaces inflation without destroying volume demand.</p>
                </div>

                <div class="holding-card">
                    <div class="holding-header">
                        <div class="holding-ticker">CRWD</div>
                        <div class="holding-name">CrowdStrike</div>
                    </div>
                    <div class="holding-sector">Technology</div>
                    <p class="holding-thesis">Rapid module adoption and platform stickiness secure its position as the de facto next-gen endpoint security leader. High gross retention limits downside despite elevated near-term multiples.</p>
                </div>
                
                <div class="holding-card">
                    <div class="holding-header">
                        <div class="holding-ticker">VRTX</div>
                        <div class="holding-name">Vertex Pharma</div>
                    </div>
                    <div class="holding-sector">Healthcare</div>
                    <p class="holding-thesis">Monopoly position in cystic fibrosis generates robust free cash flow, funding pipeline expansion into sickle cell and acute pain. Near-term catalysts provide asymmetric risk/reward.</p>
                </div>

                <div class="holding-card">
                    <div class="holding-header">
                        <div class="holding-ticker">JPM</div>
                        <div class="holding-name">J.P. Morgan Chase</div>
                    </div>
                    <div class="holding-sector">Financials</div>
                    <p class="holding-thesis">Fortress balance sheet and diversified revenue streams insulate the firm from isolated macroeconomic shocks. Best-in-class management provides a stable anchor for the broader portfolio.</p>
                </div>

            </div>
        </div>
    </main>
'''

html = re.sub(r'<main.*?</main>', new_main, html, flags=re.DOTALL)

with open('portfolio.html', 'w', encoding='utf-8') as f:
    f.write(html)
