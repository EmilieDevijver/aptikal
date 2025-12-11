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
        
        // Helper function to convert month name to number for sorting
        const monthToNumber = (month) => {
            const months = {
                'Jan.': 1, 'January': 1,
                'Feb.': 2, 'February': 2,
                'Mar.': 3, 'March': 3,
                'Apr.': 4, 'April': 4,
                'May': 5,
                'Jun.': 6, 'June': 6,
                'Jul.': 7, 'July': 7,
                'Aug.': 8, 'August': 8,
                'Sep.': 9, 'September': 9,
                'Oct.': 10, 'October': 10,
                'Nov.': 11, 'November': 11,
                'Dec.': 12, 'December': 12
            };
            return months[month] || 0;
        };
        
        // Sort events within each year by date (most recent first)
        const sortEventsByDate = (a, b) => {
            const monthDiff = monthToNumber(b.month) - monthToNumber(a.month);
            if (monthDiff !== 0) return monthDiff;
            return parseInt(b.day) - parseInt(a.day);
        };
        
        years.forEach(year => {
            eventsByYear[year].defenses.sort(sortEventsByDate);
            eventsByYear[year].seminars.sort(sortEventsByDate);
        });
        
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
                    const title = event.title && !event.title.endsWith('.') ? event.title + '.' : event.title;
                    html += `
                        <li>
                            <span class="event-date">${event.month} ${event.day}:</span>
                            <span class="defense-badge">🎓 ${defenseType}</span>of <strong>${event.presenter}</strong>${title ? `: <em>${title}</em>` : ''}${event.file ? ` <a href="${event.file}" target="_blank" class="pdf-link">📄 PDF</a>` : ''}
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
                    const title = event.title && !event.title.endsWith('.') ? event.title + '.' : event.title;
                    html += `
                        <li>
                            <span class="event-date">${event.month} ${event.day}:</span>
                            <strong>${event.presenter}</strong>${title ? `: <em>${title}</em>` : ''}${event.file ? ` <a href="${event.file}" target="_blank" class="pdf-link">📄 PDF</a>` : ''}
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
