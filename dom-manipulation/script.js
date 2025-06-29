// Quotes array initialization
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "Stay hungry, stay foolish.", category: "Motivation" },
    { text: "The purpose of our lives is to be happy.", category: "Life" },
    { text: "Get busy living or get busy dying.", category: "Motivation" }
];

let currentCategory = localStorage.getItem('selectedCategory') || 'all';

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const addQuoteButton = document.getElementById('addQuoteButton');
const categoryFilter = document.getElementById('categoryFilter');
const importFileInput = document.getElementById('importFile');
const exportQuotesButton = document.getElementById('exportQuotesButton');
const syncStatus = document.getElementById('syncStatus');

// Display a random quote
function showRandomQuote() {
    let filteredQuotes = quotes;
    if (currentCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentCategory);
    }

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerText = 'No quotes available for this category.';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.innerText = filteredQuotes[randomIndex].text;
    sessionStorage.setItem('lastQuote', quoteDisplay.innerText);
}

// Add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText === '' || newQuoteCategory === '') {
        alert('Please enter both quote text and category.');
        return;
    }

    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes();
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added successfully!');
}

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate category dropdown
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    categoryFilter.innerHTML = '';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = currentCategory;
}

// Filter quotes by category
function filterQuotes() {
    currentCategory = categoryFilter.value;
    localStorage.setItem('selectedCategory', currentCategory);
    showRandomQuote();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        const importedQuotes = JSON.parse(e.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Export quotes to JSON file
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'quotes.json';
    downloadLink.click();

    URL.revokeObjectURL(url);
}

// Simulate server sync
function syncWithServer() {
    fetch('https://jsonplaceholder.typicode.com/posts')
        .then(response => response.json())
        .then(data => {
            // Simulated sync - we will just log and update sync status
            syncStatus.innerText = 'Synced with server at ' + new Date().toLocaleTimeString();
        })
        .catch(error => {
            console.error('Sync error:', error);
            syncStatus.innerText = 'Sync failed';
        });
}

// Attach Event Listeners
newQuoteButton.addEventListener('click', showRandomQuote);
addQuoteButton.addEventListener('click', addQuote);
importFileInput.addEventListener('change', importFromJsonFile);
exportQuotesButton.addEventListener('click', exportQuotes);

// Initial Setup
populateCategories();
categoryFilter.value = currentCategory;
filterQuotes();

// Load last viewed quote
const lastViewedQuote = sessionStorage.getItem('lastQuote');
if (lastViewedQuote) {
    quoteDisplay.innerText = lastViewedQuote;
}

// Start periodic sync
setInterval(syncWithServer, 30000);
