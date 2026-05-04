document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const tripDays = document.getElementById('trip-days');
    const tripBudget = document.getElementById('trip-budget');
    
    const itineraryContent = document.getElementById('itinerary-content');
    const actionsPanel = document.getElementById('actions-panel');
    const flightBtn = document.getElementById('flight-btn');
    
    const settingsBtn = document.getElementById('settings-btn');
    const apiModal = document.getElementById('api-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    const destCards = document.querySelectorAll('.dest-card');

    // --- API Key (OpenRouter) ---
    const DEFAULT_API_KEY = '';
    let apiKey = localStorage.getItem('wanderluxe_api_key') || DEFAULT_API_KEY;
    let conversationHistory = [];

    // --- System Prompt ---
    const systemInstruction = `You are the WanderLuxe Concierge, a highly sophisticated, editorial-style travel expert for a luxury travel brand.
Your goal is to curate bespoke, high-end itineraries.
When a user mentions a destination, use their provided budget and trip duration (if available) to create a day-wise plan.

CRITICAL FORMATTING:
1. Start with a refined, brief greeting.
2. The itinerary MUST be wrapped in <ITINERARY> tags.
3. Use Markdown: # for title, ## for days, and a | Table | for budget breakdown.
4. Suggest high-end hotels and unique cultural experiences.
5. Include food recommendations, activities, and stay suggestions.
6. ALL budget and cost estimates MUST be in Indian Rupees (₹).

Example Response:
"An exquisite choice. Paris in the spring is unparalleled..."
<ITINERARY>
# A Parisian Sojourn
| Category | Allocation |
|---|---|
| Luxury Stay | ₹90,000 |
| Fine Dining | ₹45,000 |
...
## Day 1: The Heart of the Marais
### Morning
...
### Afternoon
...
### Evening
...
</ITINERARY>`;

    // --- Init ---
    if (!apiKey || apiKey === '') {
        apiModal.classList.add('active');
    } else {
        apiKeyInput.value = apiKey;
    }

    // --- Modal Logic ---
    settingsBtn.addEventListener('click', () => apiModal.classList.add('active'));
    closeModalBtn.addEventListener('click', () => apiModal.classList.remove('active'));
    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('wanderluxe_api_key', key);
            apiKey = key;
            apiModal.classList.remove('active');
            addMessage("Settings updated. How may I assist you with your travels?", 'bot');
        }
    });

    // --- Destination Clicks ---
    destCards.forEach(card => {
        card.addEventListener('click', () => {
            const place = card.getAttribute('data-place');
            addMessage(`I'd love to explore ${place}. Could you plan a trip there?`, 'user');
            processUserMessage(`I'm interested in visiting ${place}. Please plan a trip.`);
        });
    });

    // --- Chat Logic ---
    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        
        if (sender === 'bot') {
            bubble.innerHTML = marked.parse(text);
        } else {
            bubble.textContent = text;
        }
        
        msgDiv.appendChild(bubble);
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-msg loading';
        loadingDiv.id = 'loading';
        loadingDiv.innerHTML = '<div class="msg-bubble shimmer">Concierge is conceptualizing...</div>';
        chatBox.appendChild(loadingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function removeLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.remove();
    }

    async function processUserMessage(text) {
        if (!apiKey) {
            addMessage("Please enter your API Key in Settings to begin our journey.", 'bot');
            apiModal.classList.add('active');
            return;
        }

        const days = tripDays.value;
        const budget = tripBudget.value;
        
        let enrichedText = text;
        if (days || budget) {
            const extras = [];
            if (days) extras.push(`Duration: ${days} days`);
            if (budget) extras.push(`Budget: ₹${budget}`);
            enrichedText += ` (${extras.join(', ')})`;
        }

        conversationHistory.push({ role: 'user', content: enrichedText });
        showLoading();

        try {
            const responseText = await callAI();
            removeLoading();
            
            conversationHistory.push({ role: 'assistant', content: responseText });
            
            if (responseText.includes('<ITINERARY>')) {
                const parts = responseText.split('<ITINERARY>');
                const chatPart = parts[0].trim();
                const itineraryPart = parts[1].replace('</ITINERARY>', '').trim();
                
                if (chatPart) addMessage(chatPart, 'bot');
                renderItinerary(itineraryPart);
            } else {
                addMessage(responseText, 'bot');
            }
        } catch (error) {
            removeLoading();
            console.error('API Error:', error);
            addMessage(`Something went wrong: ${error.message}. Please check your API key in Settings (⚙️).`, 'bot');
        }
    }

    // --- AI API Call (OpenRouter - OpenAI compatible) ---
    async function callAI() {
        const url = 'https://openrouter.ai/api/v1/chat/completions';
        
        const messages = [
            { role: 'system', content: systemInstruction },
            ...conversationHistory
        ];

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'WanderLuxe Travel Planner'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: messages
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // --- Itinerary Rendering ---
    function renderItinerary(md) {
        itineraryContent.innerHTML = marked.parse(md);
        actionsPanel.classList.remove('hidden');
        
        // Extract destination for Skyscanner
        const titleMatch = md.match(/# (.*)/);
        if (titleMatch) {
            const dest = titleMatch[1].replace(/Trip to |A |An |The /gi, '').trim().replace(/ /g, '-').toLowerCase();
            flightBtn.href = `https://www.skyscanner.com/transport/flights/any/${dest}`;
        }
        
        // Scroll itinerary into view smoothly
        document.getElementById('itinerary-section').scrollIntoView({ behavior: 'smooth' });
    }

    // --- Print Itinerary ---
    const printBtn = document.getElementById('print-btn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html><head><title>WanderLuxe Itinerary</title>
                <style>body{font-family:'Georgia',serif;padding:40px;line-height:1.8;color:#2C2C2E}
                h1,h2,h3{margin-top:24px}table{border-collapse:collapse;width:100%}
                th,td{padding:10px;border-bottom:1px solid #eee;text-align:left}</style>
                </head><body>${itineraryContent.innerHTML}</body></html>
            `);
            printWindow.document.close();
            printWindow.print();
        });
    }

    // --- Event Listeners ---
    sendBtn.addEventListener('click', () => {
        const val = userInput.value.trim();
        if (val) {
            addMessage(val, 'user');
            userInput.value = '';
            processUserMessage(val);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });
});
