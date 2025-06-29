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
        } catch (error) {
            alert('Error importing quotes: Invalid JSON format');
        }
    };
    reader.readAsText(file);
}

// Server simulation functions
async function syncWithServer() {
    try {
        // Simulate fetching from server
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const serverData = await response.json();
        
        console.log('Simulated server sync:', serverData);
        showNotification('Data synced with server');
    } catch (error) {
        console.error('Sync error:', error);
        showNotification('Sync failed. Working offline.', 'error');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.background = type === 'success' ? '#4CAF50' : '#f44336';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Simulate periodic server sync (every 30 seconds)
setInterval(syncWithServer, 30000);