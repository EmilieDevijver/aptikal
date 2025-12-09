// Load and display seminars from JSON file
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('seminars-data.json');
        const events = await response.json();
        
        // Group events by year
        const eventsByYear = {};
        events.forEach(event => {
            if (!eventsByYear[event.year]) {
                eventsByYear[event.year] = { seminars: [], defenses: [] };
            }
            if (event.class === 'defense') {
                eventsByYear[event.year].defenses.push(event);
            } else {
                eventsByYear[event.year].seminars.push(event);
            }
        });
        
        // Sort years in descending order
        const years = Object.keys(eventsByYear).sort((a, b) => b - a);
        
        // Display events for each year
        const container = document.getElementById('seminars-container');
        years.forEach(year => {
            const yearSection = document.createElement('div');
            yearSection.className = 'year-section';
            
            let html = `<h2>${year}</h2>`;
            
            // Defenses section
            const defenses = eventsByYear[year].defenses;
            if (defenses.length > 0) {
                html += '<h3>Defenses</h3><ul class="events-list">';
                defenses.forEach(event => {
                    const defenseType = event.type || 'PhD defense';
                    html += `
                        <li>
                            <span class="event-date">${event.month} ${event.day}:</span>
                            <span class="defense-badge">🎓 ${defenseType}</span>
                            of <strong>${event.presenter}</strong>
                            ${event.title ? `, <em>${event.title}</em>` : ''}
                            ${event.file ? `<a href="${event.file}" target="_blank" class="pdf-link">📄 PDF</a>` : ''}
                        </li>
                    `;
                });
                html += '</ul>';
            }
            
            // Seminars section
            const seminars = eventsByYear[year].seminars;
            if (seminars.length > 0) {
                html += '<h3>Seminars</h3><ul class="events-list">';
                seminars.forEach(event => {
                    html += `
                        <li>
                            <span class="event-date">${event.month} ${event.day}:</span>
                            <strong>${event.presenter}</strong>
                            ${event.title ? `, <em>${event.title}</em>` : ''}
                            ${event.file ? `<a href="${event.file}" target="_blank" class="pdf-link">📄 PDF</a>` : ''}
                        </li>
                    `;
                });
                html += '</ul>';
            }
            
            yearSection.innerHTML = html;
            container.appendChild(yearSection);
        });
        
    } catch (error) {
        console.error('Error loading seminars data:', error);
    }
});
