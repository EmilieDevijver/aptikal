// Load and display members from JSON file
let allMembers = [];
let displayMode = 'normal'; // 'normal' or 'separated'
let sortMode = 'random'; // 'random' or 'alphabetical'

document.addEventListener('DOMContentLoaded', async function() {
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
        updateActiveButton('display');
        updateDisplay();
    });
    
    document.getElementById('btn-separated').addEventListener('click', function() {
        displayMode = 'separated';
        updateActiveButton('display');
        updateDisplay();
    });
    
    // Sort mode buttons
    document.getElementById('btn-random').addEventListener('click', function() {
        sortMode = 'random';
        updateActiveButton('sort');
        updateDisplay();
    });
    
    document.getElementById('btn-alphabetical').addEventListener('click', function() {
        sortMode = 'alphabetical';
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
    
    if (displayMode === 'normal') {
        // Normal mode: all members together
        const activeMembers = [...permanent, ...nonPermanent];
        const sortedMembers = sortMode === 'alphabetical' 
            ? activeMembers.sort(sortByLastName) 
            : shuffleArray(activeMembers);
        
        // Show normal mode container, hide separated mode containers
        document.getElementById('all-members-section').style.display = 'block';
        document.getElementById('permanent-section').style.display = 'none';
        document.getElementById('non-permanent-section').style.display = 'none';
        
        // Update main title with count
        document.getElementById('main-title').innerHTML = `Our Members <span style="font-weight: 400; color: #7f8c8d; font-size: 0.7em;">(${sortedMembers.length})</span>`;
        
        // Clear and display
        const container = document.getElementById('all-members');
        container.innerHTML = '';
        sortedMembers.forEach(member => {
            container.appendChild(createMemberCard(member));
        });
    } else {
        // Separated mode: permanent and non-permanent separate
        const sortedPermanent = sortMode === 'alphabetical' 
            ? permanent.sort(sortByLastName) 
            : shuffleArray(permanent);
        const sortedNonPermanent = sortMode === 'alphabetical' 
            ? nonPermanent.sort(sortByLastName) 
            : shuffleArray(nonPermanent);
        
        // Show separated mode containers, hide normal mode container
        document.getElementById('all-members-section').style.display = 'none';
        document.getElementById('permanent-section').style.display = 'block';
        document.getElementById('non-permanent-section').style.display = 'block';
        
        // Update main title with total count
        const total = sortedPermanent.length + sortedNonPermanent.length;
        document.getElementById('main-title').innerHTML = `Our Members <span style="font-weight: 400; color: #7f8c8d; font-size: 0.7em;">(${total})</span>`;
        
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
    
    card.innerHTML = `
        <div class="member-photo">
            <img src="${member.photo}" alt="${fullName}">
        </div>
        <div class="member-info">
            <h4 class="member-name">${fullName}</h4>
            <p class="member-position">${member.position}</p>
            <p class="member-affiliation">${member.lab} - ${member.team}</p>
            <div class="member-links">
                ${member.webpage ? `<a href="${member.webpage}" target="_blank" rel="noopener" title="Personal webpage">🌐</a>` : ''}
                ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener" title="GitHub"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg></a>` : ''}
                ${member.gricad ? `<a href="${member.gricad}" target="_blank" rel="noopener" title="GRICAD GitLab"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.184.387-.317.605-.406V8.835c-.217-.09-.424-.222-.605-.406-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"/></svg></a>` : ''}
                ${member.googlescholar ? `<a href="${member.googlescholar}" target="_blank" rel="noopener" title="Google Scholar">🎓</a>` : ''}
                ${member.orcid ? `<a href="${member.orcid}" target="_blank" rel="noopener" title="ORCID"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 8.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v6.169H6.647v-6.169zm3.562 0h3.9c1.213 0 2.175.394 2.881 1.175.713.788 1.069 1.869 1.069 3.219 0 1.356-.356 2.431-1.069 3.212-.706.788-1.668 1.181-2.881 1.181h-3.9v-8.787zm1.444 1.272v6.244h2.213c.788 0 1.384-.244 1.787-.731.4-.494.6-1.194.6-2.1 0-.912-.2-1.619-.6-2.119-.403-.5-.999-.75-1.787-.75h-2.213z"/></svg></a>` : ''}
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
