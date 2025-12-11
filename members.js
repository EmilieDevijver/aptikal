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
    // Display mode buttons
    document.getElementById('btn-normal').addEventListener('click', function() {
        displayMode = 'normal';
        localStorage.setItem('memberDisplayMode', 'normal');
        updateActiveButton('display');
        updateDisplay();
    });
    
    document.getElementById('btn-separated').addEventListener('click', function() {
        displayMode = 'separated';
        localStorage.setItem('memberDisplayMode', 'separated');
        updateActiveButton('display');
        updateDisplay();
    });
    
    // Sort mode buttons
    document.getElementById('btn-random').addEventListener('click', function() {
        sortMode = 'random';
        localStorage.setItem('memberSortMode', 'random');
        // Reset random order to generate a new one
        randomOrder = null;
        updateActiveButton('sort');
        updateDisplay();
    });
    
    document.getElementById('btn-alphabetical').addEventListener('click', function() {
        sortMode = 'alphabetical';
        localStorage.setItem('memberSortMode', 'alphabetical');
        updateActiveButton('sort');
        updateDisplay();
    });
}

function updateActiveButton(type) {
    if (type === 'display') {
        document.getElementById('btn-normal').classList.toggle('active', displayMode === 'normal');
        document.getElementById('btn-separated').classList.toggle('active', displayMode === 'separated');
    } else if (type === 'sort') {
        document.getElementById('btn-random').classList.toggle('active', sortMode === 'random');
        document.getElementById('btn-alphabetical').classList.toggle('active', sortMode === 'alphabetical');
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
                ${member.webpage ? `<a href="${member.webpage}" target="_blank" rel="noopener" title="Personal webpage"><span style="display: inline-block; width: 26px; height: 26px; line-height: 26px; text-align: center; font-size: 26px;">🌐</span></a>` : ''}
                ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener" title="GitHub"><svg width="26" height="26" viewBox="0 0 16 16" fill="currentColor" style="display: block;"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg></a>` : ''}
                ${member.gricad ? `<a href="${member.gricad}" target="_blank" rel="noopener" title="GRICAD GitLab"><svg viewBox="90 90 200 200" width="26" height="26" style="display: block;"><path fill="#E24329" d="M282.83,170.73l-.27-.69-26.14-68.22a6.81,6.81,0,0,0-2.69-3.24,7,7,0,0,0-8,.43,7,7,0,0,0-2.32,3.52l-17.65,54H154.29l-17.65-54A6.86,6.86,0,0,0,134.32,99a7,7,0,0,0-8-.43,6.87,6.87,0,0,0-2.69,3.24L97.44,170l-.26.69a48.54,48.54,0,0,0,16.1,56.1l.09.07.24.17,39.82,29.82,19.7,14.91,12,9.06a8.07,8.07,0,0,0,9.76,0l12-9.06,19.7-14.91,40.06-30,.1-.08A48.56,48.56,0,0,0,282.83,170.73Z"/><path fill="#FC6D26" d="M282.83,170.73l-.27-.69a88.3,88.3,0,0,0-35.15,15.8L190,229.25c19.55,14.79,36.57,27.64,36.57,27.64l40.06-30,.1-.08A48.56,48.56,0,0,0,282.83,170.73Z"/><path fill="#FCA326" d="M153.43,256.89l19.7,14.91,12,9.06a8.07,8.07,0,0,0,9.76,0l12-9.06,19.7-14.91S209.55,244,190,229.25C170.45,244,153.43,256.89,153.43,256.89Z"/><path fill="#FC6D26" d="M132.58,185.84A88.19,88.19,0,0,0,97.44,170l-.26.69a48.54,48.54,0,0,0,16.1,56.1l.09.07.24.17,39.82,29.82s17-12.85,36.57-27.64Z"/></svg></a>` : ''}
                ${member.googlescholar ? `<a href="${member.googlescholar}" target="_blank" rel="noopener" title="Google Scholar"><span style="display: inline-block; width: 26px; height: 26px; line-height: 26px; text-align: center; font-size: 26px;">🎓</span></a>` : ''}
                ${member.orcid ? `<a href="${member.orcid}" target="_blank" rel="noopener" title="ORCID"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style="display: block;"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 8.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v6.169H6.647v-6.169zm3.562 0h3.9c1.213 0 2.175.394 2.881 1.175.713.788 1.069 1.869 1.069 3.219 0 1.356-.356 2.431-1.069 3.212-.706.788-1.668 1.181-2.881 1.181h-3.9v-8.787zm1.444 1.272v6.244h2.213c.788 0 1.384-.244 1.787-.731.4-.494.6-1.194.6-2.1 0-.912-.2-1.619-.6-2.119-.403-.5-.999-.75-1.787-.75h-2.213z"/></svg></a>` : ''}
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
