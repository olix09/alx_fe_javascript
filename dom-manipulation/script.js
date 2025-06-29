let quotes = [];
let serverQuotes = [];

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { id: 2, text: "Success is not in what you have, but who you are.", category: "Success" },
      { id: 3, text: "Believe you can and you're halfway there.", category: "Belief" }
    ];
    saveQuotes();
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate categories dynamically
function populateCategories() {
  const categorySelect = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];

  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  const lastSelected = localStorage.getItem('selectedCategory') || 'all';
  categorySelect.value = lastSelected;
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selectedCategory);

  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  displayQuotes(filteredQuotes);
}

// Display quotes
function displayQuotes(quotesToDisplay) {
  const displayDiv = document.getElementById('quoteDisplay');
  displayDiv.innerHTML = '';

  if (quotesToDisplay.length === 0) {
    displayDiv.textContent = 'No quotes available in this category.';
    return;
  }

  quotesToDisplay.forEach(quote => {
    const p = document.createElement('p');
    p.textContent = `"${quote.text}" - ${quote.category}`;
    displayDiv.appendChild(p);
  });
}

// Show random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById('quoteDisplay').innerText = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  document.getElementById('quoteDisplay').innerText = `"${quote.text}" - ${quote.category}`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Add new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

  if (newQuoteText === '' || newQuoteCategory === '') {
    alert('Please enter both a quote and a category.');
    return;
  }

  const newQuote = {
    id: Date.now(),
    text: newQuoteText,
    category: newQuoteCategory
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';

  alert('New quote added successfully!');
}

// Export quotes as JSON file
function exportQuotesAsJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format.');
      }
    } catch (error) {
      alert('Error reading the file. Make sure it is valid JSON.');
    }
  };

  fileReader.readAsText(event.target.files[0]);
}

// Load last viewed quote if category is "all"
function loadLastViewedQuote() {
  const lastCategory = localStorage.getItem('selectedCategory') || 'all';
  if (lastCategory === 'all') {
    const lastQuote = sessionStorage.getItem('lastViewedQuote');
    if (lastQuote) {
      const quote = JSON.parse(lastQuote);
      document.getElementById('quoteDisplay').innerText = `"${quote.text}" - ${quote.category}`;
    } else {
      showRandomQuote();
    }
  } else {
    filterQuotes();
  }
}

// ==========================
// Simulate Server Sync Logic
// ==========================

// Simulated server URL (use JSONPlaceholder for mock)
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Fetch quotes from the "server"
async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Simulate server quotes by mapping server data
    serverQuotes = data.slice(0, 5).map(post => ({
      id: post.id,
      text: post.title,
      category: 'Server'
    }));

    syncWithServer();
  } catch (error) {
    console.error('Error fetching server quotes:', error);
  }
}

// Sync local quotes with server quotes
function syncWithServer() {
  let conflicts = [];

  serverQuotes.forEach(serverQuote => {
    const localQuote = quotes.find(q => q.id === serverQuote.id);

    if (!localQuote) {
      // New quote from server
      quotes.push(serverQuote);
    } else if (localQuote.text !== serverQuote.text || localQuote.category !== serverQuote.category) {
      // Conflict detected, server wins
      conflicts.push({ local: localQuote, server: serverQuote });
      localQuote.text = serverQuote.text;
      localQuote.category = serverQuote.category;
    }
  });

  if (conflicts.length > 0) {
    displaySyncStatus('Conflicts resolved: server version applied.', 'orange');
  } else {
    displaySyncStatus('Quotes synced with server successfully.', 'green');
  }

  saveQuotes();
  populateCategories();
  filterQuotes();
}

// Display sync status to user
function displaySyncStatus(message, color) {
  const statusDiv = document.getElementById('syncStatus');
  statusDiv.style.color = color;
  statusDiv.innerText = message;

  setTimeout(() => { statusDiv.innerText = ''; }, 5000);
}

// Periodic sync every 30 seconds
setInterval(fetchServerQuotes, 30000);

// ==========================
// Event Listeners & Init
// ==========================
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteButton').addEventListener('click', addQuote);
document.getElementById('exportQuotesButton').addEventListener('click', exportQuotesAsJson);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

loadQuotes();
populateCategories();
loadLastViewedQuote();
fetchServerQuotes();  // Initial sync
