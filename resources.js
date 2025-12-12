// Load and display resources from JSON file
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('resources-data.json');
        const resources = await response.json();
        
        // Separate resources by class
        const datasets = resources.filter(r => r.class === 'dataset');
        const code = resources.filter(r => r.class === 'code');
        
        const container = document.getElementById('resources-container');
        
        // Helper function to detect platform and create badge
        function getPlatformBadge(link) {
            if (link.includes('github.com')) {
                return '<span class="platform-badge github-badge"><svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>GitHub</span>';
            } else if (link.includes('gitlab')) {
                return '<span class="platform-badge gitlab-badge"><svg width="18" height="18" viewBox="0 0 50 48" fill="none" style="vertical-align: text-bottom;"><path d="m49.014 19-.067-.18-6.784-17.696a1.792 1.792 0 0 0-3.389.182l-4.579 14.02H15.651l-4.58-14.02a1.795 1.795 0 0 0-3.388-.182l-6.78 17.7-.071.175A12.595 12.595 0 0 0 5.01 33.556l.026.02.057.044 10.32 7.734 5.12 3.87 3.11 2.351a2.102 2.102 0 0 0 2.535 0l3.11-2.352 5.12-3.869 10.394-7.779.029-.022a12.595 12.595 0 0 0 4.182-14.554Z" fill="#E24329"/><path d="m49.014 19-.067-.18a22.88 22.88 0 0 0-9.12 4.103L24.931 34.187l9.485 7.167 10.393-7.779.03-.022a12.595 12.595 0 0 0 4.175-14.554Z" fill="#FC6D26"/><path d="m15.414 41.354 5.12 3.87 3.11 2.351a2.102 2.102 0 0 0 2.535 0l3.11-2.352 5.12-3.869-9.484-7.167-9.51 7.167Z" fill="#FCA326"/><path d="M10.019 22.923a22.86 22.86 0 0 0-9.117-4.1L.832 19A12.595 12.595 0 0 0 5.01 33.556l.026.02.057.044 10.32 7.734 9.491-7.167L10.02 22.923Z" fill="#FC6D26"/></svg>GitLab</span>';
            }
            return '<span class="platform-badge link-badge"><svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path></svg>Link</span>';
        }
        
        // Helper function to create resource card
        function createResourceCard(resource) {
            const platformBadge = getPlatformBadge(resource.link);
            const hasReference = resource.reference && resource.reference.trim() !== '';
            
            return `
                <div class="resource-item">
                    <div class="resource-header">
                        <h4 class="resource-title">${resource.title}</h4>
                        ${resource.developer ? `<p class="resource-developer"><svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" style="margin-right: 4px; vertical-align: text-top;"><path d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z"></path></svg>${resource.developer}</p>` : ''}
                    </div>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-footer">
                        <a href="${resource.link}" target="_blank" rel="noopener" class="resource-link">
                            ${platformBadge}
                        </a>
                        ${hasReference ? `<a href="${resource.reference}" target="_blank" rel="noopener" class="resource-reference-link"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M4 1.75C4 .784 4.784 0 5.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v8.586A1.75 1.75 0 0114.25 15h-9a.75.75 0 010-1.5h9a.25.25 0 00.25-.25V4.664a.25.25 0 00-.073-.177l-2.914-2.914a.25.25 0 00-.177-.073H5.75a.25.25 0 00-.25.25v3.5a.75.75 0 01-1.5 0v-3.5z"></path><path d="M1.5 9V5.75a.75.75 0 011.5 0V9h3.25a.75.75 0 010 1.5H3v3.25a.75.75 0 01-1.5 0V10.5H.25a.75.75 0 010-1.5H1.5z"></path></svg>Reference</a>` : ''}
                    </div>
                </div>
            `;
        }
        
        // Display Datasets
        if (datasets.length > 0) {
            const datasetsSection = document.createElement('div');
            datasetsSection.className = 'resources-section';
            datasetsSection.innerHTML = `
                <div class="section-header">
                    <h3><svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0114.25 16H1.75A1.75 1.75 0 010 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V1.75a.25.25 0 00-.25-.25H1.75zM3.5 5.75a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zm0 3a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zm0 3a.75.75 0 000 1.5h5a.75.75 0 000-1.5h-5z"></path></svg>Datasets <span class="count-badge">${datasets.length}</span></h3>
                </div>
                <div class="resources-grid"></div>
            `;
            
            const datasetsGrid = datasetsSection.querySelector('.resources-grid');
            datasets.forEach(resource => {
                datasetsGrid.innerHTML += createResourceCard(resource);
            });
            
            container.appendChild(datasetsSection);
        }
        
        // Display Code
        if (code.length > 0) {
            const codeSection = document.createElement('div');
            codeSection.className = 'resources-section';
            codeSection.innerHTML = `
                <div class="section-header">
                    <h3><svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor"><path d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06l-4.25-4.25z"></path></svg>Code <span class="count-badge">${code.length}</span></h3>
                </div>
                <div class="resources-grid"></div>
            `;
            
            const codeGrid = codeSection.querySelector('.resources-grid');
            code.forEach(resource => {
                codeGrid.innerHTML += createResourceCard(resource);
            });
            
            container.appendChild(codeSection);
        }
        
    } catch (error) {
        console.error('Error loading resources data:', error);
    }
});
