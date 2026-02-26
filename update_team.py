import re

with open('team.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_styles = '''
        .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 2rem;
            margin-bottom: 4rem;
        }

        .team-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            transition: all var(--transition-base);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            cursor: pointer;
        }

        .team-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px -10px rgba(46, 26, 71, 0.15);
            border-color: rgba(46, 26, 71, 0.2);
        }

        .team-avatar {
            width: 100%;
            height: 280px;
            background-size: cover;
            background-position: center;
            position: relative;
            background-color: var(--brand-indigo-light);
            background-image: linear-gradient(to bottom, transparent, rgba(46, 26, 71, 0.1));
            border-bottom: 1px solid var(--border-color);
        }

        .team-info {
            padding: 1.5rem;
        }

        .team-info h3 {
            font-size: 1.25rem;
            margin-bottom: 0.25rem;
            color: var(--brand-indigo);
        }

        .team-role {
            color: #718096;
            font-weight: 500;
            font-size: 0.9rem;
            margin-bottom: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .team-exp {
            color: var(--brand-indigo);
            font-size: 0.85rem;
            font-weight: 500;
            padding-top: 0.75rem;
            border-top: 1px solid var(--border-color);
        }

        /* Modal Styles */
        .team-modal {
            display: none; 
            position: fixed; 
            z-index: 1000; 
            left: 0;
            top: 0;
            width: 100%; 
            height: 100%; 
            overflow: auto; 
            background-color: rgba(10, 25, 47, 0.8); 
            backdrop-filter: blur(5px);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .team-modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 1;
        }
        .team-modal-content {
            background-color: var(--bg-main);
            margin: auto;
            padding: 3rem;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            width: 90%;
            max-width: 700px;
            position: relative;
            transform: translateY(20px);
            transition: transform 0.3s ease;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .team-modal.show .team-modal-content {
            transform: translateY(0);
        }
        .team-modal-close {
            color: var(--text-muted);
            position: absolute;
            top: 1rem;
            right: 1.5rem;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.2s;
        }
        .team-modal-close:hover,
        .team-modal-close:focus {
            color: var(--brand-indigo);
            text-decoration: none;
        }
        .team-modal-body {
            display: flex;
            gap: 2rem;
        }
        @media (max-width: 600px) {
            .team-modal-body {
                flex-direction: column;
            }
        }
        .team-modal-avatar {
            width: 200px;
            height: 200px;
            flex-shrink: 0;
            background-color: var(--brand-indigo-light);
            border-radius: 8px;
            background-image: linear-gradient(to bottom, transparent, rgba(46, 26, 71, 0.1));
        }
        .team-modal-info h2 {
            font-family: var(--font-heading);
            color: var(--brand-indigo);
            margin-bottom: 0.5rem;
            font-size: 2rem;
        }
        .team-modal-info .team-role {
            font-size: 1rem;
            margin-bottom: 0.5rem;
        }
        .team-modal-info .team-exp {
            border: none;
            padding-top: 0;
            margin-bottom: 1.5rem;
        }
        .team-bio {
            color: var(--text-color);
            line-height: 1.6;
        }
'''

html = re.sub(r'<style>.*?</style>', f'<style>\n{new_styles}\n    </style>', html, flags=re.DOTALL)

def gen_card(name, role, exp):
    bio = f"{name} is a dedicated {role} with a strong background in analytical problem solving. They joined the fund to apply their academic knowledge to real-world capital allocation strategies."
    return f'''
                <div class="team-card" data-bio="{bio}">
                    <div class="team-avatar"></div>
                    <div class="team-info">
                        <h3>{name}</h3>
                        <p class="team-role">{role}</p>
                        <p class="team-exp">{exp}</p>
                    </div>
                </div>'''

exec_names = ['James Harrington', 'Evelyn Chen', 'Marcus Riad', 'Sarah Jenkins', 'Michael Torres']
exec_roles = ['President', 'Vice President', 'Head of Research', 'Head of Macro', 'Head of Risk']
exec_exp = ['Incoming Analyst, Goldman Sachs', 'Incoming Quant, Citadel', 'Incoming Analyst, Morgan Stanley', 'Incoming Analyst, Blackstone', 'Incoming Analyst, J.P. Morgan']
exec_committee = ''.join([gen_card(exec_names[i], exec_roles[i], exec_exp[i]) for i in range(5)])

md_names = ['Alex Cho', 'Olivia Bennett', 'Daniel Kim', 'Sophia Martinez', 'William Davies', 'Emma Wilson']
md_roles = ['Managing Director - Healthcare', 'Managing Director - TMT', 'Managing Director - Quant Strategy', 'Managing Director - Consumer', 'Managing Director - Industrials', 'Managing Director - FIG']
md_exp = ['Summer Analyst, Lazard', 'Summer Analyst, Evercore', 'Summer Quant, Two Sigma', 'Summer Analyst, Moelis & Co.', 'Summer Analyst, Bank of America', 'Summer Analyst, Citi']
managing_directors = ''.join([gen_card(md_names[i], md_roles[i], md_exp[i]) for i in range(6)])

analysts = ''.join([gen_card(f'Analyst Name {i}', 'Investment Analyst', f'Incoming Summer Analyst') for i in range(1, 16)])

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
                    <p id="modalExp" class="team-exp">Experience</p>
                    <p id="modalBio" class="team-bio">Biography goes here...</p>
                </div>
            </div>
        </div>
    </div>
'''

html = re.sub(r'<main.*?</main>', new_main, html, flags=re.DOTALL)

with open('team.html', 'w', encoding='utf-8') as f:
    f.write(html)
