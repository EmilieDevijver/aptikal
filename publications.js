// HAL API configuration
// Récupère uniquement les articles (ART), preprints (PREPUB) et communications de congrès (COMM) avec seulement les champs nécessaires à l'affichage
const HAL_API_URL = 'https://api.archives-ouvertes.fr/search/?q=structId_i:1077274&fq=docType_s:(ART OR UNDEFINED OR COMM)&wt=json&rows=1000&sort=producedDate_tdate desc&fl=docid,en_title_s,title_s,label_s,authFullName_s,journalTitle_s,conferenceTitle_s,producedDateY_i,publicationDateY_i,uri_s,docType_s,comment_s,label_bibtex';
const LOCAL_BACKUP_FILE = 'publications-data.json';
const CACHE_KEY = 'aptikal_publications_cache';
const CACHE_DURATION =  5 * 60 * 1000; // 5 minutes in milliseconds

// Load and display publications
document.addEventListener('DOMContentLoaded', async function() {
    let publications = [];
    let usingLocalData = false;
    let syncError = false;
    
    // Show loading state
    showLoadingState();
    
    // Check cache first
    const cachedData = getFromCache();
    if (cachedData) {
        // Process cached raw docs
        publications = processHALData(cachedData.docs);
        usingLocalData = cachedData.wasLocalData || false;
        syncError = cachedData.hadSyncError || false;
        displayPublications(publications, usingLocalData, syncError);
        return;
    }
    
    try {
        // Try to fetch from HAL API first
        const response = await fetch(HAL_API_URL);
        
        if (!response.ok) {
            throw new Error('HAL API request failed');
        }
        
        const data = await response.json();
        
        if (data.response && data.response.docs) {
            // Save raw docs to cache
            saveToCache(data.response.docs, false, false);
            publications = processHALData(data.response.docs);
        } else {
            throw new Error('Invalid HAL API response format');
        }
        
    } catch (error) {
        console.warn('Failed to fetch from HAL API, falling back to local data:', error);
        syncError = true;
        
        try {
            // Fallback to local backup
            const localResponse = await fetch(LOCAL_BACKUP_FILE);
            
            if (!localResponse.ok) {
                throw new Error('Local backup file not found');
            }
            
            const localData = await localResponse.json();
            
            // Check if local data is in HAL API format
            if (localData.response && localData.response.docs) {
                // Save raw docs to cache
                saveToCache(localData.response.docs, true, true);
                publications = processHALData(localData.response.docs);
            } else {
                throw new Error('Invalid local data format');
            }
            
            usingLocalData = true;
            
        } catch (localError) {
            console.error('Failed to load local backup:', localError);
            displayError();
            return;
        }
    }
    
    // Display publications
    displayPublications(publications, usingLocalData, syncError);
});

// Cache management functions
function saveToCache(docs, wasLocalData, hadSyncError) {
    try {
        const cacheData = {
            docs: docs,
            timestamp: Date.now(),
            wasLocalData: wasLocalData,
            hadSyncError: hadSyncError
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.warn('Failed to save to cache:', error);
    }
}

function getFromCache() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        
        const cacheData = JSON.parse(cached);
        const age = Date.now() - cacheData.timestamp;
        
        // Check if cache is still valid
        if (age > CACHE_DURATION) {
            console.log('Cache expired');
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
        
        return cacheData;
    } catch (error) {
        console.warn('Failed to read from cache:', error);
        return null;
    }
}

// Show loading state
function showLoadingState() {
    const syncStatusElement = document.getElementById('sync-status');
    const countElement = document.getElementById('publications-count');
    
    if (syncStatusElement) {
        syncStatusElement.className = 'sync-status-loading';
        syncStatusElement.innerHTML = `
            <div class="sync-indicator">
                <div class="spinner"></div>
                <span>Loading...</span>
            </div>
        `;
    }
    
    if (countElement) {
        countElement.innerHTML = '<div class="spinner-small"></div>';
    }
}

// Process HAL API data
function processHALData(docs) {
    return docs.map(doc => {
        // Extract title (prefer English title, fallback to other titles)
        const title = doc.en_title_s?.[0] || doc.title_s?.[0] || doc.label_s || '';
        
        // Extract authors
        const authors = doc.authFullName_s || [];
        
        // Extract journal or conference venue
        let venue = '';
        if (doc.docType_s === 'ART') {
            venue = doc.journalTitle_s || '';
        } else if (doc.docType_s === 'COMM') {
            venue = doc.conferenceTitle_s || '';
        }
        
        // Extract year from production date or publication date
        const year = doc.producedDateY_i || doc.publicationDateY_i || extractYear(doc.label_s);
        
        // Extract comment if available
        const comment = doc.comment_s || '';
        
        // Extract BibTeX citation from HAL
        const bibtex = doc.label_bibtex || '';
        
        const result = {
            docid: doc.docid,
            title: title,
            authors: authors,
            venue: venue,
            uri: doc.uri_s || '',
            year: year,
            type: doc.docType_s || '',
            comment: comment,
            bibtex: bibtex
        };
        
        return result;
    });
}

// Extract year from publication label
function extractYear(label) {
    if (!label) return null;
    
    // Try to find a year (4 digits between 1900 and 2099)
    const yearMatch = label.match(/\b(19\d{2}|20\d{2})\b/);
    return yearMatch ? parseInt(yearMatch[1]) : null;
}

// Group publications by year
function groupByYear(publications) {
    const grouped = {};
    
    publications.forEach(pub => {
        const year = pub.year || 'Unknown';
        if (!grouped[year]) {
            grouped[year] = [];
        }
        grouped[year].push(pub);
    });
    
    return grouped;
}

// Display publications grouped by year
function displayPublications(publications, usingLocalData, syncError) {
    const container = document.getElementById('publications-container');
    const countElement = document.getElementById('publications-count');
    const syncStatusElement = document.getElementById('sync-status');
    
    if (!container) {
        console.error('Publications container not found');
        return;
    }
    
    // Update count
    if (countElement) {
        countElement.textContent = publications.length;
    }
    
    // Update sync status
    if (syncStatusElement) {
        if (usingLocalData && syncError) {
            syncStatusElement.className = 'sync-status-warning';
            syncStatusElement.innerHTML = `
                <div class="sync-indicator" title="Connection to HAL could not be established. The publications shown may not reflect the most recent updates.">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                        <path d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"></path>
                    </svg>
                    <span>Sync unavailable</span>
                </div>
            `;
        } else {
            syncStatusElement.className = 'sync-status-success';
            syncStatusElement.innerHTML = `
                <div class="sync-indicator" title="Successfully synchronized with HAL">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
                    </svg>
                    <span>Synced with HAL</span>
                </div>
            `;
        }
    }
    
    if (publications.length === 0) {
        container.innerHTML += '<p class="no-data">No publications found.</p>';
        return;
    }
    
    // Group publications by year
    const groupedPublications = groupByYear(publications);
    
    // Get years and sort in descending order
    const years = Object.keys(groupedPublications)
        .filter(year => year !== 'Unknown')
        .map(year => parseInt(year))
        .sort((a, b) => b - a);
    
    // Add 'Unknown' at the end if exists
    if (groupedPublications['Unknown']) {
        years.push('Unknown');
    }
    
    // Create publication list grouped by year
    years.forEach(year => {
        const yearSection = document.createElement('div');
        yearSection.className = 'publications-year-section';
        
        const yearHeader = document.createElement('div');
        yearHeader.className = 'year-header';
        yearHeader.innerHTML = `
            <h3>${year} <span class="count-badge">${groupedPublications[year].length}</span></h3>
        `;
        yearSection.appendChild(yearHeader);
        
        const publicationsList = document.createElement('div');
        publicationsList.className = 'publications-list';
        
        groupedPublications[year].forEach(pub => {
            const pubItem = document.createElement('div');
            pubItem.className = 'publication-item';
            
            const citation = generateCitation(pub);
            
            pubItem.innerHTML = `
                <div class="publication-content">
                    <div class="publication-title">${pub.title}</div>
                    ${pub.authors && pub.authors.length > 0 ? `
                        <div class="publication-authors">${pub.authors.join(', ')}</div>
                    ` : ''}
                    ${pub.venue ? `
                        <div class="publication-venue">${pub.venue}${pub.year ? `, ${pub.year}` : ''}</div>
                    ` : ''}
                    ${pub.comment ? `
                        <div class="publication-comment">${pub.comment}</div>
                    ` : ''}
                </div>
                <div class="publication-actions">
                    <button class="copy-citation-btn" data-citation="${citation.replace(/"/g, '&quot;')}" title="Copy citation">
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path>
                            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
                        </svg>
                        <span>Copy citation</span>
                    </button>
                    <a href="${pub.uri}" target="_blank" rel="noopener" class="publication-link">
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                            <path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path>
                        </svg>
                        <span>View on HAL</span>
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" class="external-icon">
                            <path d="M3.75 2a.75.75 0 000 1.5h6.69L2.22 11.72a.75.75 0 101.06 1.06l8.22-8.22v6.69a.75.75 0 001.5 0V2.75a.75.75 0 00-.75-.75H3.75z"></path>
                        </svg>
                    </a>
                </div>
            `;
            
            // Add click handler for copy button
            const copyBtn = pubItem.querySelector('.copy-citation-btn');
            copyBtn.addEventListener('click', function() {
                const citationText = this.getAttribute('data-citation');
                copyCitation(citationText, this);
            });
            
            publicationsList.appendChild(pubItem);
        });
        
        yearSection.appendChild(publicationsList);
        container.appendChild(yearSection);
    });
}

// Generate citation in BibTeX format
function generateCitation(pub) {
    // Return the BibTeX from HAL
    return pub.bibtex || '';
}

// Copy citation to clipboard
function copyCitation(citation, button) {
    navigator.clipboard.writeText(citation).then(() => {
        // Visual feedback
        const originalText = button.innerHTML;
        button.innerHTML = `
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
            </svg>
            <span>Copied!</span>
        `;
        
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy citation:', err);
    });
}

// Display error message
function displayError() {
    const container = document.getElementById('publications-container');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-message">
            <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
                <path d="M3.404 12.596a6.5 6.5 0 119.192-9.192 6.5 6.5 0 01-9.192 9.192zM2.344 13.656a8 8 0 1111.313-11.313 8 8 0 01-11.313 11.313zM6.03 4.97a.75.75 0 00-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 101.06 1.06L8 9.06l1.97 1.97a.75.75 0 101.06-1.06L9.06 8l1.97-1.97a.75.75 0 10-1.06-1.06L8 6.94 6.03 4.97z"></path>
            </svg>
            <h3>Publications Temporarily Unavailable</h3>
            <p>We're having trouble loading the publications list at the moment.</p>
            <p>Please try refreshing the page or come back later.</p>
        </div>
    `;
}
