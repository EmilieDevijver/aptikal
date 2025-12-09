// Load and display members from JSON file
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('members-data.json');
        const members = await response.json();
        
        // Separate members by status
        const permanent = members.filter(m => m.status === 'permanent');
        const nonPermanent = members.filter(m => m.status === 'non_permanent');
        const past = members.filter(m => m.status === 'past');
        
        // Sort members alphabetically by last name
        const sortByLastName = (a, b) => {
            return a.last_name.localeCompare(b.last_name);
        };
        
        permanent.sort(sortByLastName);
        nonPermanent.sort(sortByLastName);
        past.sort(sortByLastName);
        
        // Display each category
        displayPermanentMembers(permanent);
        displayNonPermanentMembers(nonPermanent);
        displayPastMembers(past);
        
    } catch (error) {
        console.error('Error loading members data:', error);
    }
});

function displayPermanentMembers(members) {
    const container = document.getElementById('permanent-members');
    
    members.forEach(member => {
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
        
        container.appendChild(card);
    });
}

function displayNonPermanentMembers(members) {
    const container = document.getElementById('non-permanent-members');
    
    members.forEach(member => {
        const card = document.createElement('div');
        card.className = 'member-card-compact';
        
        const fullName = [member.first_name, member.middle_names, member.last_name].filter(n => n).join(' ');
        
        card.innerHTML = `
            <div class="member-compact-info">
                <h4 class="member-name">${fullName}</h4>
                <p class="member-position">${member.position}</p>
                <p class="member-affiliation-small">${member.lab} - ${member.team}</p>
            </div>
            <div class="member-links-compact">
                ${member.webpage ? `<a href="${member.webpage}" target="_blank" rel="noopener" title="Personal webpage">🌐</a>` : ''}
                ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener" title="GitHub"><svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg></a>` : ''}
                ${member.gricad ? `<a href="${member.gricad}" target="_blank" rel="noopener" title="GRICAD GitLab"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.184.387-.317.605-.406V8.835c-.217-.09-.424-.222-.605-.406-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"/></svg></a>` : ''}
                ${member.googlescholar ? `<a href="${member.googlescholar}" target="_blank" rel="noopener" title="Google Scholar">🎓</a>` : ''}
                ${member.orcid ? `<a href="${member.orcid}" target="_blank" rel="noopener" title="ORCID"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 8.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v6.169H6.647v-6.169zm3.562 0h3.9c1.213 0 2.175.394 2.881 1.175.713.788 1.069 1.869 1.069 3.219 0 1.356-.356 2.431-1.069 3.212-.706.788-1.668 1.181-2.881 1.181h-3.9v-8.787zm1.444 1.272v6.244h2.213c.788 0 1.384-.244 1.787-.731.4-.494.6-1.194.6-2.1 0-.912-.2-1.619-.6-2.119-.403-.5-.999-.75-1.787-.75h-2.213z"/></svg></a>` : ''}
            </div>
        `;
        
        container.appendChild(card);
    });
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
