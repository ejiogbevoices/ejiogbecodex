// Data is loaded globally from odu.js

// State Management
const state = {
    bookmarks: JSON.parse(localStorage.getItem('oduverse_bookmarks') || '[]'),
    notes: JSON.parse(localStorage.getItem('oduverse_notes') || '{}'),
    searchQuery: ''
};

function toggleBookmark(id) {
    const index = state.bookmarks.indexOf(id);
    if (index === -1) {
        state.bookmarks.push(id);
    } else {
        state.bookmarks.splice(index, 1);
    }
    localStorage.setItem('oduverse_bookmarks', JSON.stringify(state.bookmarks));
    navigate(); // Re-render to show updated status
}

// Simple Router
const routes = {
    'home': renderHome,
    'browse': renderBrowse,
    'odu': renderOduDetail,
    'about': renderAbout,
    'bookmarks': renderBookmarks,
    'compare': renderCompare,
    'journal': renderJournal,
    'divinities': renderDivinities,
    'vodun': renderVodun,
    'divinity': renderDivinityDetail,
    'erindinlogun': renderErindinlogun,
    'erindinlogun-detail': renderErindinlogunDetail,
    'glossary': renderGlossary,
    'calendar': renderCalendar,
    'obi-abata': renderObiAbata
};

function getRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const [path, param] = hash.split('/');
    return { path, param };
}

function navigate() {
    try {
        const { path, param } = getRoute();
        const renderer = routes[path] || renderHome;

        const main = document.getElementById('main-content');
        main.innerHTML = ''; // Clear content
        main.appendChild(renderer(param));

        // Update active nav state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${path}`) {
                link.classList.add('active');
            }
        });
    } catch (error) {
        console.error("NAVIGATION ERROR:", error);
        const main = document.getElementById('main-content');
        if (main) {
            main.innerHTML = `<div style="color: red; padding: 20px;">
                <h2>Navigation Error</h2>
                <pre>${error.message}\n${error.stack}</pre>
            </div>`;
        }
    }
}

// View Renderers
function renderHome() {
    const container = document.createElement('div');
    container.className = 'container home-view';

    // Logic for Daily Sign (Seeded by Date)
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const dailyIndex = seed % oduData.length;
    const dailyOdu = oduData[dailyIndex];

    container.innerHTML = `
        <section class="hero">
            <h1>Welcome to Ejiogbe Odu Codex</h1>
            <p class="subtitle">The Dual-Lineage Divination Reference</p>
            
            <div class="search-bar-container">
                <input type="text" id="global-search" placeholder="Search Odu, verses, or keywords..." class="search-input">
            </div>

            <div class="action-buttons" style="margin-bottom: var(--spacing-lg);">
                <button class="btn btn-outline" onclick="window.location.hash='#odu/' + (Math.floor(Math.random() * 256) + 1)">
                    🎲 Random Sign
                </button>
            </div>

            <div class="daily-sign-card">
                <h3>Daily Sign</h3>
                <div class="date-display" style="font-size: 0.9rem; color: var(--color-primary); margin-bottom: var(--spacing-sm); opacity: 0.8;">
                    ${today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <!-- Isese Day Widget -->
                <div class="isese-day-widget" style="margin-bottom: var(--spacing-md); padding: 10px; background: rgba(255,255,255,0.05); border-radius: var(--radius-sm); border-left: 4px solid ${window.IseseCalendar ? window.IseseCalendar.getDay(today).color : '#ccc'};">
                    <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7;">Today's Isese Day</div>
                    <div style="font-size: 1.1rem; font-weight: bold; margin-top: 4px;">
                        ${window.IseseCalendar ? window.IseseCalendar.getDay(today).name : 'Loading...'}
                    </div>
                    <div style="font-size: 0.85rem; margin-top: 4px; opacity: 0.9;">
                        ${window.IseseCalendar ? window.IseseCalendar.getDay(today).deities : ''}
                    </div>
                </div>
                <div class="sign-preview">
                    <div class="sign-name">${dailyOdu.name.yoruba}</div>
                    <div class="odu-mark-mini" style="justify-content: center; margin-top: var(--spacing-xs);">
                        ${renderMarking(dailyOdu.markings.ifa)}
                        ${renderMarking(dailyOdu.markings.ifa_left)}
                    </div>
                </div>
                <button class="btn" onclick="window.location.hash='#odu/${dailyOdu.id}'">Read More</button>
            </div>
        </section>
    `;

    // Attach search listener
    const searchInput = container.querySelector('#global-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.location.hash = `#browse/${encodeURIComponent(searchInput.value)}`;
            }
        });
    }

    return container;
}

function renderBrowse(query) {
    const container = document.createElement('div');
    container.className = 'container browse-view';

    let filteredData = oduData;
    let title = 'Browse Signs';

    if (query) {
        const term = decodeURIComponent(query).toLowerCase();
        title = `Search Results for "${term}"`;
        filteredData = oduData.filter(odu => {
            const inName = odu.name.yoruba.toLowerCase().includes(term) || odu.name.fon.toLowerCase().includes(term);
            const inOverview = odu.overview.toLowerCase().includes(term);
            const inIfa = odu.ifa.summary.toLowerCase().includes(term) ||
                (odu.ifa.orisa && odu.ifa.orisa.some(o => o.toLowerCase().includes(term)));

            // Deep search in Fa/Vodun data
            const fa = odu.fa;
            const inFaSummary = fa.summary && fa.summary.toLowerCase().includes(term);
            const inFaTheme = fa.theme && fa.theme.toLowerCase().includes(term);
            const inVodun = fa.vodun && fa.vodun.some(v => v.toLowerCase().includes(term));
            const inElements = fa.elements && fa.elements.some(e => e.toLowerCase().includes(term));
            const inProhibitions = fa.prohibitions && fa.prohibitions.some(p => p.toLowerCase().includes(term));

            // Check animals (nested object)
            let inAnimals = false;
            if (fa.animals) {
                if (fa.animals.associated && fa.animals.associated.some(a => a.toLowerCase().includes(term))) inAnimals = true;
                if (fa.animals.prohibited && fa.animals.prohibited.some(a => a.toLowerCase().includes(term))) inAnimals = true;
            }

            return inName || inOverview || inIfa || inFaSummary || inFaTheme || inVodun || inElements || inProhibitions || inAnimals;
        });
    }

    const grid = document.createElement('div');
    grid.className = 'odu-grid';

    if (filteredData.length === 0) {
        grid.innerHTML = `<p class="no-results">No signs found matching your search.</p>`;
    } else {
        filteredData.forEach(odu => {
            const card = document.createElement('a');
            card.href = `#odu/${odu.id}`;
            card.className = 'odu-card';
            card.innerHTML = `
                <div class="odu-mark-mini">
                    ${renderMarking(odu.markings.ifa)}
                    ${renderMarking(odu.markings.ifa_left)}
                </div>
                <div class="odu-names">
                    <div class="name-yoruba">${odu.name.yoruba}</div>
                    <div class="name-fon">${odu.name.fon}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    container.innerHTML = `<h2>${title}</h2>`;

    // Add search bar in browse view too
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-bar-container-small';
    searchContainer.innerHTML = `<input type="text" id="browse-search" placeholder="Search..." value="${query ? decodeURIComponent(query) : ''}" class="search-input">`;
    container.insertBefore(searchContainer, container.firstChild);

    const searchInput = searchContainer.querySelector('input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.location.hash = `#browse/${encodeURIComponent(e.target.value)}`;
            }
        });
    }

    container.appendChild(grid);
    return container;
}

function renderOduDetail(id) {
    const odu = oduData.find(o => o.id == id);
    if (!odu) return renderHome();

    const isBookmarked = state.bookmarks.includes(odu.id);

    const container = document.createElement('div');
    container.className = 'container odu-detail-view';

    const noteContent = state.notes[odu.id] || '';

    container.innerHTML = `
        <div class="odu-header">
            <div class="odu-actions">
                <button class="btn-icon share-btn" title="Share Sign">
                    ➦
                </button>
                <button class="btn-icon bookmark-btn ${isBookmarked ? 'active' : ''}" title="${isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}">
                    ${isBookmarked ? '★' : '☆'}
                </button>
            </div>
            <div class="odu-titles">
                <h1>${odu.name.yoruba}</h1>
                <h2 class="subtitle">${odu.name.fon}</h2>
            </div>
            <div class="odu-mark-large">
                ${renderMarking(odu.markings.ifa)}
                ${renderMarking(odu.markings.ifa_left)}
            </div>
        </div>
        
        <p class="odu-overview">${odu.overview}</p>

        <div class="system-tabs">
            <button class="tab-btn active" data-tab="ifa">Ifa (Yoruba)</button>
            <button class="tab-btn" data-tab="fa">Fa (Vodun)</button>
            <button class="tab-btn" data-tab="journal">My Journal</button>
        </div>

        <div class="tab-content active" id="ifa-content">
            <h3>Ifa Perspective</h3>
            <p class="summary-text"><strong>Summary:</strong> ${odu.ifa.summary}</p>
            ${odu.ifa.cultural_context ? `<p class="cultural-context"><strong>Cultural Context:</strong> ${odu.ifa.cultural_context}</p>` : ''}
            
            ${odu.ifa.advice ? `<div class="advice-block alert-box"><strong>Advice:</strong> ${odu.ifa.advice}</div>` : ''}

            ${odu.ifa.ese && odu.ifa.ese.length > 0 ? `
            <div class="section-block">
                <h4>Ese Ifa</h4>
                ${odu.ifa.ese.map((verse, index) => `
                    <div class="verse-card">
                        <p class="verse-yoruba">${(verse.yoruba || '').replace(/\n/g, '<br>')}</p>
                        <p class="verse-english">${(verse.translation || verse.english || '').replace(/\n/g, '<br>')}</p>
                        
                        <details style="margin-top: var(--spacing-md);">
                            <summary>Read Story</summary>
                            <p>${verse.story}</p>
                        </details>
                    </div>
                `).join('')}
            </div>` : ''}



            ${odu.ifa.taboos && odu.ifa.taboos.length > 0 ? `
            <div class="section-block">
                <h4>Taboos (Eewo)</h4>
                <ul class="taboo-list">
                    ${odu.ifa.taboos.map(t => `<li>${t}</li>`).join('')}
                </ul>
            </div>` : ''}

            ${odu.ifa.names && (odu.ifa.names.male.length > 0 || odu.ifa.names.female.length > 0) ? `
            <div class="section-block">
                <h4>Ifa Names</h4>
                <div class="names-grid">
                    ${odu.ifa.names.male.length > 0 ? `
                    <div class="name-col">
                        <h5>Male</h5>
                        <ul>${odu.ifa.names.male.map(n => `<li>${n}</li>`).join('')}</ul>
                    </div>` : ''}
                    ${odu.ifa.names.female.length > 0 ? `
                    <div class="name-col">
                        <h5>Female</h5>
                        <ul>${odu.ifa.names.female.map(n => `<li>${n}</li>`).join('')}</ul>
                    </div>` : ''}
                </div>
            </div>` : ''}

            ${odu.ifa.professions && odu.ifa.professions.length > 0 ? `
            <div class="section-block">
                <h4>Possible Professions</h4>
                <div class="tags-list">
                    ${odu.ifa.professions.map(p => `<span class="tag">${p}</span>`).join('')}
                </div>
            </div>` : ''}
        </div>

        <div class="tab-content" id="fa-content" style="display:none;">
            <h3>Fa Perspective</h3>
            
            <div class="fa-details">
                ${odu.fa.theme ? `<div class="detail-block"><strong>Theme:</strong> <p>${odu.fa.theme}</p></div>` : ''}

                ${odu.fa.spiritual_meaning ? `<div class="detail-block"><strong>Spiritual Meaning:</strong> <p>${odu.fa.spiritual_meaning}</p></div>` : ''}
                ${odu.fa.etymology ? `<div class="detail-block"><strong>Etymology:</strong> <p>${odu.fa.etymology}</p></div>` : ''}
                
                ${odu.fa.spiritual_functions ? `
                <div class="detail-block">
                    <strong>Spiritual Functions:</strong>
                    <ul style="margin-top: 5px; padding-left: 20px;">
                        ${Object.entries(odu.fa.spiritual_functions).map(([key, value]) => `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:</strong> ${value}</li>`).join('')}
                    </ul>
                </div>` : ''}

                ${odu.fa.mirror_function ? `<div class="detail-block"><strong>Mirror Function:</strong> <p>${odu.fa.mirror_function}</p></div>` : ''}
                ${odu.fa.relational_guidance ? `<div class="detail-block"><strong>Relational Guidance:</strong> <p>${odu.fa.relational_guidance}</p></div>` : ''}
                ${odu.fa.ritual_offerings ? `<div class="detail-block"><strong>Ritual Offerings:</strong> <p>${odu.fa.ritual_offerings}</p></div>` : ''}
                
                ${odu.fa.vodun && odu.fa.vodun.length > 0 ? `
                <div class="detail-block">
                    <strong>Associated Vodun:</strong> 
                    <div class="tags-list">
                        ${odu.fa.vodun.map(v => `<a href="#browse/${encodeURIComponent(v)}" class="tag">${v}</a>`).join('')}
                    </div>
                </div>` : ''}

                ${odu.fa.elements && odu.fa.elements.length > 0 ? `
                <div class="detail-block">
                    <strong>Elements:</strong> 
                    <div class="tags-list">
                        ${odu.fa.elements.map(e => `<a href="#browse/${encodeURIComponent(e)}" class="tag">${e}</a>`).join('')}
                    </div>
                </div>` : ''}

                ${odu.fa.animals && (odu.fa.animals.associated.length > 0 || odu.fa.animals.prohibited.length > 0) ? `
                <div class="detail-block">
                    <strong>Animals:</strong> 
                    <div class="tags-list">
                        ${odu.fa.animals.associated.map(a => `<a href="#browse/${encodeURIComponent(a)}" class="tag associated" title="Associated">${a}</a>`).join('')}
                        ${odu.fa.animals.prohibited.map(a => `<a href="#browse/${encodeURIComponent(a)}" class="tag prohibited" title="Prohibited">${a} 🚫</a>`).join('')}
                    </div>
                </div>` : ''}

                ${odu.fa.symbolism ? `<div class="detail-block"><strong>Symbolism:</strong> <p>${odu.fa.symbolism}</p></div>` : ''}
                ${odu.fa.characteristics ? `<div class="detail-block"><strong>Characteristics:</strong> <p>${odu.fa.characteristics}</p></div>` : ''}
                ${odu.fa.gender ? `<div class="detail-block"><strong>Gender:</strong> <p>${odu.fa.gender}</p></div>` : ''}
                ${odu.fa.warning ? `<div class="detail-block"><strong>Warning:</strong> <p>${odu.fa.warning}</p></div>` : ''}
                ${odu.fa.nature ? `<div class="detail-block"><strong>Nature:</strong> <p>${odu.fa.nature}</p></div>` : ''}
                ${odu.fa.history ? `<div class="detail-block"><strong>History:</strong> <p>${odu.fa.history}</p></div>` : ''}
                ${odu.fa.origin ? `<div class="detail-block"><strong>Origin:</strong> <p>${odu.fa.origin}</p></div>` : ''}
                ${odu.fa.lessons ? `<div class="detail-block"><strong>Lessons:</strong> <p>${odu.fa.lessons}</p></div>` : ''}
                ${odu.fa.protection ? `<div class="detail-block"><strong>Protection:</strong> <p>${odu.fa.protection}</p></div>` : ''}
                ${odu.fa.prosperity ? `<div class="detail-block"><strong>Prosperity:</strong> <p>${odu.fa.prosperity}</p></div>` : ''}
                ${odu.fa.rivalry ? `<div class="detail-block"><strong>Rivalry:</strong> <p>${odu.fa.rivalry}</p></div>` : ''}
                ${odu.fa.challenges ? `<div class="detail-block"><strong>Challenges:</strong> <p>${odu.fa.challenges}</p></div>` : ''}
                ${odu.fa.kpoli ? `<div class="detail-block"><strong>Kpoli:</strong> <p>${odu.fa.kpoli}</p></div>` : ''}
            </div>

            ${odu.fa.prohibitions && odu.fa.prohibitions.length > 0 ? `
            <div class="list-block">
                <h4>Prohibitions (Taboos)</h4>
                <ul>
                    ${odu.fa.prohibitions.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <div class="section-block">
                <h4>Fa Stories (Fagleta)</h4>
                ${odu.fa.stories ? odu.fa.stories.map(s => `
                    <div class="verse-card">
                        <p>${s}</p>
                    </div>
                `).join('') : '<p>No stories available yet.</p>'}
            </div>

            ${odu.fa.geomancy ? `
            <div class="section-block">
                <h4>Geomancy Details</h4>
                
                ${odu.fa.geomancy.rank ? `<div class="detail-block"><strong>Rank:</strong> <p>${odu.fa.geomancy.rank}</p></div>` : ''}
                ${odu.fa.geomancy.description ? `<div class="detail-block"><strong>Description:</strong> <p>${odu.fa.geomancy.description}</p></div>` : ''}
                ${odu.fa.geomancy.nature ? `<div class="detail-block"><strong>Nature:</strong> <p>${odu.fa.geomancy.nature}</p></div>` : ''}
                ${odu.fa.geomancy.day ? `<div class="detail-block"><strong>Day:</strong> <p>${odu.fa.geomancy.day}</p></div>` : ''}
                
                ${odu.fa.geomancy.proverbs && odu.fa.geomancy.proverbs.length > 0 ? `
                <div class="verses-container" style="margin-top: var(--spacing-lg);">
                    <h5>Verses (Proverbs)</h5>
                    ${odu.fa.geomancy.proverbs.map(p => `
                        <div class="verse-card">
                            <p class="verse-yoruba" style="font-style: italic; margin-bottom: 8px;">${p.fon}</p>
                            <p class="verse-english" style="font-weight: 500;">${p.english || p.french || ''}</p>
                            ${p.interpretation ? `<p class="verse-interpretation" style="margin-top: 8px; font-size: 0.9em; opacity: 0.9;"><strong>Interpretation:</strong> ${p.interpretation}</p>` : ''}
                        </div>
                    `).join('')}
                </div>` : ''}

                ${odu.fa.geomancy.allegory ? `
                <div class="allegory-block alert-box" style="margin-top: var(--spacing-md);">
                    <h5>${odu.fa.geomancy.allegory.title || 'Allegory'}</h5>
                    <p>${odu.fa.geomancy.allegory.story}</p>
                    ${odu.fa.geomancy.allegory.lesson ? `<p style="margin-top: 10px;"><strong>Lesson:</strong> ${odu.fa.geomancy.allegory.lesson}</p>` : ''}
                </div>` : ''}
                ${odu.fa.geomancy.negative_warning ? `
                <div class="detail-block warning-text" style="color: var(--color-accent); margin-top: var(--spacing-md);">
                    <strong>Negative Warning:</strong> 
                    <p>${odu.fa.geomancy.negative_warning.story}</p>
                    <p><em>${odu.fa.geomancy.negative_warning.lesson}</em></p>
                </div>` : ''}
                
                ${odu.fa.geomancy.spiritual_guidance ? `<div class="detail-block" style="margin-top: var(--spacing-md);"><strong>Spiritual Guidance:</strong> <p>${odu.fa.geomancy.spiritual_guidance}</p></div>` : ''}

                ${odu.fa.geomancy.preferred_colors ? `<div class="detail-block"><strong>Preferred Colors:</strong> <p>${odu.fa.geomancy.preferred_colors}</p></div>` : ''}
                ${odu.fa.geomancy.liturgical_plants ? `<div class="detail-block"><strong>Liturgical Plants:</strong> <p>${Array.isArray(odu.fa.geomancy.liturgical_plants) ? odu.fa.geomancy.liturgical_plants.join(', ') : odu.fa.geomancy.liturgical_plants}</p></div>` : ''}
                ${odu.fa.geomancy.fetiches_divinites ? `<div class="detail-block"><strong>Fetiches/Divinities:</strong> <p>${Array.isArray(odu.fa.geomancy.fetiches_divinites) ? odu.fa.geomancy.fetiches_divinites.join(', ') : odu.fa.geomancy.fetiches_divinites}</p></div>` : ''}
                
                ${odu.fa.geomancy.astrology ? `
                <div class="detail-block">
                    <strong>Astrology:</strong> 
                    <p>Zodiac: ${odu.fa.geomancy.astrology.zodiac_sign} | Planet: ${odu.fa.geomancy.astrology.planet}</p>
                </div>` : ''}

                ${odu.fa.geomancy.physical_portrait ? `<div class="detail-block"><strong>Physical Portrait:</strong> <p>${odu.fa.geomancy.physical_portrait}</p></div>` : ''}
                ${odu.fa.geomancy.moral_characteristics ? `<div class="detail-block"><strong>Moral Characteristics:</strong> <p>${odu.fa.geomancy.moral_characteristics}</p></div>` : ''}
                ${odu.fa.geomancy.intellectual_characteristics ? `<div class="detail-block"><strong>Intellectual Characteristics:</strong> <p>${odu.fa.geomancy.intellectual_characteristics}</p></div>` : ''}
                ${odu.fa.geomancy.professions ? `<div class="detail-block"><strong>Professions:</strong> <p>${odu.fa.geomancy.professions}</p></div>` : ''}
                ${odu.fa.geomancy.physical_health ? `<div class="detail-block"><strong>Physical Health:</strong> <p>${odu.fa.geomancy.physical_health}</p></div>` : ''}
                ${odu.fa.geomancy.illnesses ? `<div class="detail-block"><strong>Illnesses:</strong> <p>${odu.fa.geomancy.illnesses}</p></div>` : ''}
                ${odu.fa.geomancy.sacrifices ? `<div class="detail-block"><strong>Sacrifices:</strong> <p>${odu.fa.geomancy.sacrifices}</p></div>` : ''}
                ${odu.fa.geomancy.commentary ? `<div class="detail-block"><strong>Commentary:</strong> <p>${odu.fa.geomancy.commentary}</p></div>` : ''}
            </div>` : ''}
        </div>

        <div class="tab-content" id="journal-content" style="display:none;">
            <h3>My Journal</h3>
            <p class="subtitle">Record your personal reflections, divinations, or observations for ${odu.name.yoruba}.</p>
            
            <div class="journal-editor">
                <textarea id="journal-text" placeholder="Write your notes here...">${noteContent}</textarea>
                <div class="journal-controls">
                    <button id="save-note-btn" class="btn">Save Note</button>
                    <div class="secondary-controls">
                        <button id="email-note-btn" class="btn btn-outline">Email</button>
                        <button id="print-note-btn" class="btn btn-outline">Print</button>
                    </div>
                </div>
                <div id="save-status" class="save-status"></div>
            </div>
        </div>
    `;

    // Add event listeners for tabs
    const tabs = container.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.tab;
            container.querySelector('#ifa-content').style.display = target === 'ifa' ? 'block' : 'none';
            container.querySelector('#fa-content').style.display = target === 'fa' ? 'block' : 'none';
            container.querySelector('#journal-content').style.display = target === 'journal' ? 'block' : 'none';
        });
    });

    // Journal Logic
    const journalText = container.querySelector('#journal-text');
    const saveBtn = container.querySelector('#save-note-btn');
    const emailBtn = container.querySelector('#email-note-btn');
    const printBtn = container.querySelector('#print-note-btn');
    const saveStatus = container.querySelector('#save-status');

    saveBtn.addEventListener('click', () => {
        state.notes[odu.id] = journalText.value;
        localStorage.setItem('oduverse_notes', JSON.stringify(state.notes));

        saveStatus.textContent = 'Note saved successfully!';
        saveStatus.style.opacity = '1';
        setTimeout(() => {
            saveStatus.style.opacity = '0';
        }, 2000);
    });

    emailBtn.addEventListener('click', () => {
        const subject = `Ejiogbe Odu Codex Note: ${odu.name.yoruba}`;
        const body = `My Notes for ${odu.name.yoruba} / ${odu.name.fon}:\n\n${journalText.value}\n\n--\nSent from Ejiogbe Odu Codex`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });

    const bookmarkBtn = container.querySelector('.bookmark-btn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', () => {
            toggleBookmark(odu.id);
        });
    }

    const shareBtn = container.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: `Ejiogbe Odu Codex: ${odu.name.yoruba} / ${odu.name.fon}`,
                text: odu.overview,
                url: window.location.href
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                }
            } catch (err) {
                console.error('Error sharing:', err);
            }
        });
    }

    return container;
}

function renderBookmarks() {
    const container = document.createElement('div');
    container.className = 'container browse-view';

    const bookmarkedOdu = oduData.filter(odu => state.bookmarks.includes(odu.id));

    const grid = document.createElement('div');
    grid.className = 'odu-grid';

    if (bookmarkedOdu.length === 0) {
        grid.innerHTML = `<p class="no-results">You haven't bookmarked any signs yet.</p>`;
    } else {
        bookmarkedOdu.forEach(odu => {
            const card = document.createElement('a');
            card.href = `#odu/${odu.id}`;
            card.className = 'odu-card';
            card.innerHTML = `
                <div class="odu-mark-mini">
                    ${renderMarking(odu.markings.ifa)}
                    ${renderMarking(odu.markings.ifa_left)}
                </div>
                <div class="odu-names">
                    <div class="name-yoruba">${odu.name.yoruba}</div>
                    <div class="name-fon">${odu.name.fon}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    container.innerHTML = `<h2>My Bookmarks</h2>`;
    container.appendChild(grid);
    return container;
}

function renderJournal() {
    const container = document.createElement('div');
    container.className = 'container browse-view';

    const noteIds = Object.keys(state.notes);
    const notedOdu = oduData.filter(odu => noteIds.includes(odu.id.toString()));

    const grid = document.createElement('div');
    grid.className = 'odu-grid';

    if (notedOdu.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="text-align: center; grid-column: 1/-1;">
                <p>You haven't written any notes yet.</p>
                <p style="font-size: 0.9rem; opacity: 0.7; margin-top: 10px;">Go to any Odu sign and click the "My Journal" tab to start writing.</p>
                <button class="btn" onclick="window.location.hash='#browse'" style="margin-top: 20px;">Browse Signs</button>
            </div>
        `;
    } else {
        notedOdu.forEach(odu => {
            const card = document.createElement('a');
            card.href = `#odu/${odu.id}`;
            card.className = 'odu-card';

            // Get a snippet of the note
            const note = state.notes[odu.id] || '';
            const snippet = note.length > 60 ? note.substring(0, 60) + '...' : note;

            card.innerHTML = `
                <div class="odu-mark-mini">
                    ${renderMarking(odu.markings.ifa)}
                    ${renderMarking(odu.markings.ifa_left)}
                </div>
                <div class="odu-names">
                    <div class="name-yoruba">${odu.name.yoruba}</div>
                    <div class="name-fon">${odu.name.fon}</div>
                </div>
                <div class="note-preview" style="font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-style: italic;">
                    "${snippet}"
                </div>
            `;
            grid.appendChild(card);
        });
    }

    container.innerHTML = `<h2>My Journal</h2>`;
    container.appendChild(grid);
    return container;
}

function renderSettings() {
    const container = document.createElement('div');
    container.className = 'container settings-view';

    container.innerHTML = `
        <h2>Settings</h2>

        <div class="section-block">
            <h3>Appearance</h3>
            <div class="setting-item">
                <label>Text Size</label>
                <div class="text-size-controls">
                    <button class="btn btn-outline ${currentTextSizeIndex === 0 ? 'active' : ''}" data-size="0">Normal</button>
                    <button class="btn btn-outline ${currentTextSizeIndex === 1 ? 'active' : ''}" data-size="1">Large</button>
                    <button class="btn btn-outline ${currentTextSizeIndex === 2 ? 'active' : ''}" data-size="2">X-Large</button>
                </div>
            </div>
        </div>

        <div class="section-block">
            <h3>Data Management</h3>
            <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: var(--spacing-md);">Manage your personal data stored on this device.</p>
            
            <div class="setting-actions">
                <button id="export-notes-btn" class="btn">📥 Export All Notes</button>
                <button id="clear-bookmarks-btn" class="btn btn-outline" style="border-color: #ff3b30; color: #ff3b30;">Clear Bookmarks</button>
                <button id="clear-notes-btn" class="btn btn-outline" style="border-color: #ff3b30; color: #ff3b30;">Clear All Notes</button>
            </div>
        </div>

        <div class="section-block">
            <h3>About Ejiogbe Odu Codex</h3>
            <p>Version 1.0.4 (Offline Capable)</p>
            <p style="font-size: 0.9rem; opacity: 0.7;">Ejiogbe Odu Codex is a dual-lineage reference tool for Ifa and Vodun divination.</p>
            <br>
            <a href="#about" class="btn btn-outline">Read Mission</a>
        </div>
    `;

    // Text Size Logic
    const sizeBtns = container.querySelectorAll('.text-size-controls button');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.size);
            currentTextSizeIndex = index;
            localStorage.setItem('oduverse_text_size_index', currentTextSizeIndex);
            applyTextSize();

            // Update UI
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Export Notes
    const exportBtn = container.querySelector('#export-notes-btn');
    exportBtn.addEventListener('click', () => {
        const notes = state.notes;
        if (Object.keys(notes).length === 0) {
            alert('No notes to export.');
            return;
        }

        let textContent = "MY EJIOGBE ODU CODEX JOURNAL\n===================\n\n";
        for (const [id, note] of Object.entries(notes)) {
            const odu = oduData.find(o => o.id == id);
            if (odu) {
                textContent += `[${odu.name.yoruba} / ${odu.name.fon}]\n`;
                textContent += `${note}\n`;
                textContent += "-------------------\n\n";
            }
        }

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ejiogbe_odu_codex_notes_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Clear Bookmarks
    const clearBookmarksBtn = container.querySelector('#clear-bookmarks-btn');
    clearBookmarksBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to remove all bookmarks? This cannot be undone.')) {
            state.bookmarks = [];
            localStorage.setItem('oduverse_bookmarks', '[]');
            alert('Bookmarks cleared.');
        }
    });

    // Clear Notes
    const clearNotesBtn = container.querySelector('#clear-notes-btn');
    clearNotesBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL your notes? This cannot be undone.')) {
            state.notes = {};
            localStorage.setItem('oduverse_notes', '{}');
            alert('All notes deleted.');
        }
    });

    return container;
}

function renderCompare() {
    const container = document.createElement('div');
    container.className = 'container compare-view';

    // State for comparison
    let signA = null;
    let signB = null;

    const renderSlots = () => {
        const grid = document.createElement('div');
        grid.className = 'compare-slots';

        // Slot A
        const slotA = document.createElement('div');
        slotA.className = `compare-slot ${signA ? 'filled' : 'empty'}`;
        slotA.innerHTML = signA ? renderMiniCard(signA) : `
            <div class="slot-placeholder">
                <span class="plus">+</span>
                <span>Select First Sign</span>
            </div>
        `;
        slotA.addEventListener('click', () => openPicker('A'));

        // Slot B
        const slotB = document.createElement('div');
        slotB.className = `compare-slot ${signB ? 'filled' : 'empty'}`;
        slotB.innerHTML = signB ? renderMiniCard(signB) : `
            <div class="slot-placeholder">
                <span class="plus">+</span>
                <span>Select Second Sign</span>
            </div>
        `;
        slotB.addEventListener('click', () => openPicker('B'));

        grid.appendChild(slotA);
        grid.appendChild(slotB);
        return grid;
    };

    const renderMiniCard = (odu) => {
        return `
            <div class="odu-mark-mini">
                ${renderMarking(odu.markings.ifa)}
                ${renderMarking(odu.markings.ifa_left)}
            </div>
            <div class="odu-names">
                <div class="name-yoruba">${odu.name.yoruba}</div>
                <div class="name-fon">${odu.name.fon}</div>
            </div>
            <button class="btn-remove" title="Remove">×</button>
        `;
    };

    const renderComparisonTable = () => {
        if (!signA || !signB) return '';

        return `
            <div class="comparison-grid">
                <!-- Attributes -->
                <div class="compare-row label">Gender</div>
                <div class="compare-row">${signA.fa.gender || '-'}</div>
                <div class="compare-row">${signB.fa.gender || '-'}</div>

                <div class="compare-row label">Elements</div>
                <div class="compare-row">${signA.fa.elements ? signA.fa.elements.join(', ') : '-'}</div>
                <div class="compare-row">${signB.fa.elements ? signB.fa.elements.join(', ') : '-'}</div>

                <div class="compare-row label">Associated Vodun</div>
                <div class="compare-row">${signA.fa.vodun ? signA.fa.vodun.join(', ') : '-'}</div>
                <div class="compare-row">${signB.fa.vodun ? signB.fa.vodun.join(', ') : '-'}</div>

                <div class="compare-row label">Theme</div>
                <div class="compare-row small-text">${signA.fa.theme || signA.overview}</div>
                <div class="compare-row small-text">${signB.fa.theme || signB.overview}</div>

                <div class="compare-row label">Prohibitions</div>
                <div class="compare-row small-text">
                    ${signA.fa.prohibitions ? `<ul>${signA.fa.prohibitions.map(p => `<li>${p}</li>`).join('')}</ul>` : '-'}
                </div>
                <div class="compare-row small-text">
                    ${signB.fa.prohibitions ? `<ul>${signB.fa.prohibitions.map(p => `<li>${p}</li>`).join('')}</ul>` : '-'}
                </div>
            </div>
        `;
    };

    const updateView = () => {
        container.innerHTML = `
            <h2>Compare Signs</h2>
            <p class="subtitle" style="text-align:center; margin-bottom: var(--spacing-lg);">Select two signs to see them side-by-side.</p>
        `;
        container.appendChild(renderSlots());

        const resultDiv = document.createElement('div');
        resultDiv.id = 'comparison-result';
        resultDiv.innerHTML = renderComparisonTable();
        container.appendChild(resultDiv);
    };

    // Picker Logic
    const openPicker = (targetSlot) => {
        const modal = document.createElement('div');
        modal.className = 'picker-modal';

        const content = document.createElement('div');
        content.className = 'picker-content';

        content.innerHTML = `
            <div class="picker-header">
                <h3>Select Sign</h3>
                <button class="btn-close">×</button>
            </div>
            <input type="text" class="picker-search" placeholder="Search signs...">
            <div class="picker-grid"></div>
        `;

        const grid = content.querySelector('.picker-grid');
        const searchInput = content.querySelector('.picker-search');
        const closeBtn = content.querySelector('.btn-close');

        const renderGrid = (filter = '') => {
            grid.innerHTML = '';
            const term = filter.toLowerCase();
            const filtered = oduData.filter(o =>
                o.name.yoruba.toLowerCase().includes(term) ||
                o.name.fon.toLowerCase().includes(term)
            );

            filtered.forEach(odu => {
                const card = document.createElement('div');
                card.className = 'odu-card picker-card';
                card.innerHTML = renderMiniCard(odu);
                card.querySelector('.btn-remove').remove(); // Remove 'x' button for picker

                card.addEventListener('click', () => {
                    if (targetSlot === 'A') signA = odu;
                    else signB = odu;
                    updateView();
                    document.body.removeChild(modal);
                });
                grid.appendChild(card);
            });
        };

        searchInput.addEventListener('input', (e) => renderGrid(e.target.value));
        closeBtn.addEventListener('click', () => document.body.removeChild(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) document.body.removeChild(modal);
        });

        renderGrid();
        modal.appendChild(content);
        document.body.appendChild(modal);
        searchInput.focus();
    };

    updateView();
    return container;
}

function renderAbout() {
    const container = document.createElement('div');
    container.className = 'container about-view';

    container.innerHTML = `
        <section class="hero">
            <h1>About Ejiogbe Odu Codex</h1>
            <p class="subtitle">The Dual-Lineage Divination Reference</p>
        </section>

        <div class="section-block">
            <h3>Our Mission</h3>
            <p>To preserve, teach, and elevate African spiritual knowledge and its global diasporic traditions. We provide transformative guidance, authentic education, and sacred practices rooted in ancestral wisdom—empowering individuals, healing communities, and restoring spiritual balance in a modern world.</p>
        </div>

        <div class="section-block">
            <h3>Our Vision</h3>
            <p>To become the leading global center for African and diasporic spiritual education—bridging tradition and innovation, inspiring self-discovery, and fostering a future where ancestral wisdom is respected, accessible, and integrated into holistic living across cultures.</p>
        </div>

        <div class="section-block" style="text-align: center; margin-top: var(--spacing-xl);">
            <p>Begin your journey toward healing, enlightenment, and spiritual growth.</p>
            <br>
            <a href="https://ejiogbeinstitute.com" target="_blank" class="btn">Visit Official Website</a>
        </div>
    `;
    return container;
}

function renderDivinities() {
    const container = document.createElement('div');
    container.className = 'container divinities-view';

    container.innerHTML = `
        <h2>Divinities (Orisa)</h2>
        <p class="subtitle" style="text-align:center; margin-bottom: var(--spacing-lg);">Explore the Forces of Nature and Spirit.</p>
        
        <div class="divinities-container">
            ${divinityData.orisa.map(cat => `
                <div class="divinity-category" style="margin-bottom: 30px;">
                    <h3 style="color: var(--color-accent); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px;">${cat.category}</h3>
                    <div class="divinity-list">
                        ${cat.items.map(d => `
                            <div class="divinity-item" onclick="window.location.hash='#divinity/${d.id}'">
                                <div>
                                    <div class="divinity-name">${d.name}</div>
                                    <div class="divinity-title" style="font-size: 0.8rem; opacity: 0.7;">${d.title}</div>
                                </div>
                                <div style="font-size: 1.2rem;">›</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    return container;
}

function renderVodun() {
    const container = document.createElement('div');
    container.className = 'container divinities-view';

    container.innerHTML = `
        <h2>Vodun (Fon/Ewe)</h2>
        <p class="subtitle" style="text-align:center; margin-bottom: var(--spacing-lg);">Explore the Vodun Pantheon.</p>
        
        <div class="divinities-container">
            ${divinityData.vodun.map(cat => `
                <div class="divinity-category" style="margin-bottom: 30px;">
                    <h3 style="color: var(--color-accent); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px;">${cat.category}</h3>
                    <div class="divinity-list">
                        ${cat.items.map(d => `
                            <div class="divinity-item" onclick="window.location.hash='#divinity/${d.id}'">
                                <div>
                                    <div class="divinity-name">${d.name}</div>
                                    <div class="divinity-title" style="font-size: 0.8rem; opacity: 0.7;">${d.title}</div>
                                </div>
                                <div style="font-size: 1.2rem;">›</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    return container;
}

function renderDivinityDetail(id) {
    // Find in Orisa categories
    let divinity = null;
    let category = '';
    let type = 'Orisa';

    // Check Orisa
    for (const cat of divinityData.orisa) {
        const found = cat.items.find(d => d.id === id);
        if (found) {
            divinity = found;
            category = cat.category;
            type = 'Orisa';
            break;
        }
    }

    // Check Vodun if not found
    if (!divinity) {
        for (const cat of divinityData.vodun) {
            const found = cat.items.find(d => d.id === id);
            if (found) {
                divinity = found;
                category = cat.category;
                type = 'Vodun';
                break;
            }
        }
    }

    if (!divinity) return renderDivinities();

    const container = document.createElement('div');
    container.className = 'container divinity-detail-view';

    container.innerHTML = `
        <div class="divinity-detail-header" style="position: relative;">
            <button class="btn-outline" onclick="window.history.back()" style="position: absolute; left: 0; top: 0; padding: 0.5rem 1rem; font-size: 0.8rem;">← Back</button>
            <span class="tag" style="margin-bottom: var(--spacing-sm); display: inline-block; margin-top: var(--spacing-lg);">${category}</span>
            <h1>${divinity.name}</h1>
            <div class="divinity-aka">Also known as: ${(divinity.aka || []).join(', ') || 'N/A'}</div>
            <h2 class="subtitle" style="margin-top: var(--spacing-sm);">${divinity.title}</h2>
        </div>

        <div class="section-block">
            <p class="odu-overview">${divinity.description}</p>
        </div>

        ${divinity.praiseNames && divinity.praiseNames.length > 0 ? `
        <div class="section-block" style="background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: var(--color-accent); margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Praise Names (Oríki)</h3>
            <ul style="list-style-type: none; padding: 0; display: grid; gap: 10px;">
                ${divinity.praiseNames.map(name => {
        const parts = name.split(' - ');
        const title = parts[0];
        const meaning = parts.slice(1).join(' - ');
        return `
                    <li style="line-height: 1.4;">
                        <span style="color: var(--color-primary); font-weight: 600;">${title}</span>
                        ${meaning ? `<span style="opacity: 0.8;"> - ${meaning}</span>` : ''}
                    </li>`;
    }).join('')}
            </ul>
        </div>
        ` : ''}

        ${divinity.verses && divinity.verses.length > 0 ? `
        <div class="section-block" style="margin-bottom: 20px;">
            <h3 style="color: var(--color-accent); margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Verses (Ese)</h3>
            ${divinity.verses.map(verse => `
                <div class="verse-card">
                    <h4>${verse.title || 'Untitled Verse'}</h4>
                    <p class="verse-yoruba">${(verse.yoruba || '').replace(/\n/g, '<br>')}</p>
                    <p class="verse-english">${(verse.english || '').replace(/\n/g, '<br>')}</p>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="attribute-grid">

            <div class="attribute-card">
                <div class="attribute-label">Colors</div>
                <div class="attribute-value">
                    <div class="tags">
                        ${divinity.colors.map(c => `<span class="tag">${c}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="attribute-card">
                <div class="attribute-label">Attributes/Symbols</div>
                <div class="attribute-value">
                    <ul style="list-style-type: none; padding: 0;">
                        ${divinity.attributes.map(a => `<li>• ${a}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="attribute-card">
                <div class="attribute-label">Offerings</div>
                <div class="attribute-value">
                    <ul style="list-style-type: none; padding: 0;">
                        ${divinity.offerings.map(o => `<li>• ${o}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    return container;
}

function renderErindinlogun() {
    const container = document.createElement('div');
    container.className = 'container erindinlogun-view';

    const grid = document.createElement('div');
    grid.className = 'odu-grid';

    erindinlogunData.forEach(odu => {
        const card = document.createElement('div');
        card.className = 'odu-card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.textAlign = 'center';

        const cowriesHtml = renderCowries(odu.cowries.open);

        card.innerHTML = `
            <div class="cowrie-display" style="margin-bottom: 15px;">
                ${cowriesHtml}
            </div>
            <div class="odu-names">
                <div class="name-yoruba" style="font-size: 1.2rem; font-weight: bold;">${odu.order}. ${odu.name.yoruba}</div>
                <div class="name-fon" style="font-size: 0.9rem; opacity: 0.8;">${odu.name.alias}</div>
            </div>
        `;

        // Make card clickable
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            window.location.hash = `#erindinlogun-detail/${odu.id}`;
        });

        grid.appendChild(card);
    });

    container.innerHTML = `
        <div class="hero" style="padding: 2rem 0; text-align: center;">
            <h1>Éérìndínlógún</h1>
            <p class="subtitle">The 16 Cowries Divination System</p>
        </div>
    `;
    container.appendChild(grid);
    return container;
}

function renderErindinlogunDetail(id) {
    const odu = erindinlogunData.find(o => o.id == id);
    if (!odu) return renderErindinlogun();

    const container = document.createElement('div');
    container.className = 'container odu-detail-view';

    const cowriesHtml = renderCowries(odu.cowries.open);

    container.innerHTML = `
        <div class="odu-header">
            <div class="odu-actions">
                <button class="btn-icon share-btn" title="Share Sign">
                    ➦
                </button>
            </div>
            <div class="odu-titles">
                <h1>${odu.order}. ${odu.name.yoruba}</h1>
                <h2 class="subtitle">${odu.name.alias}</h2>
            </div>
            <div class="cowrie-display-large" style="margin: var(--spacing-md) 0;">
                ${cowriesHtml}
            </div>
        </div>
        
        <div class="odu-overview" style="text-align: center; max-width: 800px; margin: 0 auto var(--spacing-lg);">
            <p><strong>Theme:</strong> ${odu.generalTheme}</p>
        </div>

        <div class="tab-content active">
            <div class="section-block">
                <h3>Verses (Ese)</h3>
                ${odu.verses && odu.verses.length > 0 ? odu.verses.map((verse, index) => `
                    <div class="verse-card">
                        <h4>${verse.title || 'Untitled Verse'}</h4>
                        <p class="verse-yoruba">${(verse.yoruba || '').replace(/\n/g, '<br>')}</p>
                        <p class="verse-english">${(verse.english || '').replace(/\n/g, '<br>')}</p>
                    </div>
                `).join('') : '<p>No verses available yet.</p>'}
            </div>

            <div class="section-block">
                <h3>Details</h3>
                <div class="detail-block">
                    <strong>Associated Orisa:</strong> ${odu.associatedOrisa.join(', ')}
                </div>
                <div class="detail-block">
                    <strong>Message:</strong> <p>${odu.message}</p>
                </div>
                <div class="detail-block">
                    <strong>Positive Aspects:</strong> <p>${odu.aspects.positive}</p>
                </div>
                <div class="detail-block">
                    <strong>Negative Aspects:</strong> <p>${odu.aspects.negative}</p>
                </div>
            </div>
        </div>
    `;

    return container;
}

function renderCowries(openCount) {
    // Create a 4x4 grid representation
    // We will just show 'openCount' number of cowrie shells.
    // Since we don't have images, we'll use a styled span or div.
    // A simple representation: Open cowries are bright/filled, Closed are hidden or outlined.

    let html = '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; width: 80px; margin: 0 auto;">';

    for (let i = 0; i < 16; i++) {
        const isOpen = i < openCount;
        // Using a cowrie-like shape or icon. 
        // Let's use a CSS shape.
        const color = isOpen ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)';
        const border = isOpen ? 'none' : '1px solid rgba(255,255,255,0.1)';

        html += `
            <div style="
                width: 12px; 
                height: 16px; 
                background-color: ${color}; 
                border: ${border};
                border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                box-shadow: ${isOpen ? '0 0 5px var(--color-primary-dim)' : 'none'};
            " title="${isOpen ? 'Open' : 'Closed'}"></div>
        `;
    }

    html += '</div>';
    return html;
}

function renderGlossary() {
    const container = document.createElement('div');
    container.className = 'container glossary-view';

    const header = document.createElement('div');
    header.className = 'hero';
    header.style.textAlign = 'center';
    header.innerHTML = `
        <h1>Glossary</h1>
        <p class="subtitle">Terms and Concepts</p>
        <div class="search-bar-container" style="margin-top: 20px;">
            <input type="text" id="glossary-search" placeholder="Search terms..." class="search-input" style="width: 100%; max-width: 500px;">
        </div>
    `;
    container.appendChild(header);

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'glossary-grid';
    resultsContainer.style.display = 'grid';
    resultsContainer.style.gap = '15px';
    resultsContainer.style.marginTop = '30px';

    function renderList(filter = '') {
        resultsContainer.innerHTML = '';
        const lowerFilter = filter.toLowerCase();

        // Limit results for performance if no filter
        const limit = filter ? Infinity : 100;
        let count = 0;

        const filtered = glossaryData.filter(item => {
            if (count >= limit) return false;
            const match = item.term.toLowerCase().includes(lowerFilter) ||
                item.definition.toLowerCase().includes(lowerFilter);
            if (match) count++;
            return match;
        });

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<div style="text-align:center; opacity:0.7;">No terms found.</div>';
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glossary-card';
            card.style.background = 'var(--color-surface)';
            card.style.padding = '15px';
            card.style.borderRadius = '8px';
            card.style.border = '1px solid var(--color-border)';

            card.innerHTML = `
                <div style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--color-primary); margin-bottom: 5px;">${item.term}</div>
                <div style="font-size: 0.95rem; line-height: 1.5; opacity: 0.9;">${item.definition}</div>
            `;
            resultsContainer.appendChild(card);
        });

        if (glossaryData.length > limit && !filter) {
            const more = document.createElement('div');
            more.style.textAlign = 'center';
            more.style.opacity = '0.7';
            more.style.padding = '20px';
            more.innerText = `Showing first ${limit} terms. Type to search...`;
            resultsContainer.appendChild(more);
        }
    }

    renderList();

    container.appendChild(resultsContainer);

    // Attach event listener after a brief delay to ensure DOM insertion
    setTimeout(() => {
        const searchInput = container.querySelector('#glossary-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderList(e.target.value);
            });
            searchInput.focus();
        }
    }, 100);

    return container;
}

// Helper
function renderMarking(marks) {
    // Simple rendering of I and II
    return `<div class="marking-column">
        ${marks.map(m => `<div class="mark-row ${m === 'II' ? 'closed' : 'open'}"></div>`).join('')}
    </div>`;
}

// Text Size Logic
const textSizes = ['100%', '110%', '125%', '140%'];
let currentTextSizeIndex = parseInt(localStorage.getItem('oduverse_text_size_index') || '0');

function applyTextSize() {
    document.documentElement.style.fontSize = textSizes[currentTextSizeIndex];
}

function toggleTextSize() {
    currentTextSizeIndex = (currentTextSizeIndex + 1) % textSizes.length;
    localStorage.setItem('oduverse_text_size_index', currentTextSizeIndex);
    applyTextSize();
}

// Init
window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', () => {
    navigate();
    applyTextSize();

    const textSizeBtn = document.getElementById('text-size-btn');
    if (textSizeBtn) {
        textSizeBtn.addEventListener('click', toggleTextSize);
    }
});

function renderCalendar() {
    const container = document.createElement('div');
    container.className = 'container calendar-view';

    const today = new Date();
    // Use state to track current view month/year, default to today
    if (!state.calendarView) {
        state.calendarView = { month: today.getMonth(), year: today.getFullYear() };
    }

    const { month, year } = state.calendarView;
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    // Generate days
    const days = window.IseseCalendar.generateMonth(year, month);

    // Navigation handlers
    window.prevMonth = () => {
        if (state.calendarView.month === 0) {
            state.calendarView.month = 11;
            state.calendarView.year--;
        } else {
            state.calendarView.month--;
        }
        navigate();
    };

    window.nextMonth = () => {
        if (state.calendarView.month === 11) {
            state.calendarView.month = 0;
            state.calendarView.year++;
        } else {
            state.calendarView.month++;
        }
        navigate();
    };

    // Build Grid HTML
    let gridHtml = '<div class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-top: 20px;">';

    // Weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        gridHtml += `<div class="calendar-header" style="text-align: center; font-weight: bold; padding: 10px; background: rgba(255,255,255,0.05);">${day}</div>`;
    });

    // Empty cells for start of month
    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        gridHtml += '<div class="calendar-cell empty"></div>';
    }

    // Day cells
    days.forEach(dayObj => {
        const isToday = dayObj.date.toDateString() === new Date().toDateString();
        gridHtml += `
            <div class="calendar-cell" style="
                background: rgba(255,255,255,0.05); 
                padding: 10px; 
                min-height: 100px; 
                border-radius: 8px; 
                border-top: 4px solid ${dayObj.isese.color};
                ${isToday ? 'box-shadow: 0 0 0 2px var(--color-accent);' : ''}
            ">
                <div class="date-number" style="font-weight: bold; margin-bottom: 5px;">${dayObj.dayOfMonth}</div>
                <div class="isese-name" style="font-size: 0.8rem; font-weight: 600;">${dayObj.isese.name.split('/')[0]}</div>
                <div class="isese-deities" style="font-size: 0.7rem; opacity: 0.7; margin-top: 4px;">
                    ${dayObj.isese.deities.split(',').slice(0, 2).join(', ')}...
                </div>
            </div>
        `;
    });

    gridHtml += '</div>';

    container.innerHTML = `
        <div class="view-header">
            <h2>Isese Calendar</h2>
            <div class="calendar-controls" style="display: flex; align-items: center; gap: 20px; margin-top: 10px;">
                <button class="btn btn-outline" onclick="window.prevMonth()">← Prev</button>
                <h3 style="margin: 0; min-width: 150px; text-align: center;">${monthName} ${year}</h3>
                <button class="btn btn-outline" onclick="window.nextMonth()">Next →</button>
            </div>
        </div>
        ${gridHtml}
        
        <div class="calendar-legend" style="margin-top: 30px; display: flex; flex-wrap: wrap; gap: 20px;">
            ${window.IseseCalendar.getDeities().map(d => `
                <div class="legend-item" style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 20px; height: 20px; background: ${d.color}; border-radius: 4px;"></div>
                    <span style="font-size: 0.9rem;">${d.name}</span>
                </div>
            `).join('')}
        </div>
    `;

    return container;
}

function renderObiAbata() {
    const container = document.createElement('div');
    container.className = 'container obi-abata-view';

    let gridHtml = '<div class="obi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">';

    window.OBI_DATA.forEach(pos => {
        gridHtml += `
            <div class="obi-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                <div class="obi-image" style="height: 200px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <img src="${pos.image}" alt="${pos.name}" style="width: 100%; height: 100%; object-fit: contain; opacity: 0.9;">
                </div>
                <div class="obi-content" style="padding: 15px;">
                    <h3 style="margin: 0 0 5px 0; color: var(--color-accent);">${pos.name}</h3>
                    <div style="font-weight: bold; font-size: 0.9rem; margin-bottom: 10px; color: #fff;">${pos.meaning}</div>
                    <div style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 10px; font-style: italic;">${pos.description}</div>
                    <div style="font-size: 0.9rem; line-height: 1.4;">${pos.details}</div>
                </div>
            </div>
        `;
    });

    gridHtml += '</div>';

    // Variants Section
    let variantsHtml = '<div class="obi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">';

    if (window.OBI_VARIANTS) {
        window.OBI_VARIANTS.forEach(variant => {
            variantsHtml += `
                <div class="obi-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <div class="obi-image" style="height: 150px; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        <img src="${variant.image}" alt="${variant.name}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;">
                    </div>
                    <div class="obi-content" style="padding: 15px;">
                        <h3 style="margin: 0 0 5px 0; font-size: 1rem; color: var(--color-accent);">${variant.name}</h3>
                        <div style="font-size: 0.85rem; opacity: 0.8; line-height: 1.4;">${variant.description}</div>
                    </div>
                </div>
            `;
        });
    }
    variantsHtml += '</div>';

    container.innerHTML = `
        <div class="view-header">
            <h2>Obi Abata Divination</h2>
            <p style="opacity: 0.8; max-width: 800px;">The 5 basic positions of the 4-lobed Kola Nut, used for communicating with Ori and the Orisa.</p>
        </div>
        
        <h3 style="margin-top: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Divination Positions</h3>
        ${gridHtml}

        <h3 style="margin-top: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Types & Materials</h3>
        ${variantsHtml}

        <div class="section-block" style="margin-top: 40px;">
            <h3 style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Who Can Practice Dida Obì?</h3>
            <ul style="margin-top: 15px; line-height: 1.6;">
                ${window.OBI_WHO_CAN_PRACTICE ? window.OBI_WHO_CAN_PRACTICE.map(item => `<li>${item}</li>`).join('') : '<li>Information loading...</li>'}
            </ul>
        </div>

        <div class="section-block" style="margin-top: 40px;">
            <h3 style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">${window.OBI_PRAYER ? window.OBI_PRAYER.title : 'Opening Prayer'}</h3>
            <p style="font-style: italic; opacity: 0.8; margin-bottom: 15px;">${window.OBI_PRAYER ? window.OBI_PRAYER.instruction : ''}</p>
            
            <div class="prayer-container" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px;">
                ${window.OBI_PRAYER ? window.OBI_PRAYER.yoruba.map((line, index) => `
                    <div class="prayer-line" style="margin-bottom: 10px;">
                        <div class="yoruba" style="font-weight: bold; color: var(--color-primary);">${line}</div>
                        <div class="english" style="opacity: 0.8; font-size: 0.9rem;">${window.OBI_PRAYER.english[index]}</div>
                    </div>
                `).join('') : '<p>Prayer loading...</p>'}
            </div>
        </div>

        <div class="section-block" style="margin-top: 40px;">
            <h3 style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">${window.OROGBO_PRAYER ? window.OROGBO_PRAYER.title : 'Prayer for Orogbo'}</h3>
            <p style="font-style: italic; opacity: 0.8; margin-bottom: 15px;">${window.OROGBO_PRAYER ? window.OROGBO_PRAYER.instruction : ''}</p>
            
            <div class="prayer-container" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px;">
                ${window.OROGBO_PRAYER ? window.OROGBO_PRAYER.yoruba.map((line, index) => `
                    <div class="prayer-line" style="margin-bottom: 10px;">
                        <div class="yoruba" style="font-weight: bold; color: var(--color-primary);">${line}</div>
                        <div class="english" style="opacity: 0.8; font-size: 0.9rem;">${window.OROGBO_PRAYER.english[index] || ''}</div>
                    </div>
                `).join('') : '<p>Prayer loading...</p>'}
            </div>
        </div>

        <div class="section-block" style="margin-top: 40px;">
            <h3 style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Types of Ire (Blessings)</h3>
            <div class="ire-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
                ${window.OBI_IRE ? window.OBI_IRE.map(item => `
                    <div class="ire-card" style="background: rgba(46, 204, 113, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #2ecc71;">
                        <div style="font-weight: bold; color: #2ecc71;">${item.name}</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">${item.meaning}</div>
                    </div>
                `).join('') : '<p>Loading Ire...</p>'}
            </div>
        </div>

        <div class="section-block" style="margin-top: 40px;">
            <h3 style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Types of Ibi (Negativity)</h3>
            <div class="ibi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
                ${window.OBI_IBI ? window.OBI_IBI.map(item => `
                    <div class="ibi-card" style="background: rgba(231, 76, 60, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #e74c3c;">
                        <div style="font-weight: bold; color: #e74c3c;">${item.name}</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">${item.meaning}</div>
                    </div>
                `).join('') : '<p>Loading Ibi...</p>'}
            </div>
        </div>

        <div class="section-block" style="margin-top: 40px;">
            <h3 style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Offerings to Ask</h3>
            <div class="offerings-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">
                ${window.OBI_OFFERINGS ? window.OBI_OFFERINGS.map(item => `
                    <div class="offering-card" style="background: rgba(255, 255, 255, 0.05); padding: 10px 15px; border-radius: 6px; display: flex; flex-direction: column;">
                        <span style="font-weight: bold; color: var(--color-accent);">${item.name}</span>
                        <span style="font-size: 0.85rem; opacity: 0.8;">${item.meaning}</span>
                    </div>
                `).join('') : '<p>Loading Offerings...</p>'}
            </div>
        </div>

        <div class="section-block" style="margin-top: 40px;">
            <h3 style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Oriki (Praise Names)</h3>
            <div class="oriki-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-top: 15px;">
                ${window.OBI_ORIKI_LINKS ? window.OBI_ORIKI_LINKS.map(item => `
                    <a href="#divinity/${item.id}" class="oriki-link-card" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255, 255, 255, 0.05);
                        padding: 20px 10px;
                        border-radius: 8px;
                        text-align: center;
                        text-decoration: none;
                        color: var(--color-text);
                        border: 1px solid rgba(255,255,255,0.1);
                        transition: background 0.2s ease;
                    " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                        <span style="font-weight: bold; color: var(--color-accent); font-size: 1.1rem;">${item.name}</span>
                    </a>
                `).join('') : '<p>Loading Oriki links...</p>'}
            </div>
        </div>

    `;

    return container;
}
