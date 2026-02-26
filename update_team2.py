import re

with open('team.html', 'r', encoding='utf-8') as f:
    html = f.read()

def gen_card(name, role):
    bio = f"{name} is a dedicated {role} with a strong background in analytical problem solving. They joined the fund to apply their academic knowledge to real-world capital allocation strategies."
    return f'''
                <div class="team-card" data-bio="{bio}">
                    <div class="team-avatar"></div>
                    <div class="team-info">
                        <h3>{name}</h3>
                        <p class="team-role">{role}</p>
                    </div>
                </div>'''

exec_names = ['Ishaan Mookherjee', 'Jacob Ma', 'Julia Chiriac', 'Giuliano Rizzo', 'Ariaman Pooramini']
exec_roles = ['President', 'Vice President', 'Head of Equity Research', 'Director of Events and Logistics', 'Director of Marketing']
exec_committee = ''.join([gen_card(exec_names[i], exec_roles[i]) for i in range(len(exec_names))])

md_names = ['Aleksi Reczek', 'Felicity Tran', 'Sophia Ouanés', 'Kabir Rangwani', 'Yusuf Saputra', 'Willis Yorick Zambo Zambo']
md_roles = ['Managing Director - Healthcare', 'Managing Director - TMT', 'Managing Director - Industrials', 'Managing Director - Financial Services', 'Managing Director - Energy', 'Managing Director - Real Estate']
managing_directors = ''.join([gen_card(md_names[i], md_roles[i]) for i in range(len(md_names))])

analyst_list = [
    ('Keane Mohammad Aushaff', 'Energy Analyst'),
    ('Rain Jing', 'Energy Analyst'),
    ('Lauren Boyle', 'TMT Analyst'),
    ('William Keene', 'TMT Analyst'),
    ('Nawaal Khalif', 'TMT Analyst'),
    ('Forrest Yang', 'Real Estate Analyst'),
    ('Arthur Wan', 'Real Estate Analyst'),
    ('Gabriel Magalhães', 'Real Estate Analyst'),
    ('Milan Khameneh', 'Financial Services Analyst'),
    ('Khang Nguyen', 'Financial Services Analyst'),
    ('Misha Shneyerson', 'Financial Services Analyst'),
    ('Alex Jassal', 'Healthcare Analyst'),
    ('Henry Gallagher', 'Healthcare Analyst'),
    ('Nigel Fang', 'Industrials Analyst'),
    ('Joshua Kim', 'Industrials Analyst')
]

analysts = ''.join([gen_card(name, role) for name, role in analyst_list])

new_main = f'''
    <main class="page-wrapper container">
        <div class="page-header fade-up" style="margin-bottom: 5rem;">
            <h1 class="hero-title">Our Team</h1>
            <p class="hero-subtitle">Our fund is governed and managed by dedicated University of Toronto students with
                rigorous training and experience across top-tier investment banks and buyside firms.</p>
        </div>

        <!-- Executive Committee Section -->
        <div class="team-section fade-up" style="margin-bottom: 4rem;">
            <h2 class="hero-title"
                style="font-size: 2.25rem; margin-bottom: 2.5rem; border-bottom: 2px solid var(--brand-indigo); padding-bottom: 0.75rem; display: inline-block;">
                Executive Committee</h2>
            <div class="team-grid">
{exec_committee}
            </div>
        </div>

        <!-- Managing Directors Section -->
        <div class="team-section fade-up" style="margin-bottom: 4rem;">
            <h2 class="hero-title"
                style="font-size: 2.25rem; margin-bottom: 2.5rem; border-bottom: 2px solid var(--brand-indigo); padding-bottom: 0.75rem; display: inline-block;">
                Managing Directors</h2>
            <div class="team-grid">
{managing_directors}
            </div>
        </div>

        <!-- Analysts Section -->
        <div class="team-section fade-up" style="margin-bottom: 6rem;">
            <h2 class="hero-title"
                style="font-size: 2.25rem; margin-bottom: 2.5rem; border-bottom: 2px solid var(--brand-indigo); padding-bottom: 0.75rem; display: inline-block;">
                Analysts</h2>
            <div class="team-grid">
{analysts}
            </div>
        </div>
    </main>

    <!-- Modal -->
    <div id="teamModal" class="team-modal">
        <div class="team-modal-content">
            <span class="team-modal-close">&times;</span>
            <div class="team-modal-body">
                <div class="team-modal-avatar"></div>
                <div class="team-modal-info">
                    <h2 id="modalName">Name</h2>
                    <p id="modalRole" class="team-role">Role</p>
                    <p id="modalBio" class="team-bio">Biography goes here...</p>
                </div>
            </div>
        </div>
    </div>
'''

html = re.sub(r'<main.*?</main>.*?</div>\n    </div>', new_main, html, flags=re.DOTALL)

with open('team.html', 'w', encoding='utf-8') as f:
    f.write(html)
