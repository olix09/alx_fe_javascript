// Initial quotes array
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteFormContainer = document.getElementById('addQuoteForm');

// Initialize the application
function init() {
    // Load quotes from local storage if available
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
    }
    
    // Load last selected category
    const lastCategory = localStorage.getItem('lastCategory');
    if (lastCategory) {
        categoryFilter.value = lastCategory;
    }
    
    // Create the add quote form
    createAddQuoteForm();
    
    // Populate categories
    populateCategories();
    
    // Show initial quote
    showRandomQuote();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    
    // Initial server sync
    syncQuotes();
}

// Create and manage the add quote form
function createAddQuoteForm() {
    addQuoteFormContainer.innerHTML = `
        <h3>Add New Quote</h3>
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button onclick="addQuote()">Add Quote</button>
    `;
}

// Sync quotes with server
async function syncQuotes() {
    try {
        // 1. Fetch quotes from server
        const serverQuotes = await fetchQuotesFromServer();
        
        if (serverQuotes) {
            // 2. Compare with local quotes
            const serverData = JSON.parse(serverQuotes.body || '[]');
            const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
            
            // 3. Conflict resolution (server wins)
            const mergedQuotes = [...localQuotes];
            let newQuotesCount = 0;
            
            serverData.forEach(serverQuote => {
                const exists = mergedQuotes.some(localQuote => 
                    localQuote.text === serverQuote.text && 
                    localQuote.category === serverQuote.category
                );
                
                if (!exists) {
                    mergedQuotes.push(serverQuote);
                    newQuotesCount++;
                }
            });
            
            // 4. Update local storage
            quotes = mergedQuotes;
            saveQuotes();
            populateCategories();
            
            // 5. Show appropriate notifications
            if (newQuotesCount > 0) {
                showNotification(`${newQuotesCount} new quotes added from server`);
            }
            showNotification("Quotes synced with server!");
        }
        
        // 6. Post our local quotes to server
        await postQuotesToServer();
        
    } catch (error) {
        console.error('Sync error:', error);
        showNotification('Sync failed. Working offline.', 'error');
    }
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const serverData = await response.json();
        
        // Simulate server response with quotes
        const mockResponse = {
            ...serverData,
            body: JSON.stringify([
                { text: "New server quote 1", category: "Server" },
                { text: "New server quote 2", category: "Server" }
            ])
        };
        
        console.log('Fetched from server:', mockResponse);
        return mockResponse;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Post quotes to server
async function postQuotesToServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Quote Data',
                body: JSON.stringify(quotes),
                userId: 1
            })
        });
        
        const result = await response.json();
        console.log('Posted to server:', result);
        return result;
    } catch (error) {
        console.error('Post error:', error);
        throw error;
    }
}

// Add a new quote
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    
    if (text && category) {
        quotes.push({ text, category });
        saveQuotes();
        populateCategories();
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        showRandomQuote();
        
        // Post updated quotes to server
        postQuotesToServer();
    } else {
        alert('Please enter both quote text and category');
    }
}

// Show a random quote
function showRandomQuote() {
    let filteredQuotes = quotes;
    const selectedCategory = categoryFilter.value;
    
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const quote = filteredQuotes[randomIndex];
        quoteDisplay.innerHTML = `
            <blockquote>${quote.text}</blockquote>
            <p><em>- ${quote.category}</em></p>
        `;
    } else {
        quoteDisplay.innerHTML = '<p>No quotes found in this category.</p>';
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate category dropdown
function populateCategories() {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options (except "All")
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Add new categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Filter quotes by category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastCategory', selectedCategory);
    showRandomQuote();
}

// Export quotes to JSON file
function exportQuotes() {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            quotes = importedQuotes;
            saveQuotes();
            populateCategories();
            showRandomQuote();
            alert('Quotes imported successfully!');
            
            // Post updated quotes to server
            postQuotesToServer();
        } catch (error) {
            alert('Error importing quotes: Invalid JSON format');
        }
    };
    reader.readAsText(file);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Simulate periodic server sync (every 30 seconds)
setInterval(syncQuotes, 30000);