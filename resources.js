// Load and display resources from JSON file
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('resources-data.json');
        const resources = await response.json();
        
        // Separate resources by class
        const datasets = resources.filter(r => r.class === 'dataset');
        const code = resources.filter(r => r.class === 'code');
        
        const container = document.getElementById('resources-container');
        
        // Display Datasets
        if (datasets.length > 0) {
            const datasetsSection = document.createElement('div');
            datasetsSection.className = 'resources-section';
            datasetsSection.innerHTML = '<h3>Datasets</h3><ul class="resources-list"></ul>';
            
            const datasetsList = datasetsSection.querySelector('.resources-list');
            datasets.forEach(resource => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="resource-item">
                        <a href="${resource.link}" target="_blank" rel="noopener" class="resource-title">${resource.title}</a>
                        <p class="resource-description">${resource.description}</p>
                        <p class="resource-developer">${resource.developer}</p>
                        ${resource.reference ? `<p class="resource-reference"><a href="${resource.reference}" target="_blank" rel="noopener">📄 Reference</a></p>` : ''}
                    </div>
                `;
                datasetsList.appendChild(li);
            });
            
            container.appendChild(datasetsSection);
        }
        
        // Display Code
        if (code.length > 0) {
            const codeSection = document.createElement('div');
            codeSection.className = 'resources-section';
            codeSection.innerHTML = '<h3>Code</h3><ul class="resources-list"></ul>';
            
            const codeList = codeSection.querySelector('.resources-list');
            code.forEach(resource => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="resource-item">
                        <a href="${resource.link}" target="_blank" rel="noopener" class="resource-title">${resource.title}</a>
                        <p class="resource-description">${resource.description}</p>
                        <p class="resource-developer">${resource.developer}</p>
                        ${resource.reference ? `<p class="resource-reference"><a href="${resource.reference}" target="_blank" rel="noopener">📄 Reference</a></p>` : ''}
                    </div>
                `;
                codeList.appendChild(li);
            });
            
            container.appendChild(codeSection);
        }
        
    } catch (error) {
        console.error('Error loading resources data:', error);
    }
});
