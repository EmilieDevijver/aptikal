// Load and display members from JSON file
let allMembers = [];
let displayMode = localStorage.getItem('memberDisplayMode') || 'normal'; // 'normal' or 'separated'
let sortMode = localStorage.getItem('memberSortMode') || 'random'; // 'random' or 'alphabetical'
let randomOrder = null; // Single random order for all members

document.addEventListener('DOMContentLoaded', async function() {
    // Restore active button states immediately
    updateActiveButton('display');
    updateActiveButton('sort');
    
    try {
        const response = await fetch('members-data.json');
        allMembers = await response.json();
        
        // Setup control buttons
        setupControls();
        
        // Display past members once (they don't change)
        const past = allMembers.filter(m => m.status === 'past');
        displayPastMembers(past.sort(sortByLastName));
        
        // Initial display of active members
        updateDisplay();
        
    } catch (error) {
        console.error('Error loading members data:', error);
    }
});

function setupControls() {
    // Gestion des boutons de contrôle
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            const value = this.dataset.value;
            
            if (type === 'display') {
                displayMode = value;
                localStorage.setItem('memberDisplayMode', value);
            } else if (type === 'sort') {
                sortMode = value;
                localStorage.setItem('memberSortMode', value);
                if (value === 'random') randomOrder = null;
            }
            
            updateActiveButton(type);
            updateToggleDisplay(type);
            updateDisplay();
            
            // Fermer le toggle sur mobile après sélection
            if (window.innerWidth <= 480) {
                const group = this.closest('.control-group');
                group.classList.remove('open');
            }
        });
    });
    
    // Gestion des toggles pour mobile
    document.querySelectorAll('.control-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            if (window.innerWidth <= 480) {
                const group = this.closest('.control-group');
                const wasOpen = group.classList.contains('open');
                
                // Fermer tous les autres groupes
                document.querySelectorAll('.control-group').forEach(g => g.classList.remove('open'));
                
                // Toggle le groupe actuel
                if (!wasOpen) {
                    group.classList.add('open');
                }
            }
        });
    });
    
    // Initialiser l'affichage des toggles
    updateToggleDisplay('display');
    updateToggleDisplay('sort');
}

function updateActiveButton(type) {
    const mode = type === 'display' ? displayMode : sortMode;
    document.querySelectorAll(`.control-btn[data-type="${type}"]`).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === mode);
    });
}

function updateToggleDisplay(type) {
    const mode = type === 'display' ? displayMode : sortMode;
    const toggle = document.querySelector(`.control-toggle[data-type="${type}"]`);
    if (!toggle) return;
    
    const valueSpan = toggle.querySelector('.toggle-value');
    const activeBtn = document.querySelector(`.control-btn[data-type="${type}"][data-value="${mode}"]`);
    
    if (activeBtn && valueSpan) {
        valueSpan.textContent = activeBtn.textContent;
    }
}

function updateDisplay() {
    // Separate members by status
    const permanent = allMembers.filter(m => m.status === 'permanent');
    const nonPermanent = allMembers.filter(m => m.status === 'non_permanent');
    
    // Generate or use saved random order (applies to all members)
    if (sortMode === 'random' && !randomOrder) {
        const allActive = [...permanent, ...nonPermanent];
        randomOrder = shuffleArray([...allActive]);
    }
    
    if (displayMode === 'normal') {
        // Normal mode: all members together
        const activeMembers = [...permanent, ...nonPermanent];
        let sortedMembers;
        if (sortMode === 'alphabetical') {
            sortedMembers = [...activeMembers].sort(sortByLastName);
        } else {
            sortedMembers = randomOrder;
        }
        
        // Show normal mode container, hide separated mode containers
        document.getElementById('all-members-section').style.display = 'block';
        document.getElementById('permanent-section').style.display = 'none';
        document.getElementById('non-permanent-section').style.display = 'none';
        
        // Update main title with count
        document.getElementById('main-title').innerHTML = `Our Members <span class="member-count">(${sortedMembers.length})</span>`;
        
        // Clear and display
        const container = document.getElementById('all-members');
        container.innerHTML = '';
        sortedMembers.forEach(member => {
            container.appendChild(createMemberCard(member));
        });
    } else {
        // Separated mode: permanent and non-permanent separate
        let sortedPermanent, sortedNonPermanent;
        if (sortMode === 'alphabetical') {
            sortedPermanent = [...permanent].sort(sortByLastName);
            sortedNonPermanent = [...nonPermanent].sort(sortByLastName);
        } else {
            // Use the global random order and filter by status
            sortedPermanent = randomOrder.filter(m => m.status === 'permanent');
            sortedNonPermanent = randomOrder.filter(m => m.status === 'non_permanent');
        }
        
        // Show separated mode containers, hide normal mode container
        document.getElementById('all-members-section').style.display = 'none';
        document.getElementById('permanent-section').style.display = 'block';
        document.getElementById('non-permanent-section').style.display = 'block';
        
        // Update main title with total count
        const total = sortedPermanent.length + sortedNonPermanent.length;
        document.getElementById('main-title').innerHTML = `Our Members <span class="member-count">(${total})</span>`;
        
        // Update section titles with counts
        document.querySelector('#permanent-section h3').textContent = `Permanent Members (${sortedPermanent.length})`;
        document.querySelector('#non-permanent-section h3').textContent = `Non-Permanent Members (${sortedNonPermanent.length})`;
        
        // Clear and display permanent
        const permanentContainer = document.getElementById('permanent-members');
        permanentContainer.innerHTML = '';
        sortedPermanent.forEach(member => {
            permanentContainer.appendChild(createMemberCard(member));
        });
        
        // Clear and display non-permanent
        const nonPermanentContainer = document.getElementById('non-permanent-members');
        nonPermanentContainer.innerHTML = '';
        sortedNonPermanent.forEach(member => {
            nonPermanentContainer.appendChild(createMemberCard(member));
        });
    }
}

// Sort by last name
function sortByLastName(a, b) {
    return a.last_name.localeCompare(b.last_name);
}

// Shuffle array in place (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Unified function to create member cards
function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    
    const fullName = [member.first_name, member.middle_names, member.last_name].filter(n => n).join(' ');
    
    // Check if member has external affiliation
    const isExternalLab = member.lab && member.lab !== 'LIG';
    const isExternalTeam = member.team && member.team !== 'APTIKAL';
    
    let affiliationBadge = '';
    if (isExternalTeam) {
        affiliationBadge = `<span class="affiliation-badge" title="${member.lab}${member.team ? ' - ' + member.team : ''}">${member.team}</span>`;
    } else if (isExternalLab && !member.team) {
        affiliationBadge = `<span class="affiliation-badge" title="${member.lab}">${member.lab}</span>`;
    }
    
    card.innerHTML = `
        ${affiliationBadge}
        <div class="member-photo">
            <img src="${member.photo}" alt="${fullName}">
        </div>
        <div class="member-info">
            <h4 class="member-name">${fullName}</h4>
            <p class="member-position">${member.position}</p>
            <div class="member-links">
                ${member.webpage ? `<a href="${member.webpage}" target="_blank" rel="noopener" title="Personal webpage"><svg width="26" height="26" viewBox="0 0 16 16" fill="currentColor" style="display: block;"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/></svg></a>` : ''}
                ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener" title="GitHub"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style="display: block;"><path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z"/></svg></a>` : ''}
                ${member.gricad ? `<a href="${member.gricad}" target="_blank" rel="noopener" title="GRICAD GitLab"><svg width="26" height="26" viewBox="0 0 48 48" fill="none" style="display: block;"><path d="m49.014 19-.067-.18-6.784-17.696a1.792 1.792 0 0 0-3.389.182l-4.579 14.02H15.651l-4.58-14.02a1.795 1.795 0 0 0-3.388-.182l-6.78 17.7-.071.175A12.595 12.595 0 0 0 5.01 33.556l.026.02.057.044 10.32 7.734 5.12 3.87 3.11 2.351a2.102 2.102 0 0 0 2.535 0l3.11-2.352 5.12-3.869 10.394-7.779.029-.022a12.595 12.595 0 0 0 4.182-14.554Z" fill="#E24329"/><path d="m49.014 19-.067-.18a22.88 22.88 0 0 0-9.12 4.103L24.931 34.187l9.485 7.167 10.393-7.779.03-.022a12.595 12.595 0 0 0 4.175-14.554Z" fill="#FC6D26"/><path d="m15.414 41.354 5.12 3.87 3.11 2.351a2.102 2.102 0 0 0 2.535 0l3.11-2.352 5.12-3.869-9.484-7.167-9.51 7.167Z" fill="#FCA326"/><path d="M10.019 22.923a22.86 22.86 0 0 0-9.117-4.1L.832 19A12.595 12.595 0 0 0 5.01 33.556l.026.02.057.044 10.32 7.734 9.491-7.167L10.02 22.923Z" fill="#FC6D26"/></svg></a>` : ''}
                ${member.googlescholar ? `<a href="${member.googlescholar}" target="_blank" rel="noopener" title="Google Scholar"><svg width="26" height="26" viewBox="0 0 16 16" fill="currentColor" style="display: block;"><path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/><path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/></svg></a>` : ''}
                ${member.orcid ? `<a href="${member.orcid}" target="_blank" rel="noopener" title="ORCID"><svg width="26" height="26" viewBox="0 0 72 72" style="display: block;"><path d="M72,36 C72,55.884375 55.884375,72 36,72 C16.115625,72 0,55.884375 0,36 C0,16.115625 16.115625,0 36,0 C55.884375,0 72,16.115625 72,36 Z" fill="#A6CE39"/><g transform="translate(18.868966, 12.910345)" fill="#FFFFFF"><polygon points="5.03734929 39.1250878 0.695429861 39.1250878 0.695429861 9.14431787 5.03734929 9.14431787 5.03734929 22.6930505 5.03734929 39.1250878"/><path d="M11.409257,9.14431787 L23.1380784,9.14431787 C34.303014,9.14431787 39.2088191,17.0664074 39.2088191,24.1486995 C39.2088191,31.846843 33.1470485,39.1530811 23.1944669,39.1530811 L11.409257,39.1530811 L11.409257,9.14431787 Z M15.7511765,35.2620194 L22.6587756,35.2620194 C32.49858,35.2620194 34.7541226,27.8438084 34.7541226,24.1486995 C34.7541226,18.1301509 30.8915059,13.0353795 22.4332213,13.0353795 L15.7511765,13.0353795 L15.7511765,35.2620194 Z"/><path d="M5.71401206,2.90182329 C5.71401206,4.441452 4.44526937,5.72914146 2.86638958,5.72914146 C1.28750978,5.72914146 0.0187670918,4.441452 0.0187670918,2.90182329 C0.0187670918,1.33420133 1.28750978,0.0745051096 2.86638958,0.0745051096 C4.44526937,0.0745051096 5.71401206,1.36219458 5.71401206,2.90182329 Z"/></g></svg></a>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

function displayPastMembers(members) {
    const container = document.getElementById('past-members');
    
    if (members.length === 0) {
        container.parentElement.style.display = 'none';
        return;
    }
    
    members.forEach(member => {
        const card = document.createElement('div');
        card.className = 'member-card-past';
        
        const fullName = [member.first_name, member.middle_names, member.last_name].filter(n => n).join(' ');
        
        card.innerHTML = `
            <span class="member-name">${fullName}</span>
            ${member.webpage ? `<a href="${member.webpage}" target="_blank" rel="noopener" title="Personal webpage">🌐</a>` : ''}
            <span class="member-separator">•</span>
        `;
        
        container.appendChild(card);
    });
}
