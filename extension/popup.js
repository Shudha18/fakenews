document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const contentContainer = document.getElementById('content-container');
    
    // Set theme
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', isDarkMode);

    // Clear badge text when popup is opened.
    chrome.action.setBadgeText({ text: '' });

    // Fetch result from storage
    chrome.storage.local.get(['analysisResult', 'analysisError', 'isLoading'], (data) => {
        if (data.isLoading) {
            loader.style.display = 'flex';
            contentContainer.style.display = 'none';
        } else if (data.analysisError && data.analysisError.includes("API Key not configured")) {
            loader.style.display = 'none';
            contentContainer.style.display = 'block';
            renderApiKeyForm();
        } else if (data.analysisError) {
            loader.style.display = 'none';
            contentContainer.style.display = 'block';
            renderError(data.analysisError);
        } else if (data.analysisResult) {
            loader.style.display = 'none';
            contentContainer.style.display = 'block';
            renderResult(data.analysisResult);
        } else {
            loader.style.display = 'none';
            contentContainer.style.display = 'block';
            renderWelcome();
        }
    });
});

function renderApiKeyForm() {
    const container = document.getElementById('content-container');
    container.innerHTML = `
        <div class="api-key-container">
            <h3 class="api-key-title">Configure API Key</h3>
            <p class="api-key-message">Please enter your Google Gemini API key to activate the extension.</p>
            <div class="api-key-form">
                <input type="password" id="apiKeyInput" class="api-key-input" placeholder="Enter your API key here" />
                <button id="saveApiKeyButton" class="api-key-button">Save Key</button>
            </div>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" class="api-key-link">Get your API Key from Google AI Studio</a>
        </div>
    `;

    document.getElementById('saveApiKeyButton').addEventListener('click', () => {
        const keyInput = document.getElementById('apiKeyInput');
        const key = keyInput.value.trim();
        if (key) {
            chrome.storage.local.set({ apiKey: key }, () => {
                keyInput.value = '';
                // Clear previous error to allow re-analysis
                chrome.storage.local.set({ analysisError: null }); 
                renderApiKeySuccess();
            });
        }
    });
}

function renderApiKeySuccess() {
    const container = document.getElementById('content-container');
    container.innerHTML = `
        <div class="welcome-container">
             <img src="icons/icon128.png" alt="Synthetica Logo" class="welcome-logo" />
             <h3 class="welcome-title" style="color: var(--color-green);">Success!</h3>
             <p class="welcome-message">Your API Key has been saved. Please try analyzing text again.</p>
        </div>
    `;
}

function renderError(errorMsg) {
    const container = document.getElementById('content-container');
    container.innerHTML = `
        <div class="error-container">
            <h3 class="error-title">Analysis Failed</h3>
            <p class="error-message">${errorMsg}</p>
        </div>
    `;
}

function renderWelcome() {
    const container = document.getElementById('content-container');
    container.innerHTML = `
        <div class="welcome-container">
             <img src="icons/icon128.png" alt="Synthetica Logo" class="welcome-logo" />
             <h3 class="welcome-title">Synthetica</h3>
             <p class="welcome-message">Select text on any page, right-click, and choose 'Analyze with Synthetica' to get started.</p>
        </div>
    `;
}


function renderResult(result) {
    const container = document.getElementById('content-container');

    const verdictConfig = {
        'REAL': { text: 'Authentic News', color: 'green', icon: '✓' },
        'LIKELY_REAL': { text: 'Likely Authentic', color: 'green', icon: '✓' },
        'UNCERTAIN': { text: 'Uncertain', color: 'yellow', icon: '?' },
        'LIKELY_FAKE': { text: 'Likely Misleading', color: 'red', icon: '✕' },
        'FAKE': { text: 'Misleading or Fake', color: 'red', icon: '✕' }
    }[result.verdict] || { text: 'Analysis Complete', color: 'gray', icon: '?' };

    const reasoningHTML = result.reasoning.map(point => `
        <li class="reasoning-item">
            <span class="reasoning-bullet" style="color: var(--color-${verdictConfig.color});">›</span>
            <p class="reasoning-text">${point}</p>
        </li>
    `).join('');

    container.innerHTML = `
        <div class="result-card verdict-${verdictConfig.color}">
            <div class="verdict-header">
                <div class="verdict-icon" style="color: var(--color-${verdictConfig.color});">${verdictConfig.icon}</div>
                <div class="verdict-text-group">
                    <h2 class="verdict-title" style="color: var(--color-${verdictConfig.color});">${verdictConfig.text}</h2>
                    <p class="verdict-summary">${result.summary}</p>
                </div>
            </div>

            <div class="confidence-section">
                <div class="confidence-text-group">
                    <p class="confidence-label">CONFIDENCE</p>
                    <p class="confidence-score" style="color: var(--color-${verdictConfig.color});">${result.confidence}%</p>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${result.confidence}%; background-color: var(--color-${verdictConfig.color});"></div>
                </div>
            </div>
            
            <div class="reasoning-section">
                <h3 class="reasoning-title">Key Reasoning Points</h3>
                <ul class="reasoning-list">${reasoningHTML}</ul>
            </div>
        </div>
    `;
}
