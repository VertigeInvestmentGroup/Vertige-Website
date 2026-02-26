import re

with open('about.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make the title Regulatory Disclosures
html = re.sub(r'<title>.*?</title>', '<title>Regulatory Disclosures | Vertige Investment Group</title>', html)

# Remove the active class from the about us link
html = re.sub(r'<li><a href="about.html" class="active">About Us</a></li>', r'<li><a href="about.html">About Us</a></li>', html)

# Replace the main content
main_content = '''
    <main class="page-wrapper">
        <div class="container" style="max-width: 800px; margin: 0 auto; padding: 4rem 1rem;">
            <div class="page-header fade-up" style="margin-bottom: 3rem; text-align: left;">
                <h1 class="hero-title" style="color: var(--brand-indigo); font-size: 2.5rem; text-align: left; margin-bottom: 1rem;">Regulatory Disclosures</h1>
                <p class="hero-subtitle" style="text-align: left; max-width: 100%; font-size: 1.1rem; color: #64748b;">
                    Important legal and regulatory information regarding Vertige Investment Group.
                </p>
            </div>
            
            <div class="fade-up" style="color: var(--text-color); line-height: 1.8; margin-bottom: 5rem; font-size: 1rem;">
                <p style="margin-bottom: 1.5rem;">
                    Vertige Investment Group is a student-run organization at the University of Toronto. It is not registered as an investment advisor, broker-dealer, or any other financial institution with the Ontario Securities Commission (OSC) or any other regulatory authority.
                </p>
                <p style="margin-bottom: 1.5rem;">
                    The information provided on this website and in our reports is for educational and informational purposes only and should not be construed as financial, investment, or legal advice. 
                </p>
                <p style="margin-bottom: 1.5rem;">
                    All investments involve risk, including the possible loss of principal. Past performance is not indicative of future results. The portfolios and strategies discussed are simulated or managed with limited capital for educational purposes under the supervision of the university.
                </p>
                <p>
                    By using this site, you acknowledge that Vertige Investment Group assumes no responsibility for your trading or investment decisions.
                </p>
            </div>
        </div>
    </main>
'''

html = re.sub(r'<main.*?</main>', main_content, html, flags=re.DOTALL)

with open('disclosures.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('disclosures.html created')
