// Load from localStorage or fallback
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "The purpose of our lives is to be happy.", category: "Life" },
  { text: "Get busy living or get busy dying.", category: "Motivation" }
];

let currentCategory = localStorage.getItem('selectedCategory') || 'all';

const app = document.getElementById('app');

// UI Elements
const quoteDisplay = document.createElement('div');
quoteDisplay.id = 'quoteDisplay';
quoteDisplay.style.margin = '20px 0';
app.appendChild(quoteDisplay);

const categoryFilter = document.createElement('select');
categoryFilter.id = 'categoryFilter';
app.appendChild(categoryFilter);

const newQuoteButton = document.createElement('button');
newQuoteButton.id = 'newQuote';
newQuoteButton.innerText = 'Show New Quote';
app.appendChild(newQuoteButton);

const syncStatus = document.createElement('div');
syncStatus.id = 'syncStatus';
syncStatus.style.marginTop = '20px';
app.appendChild(syncStatus);

// Event Listeners
categoryFilter.onchange = function() {
  currentCategory = this.value;
  localStorage.setItem('selectedCategory', currentCategory);
  showRandomQuote(); // Changed to showRandomQuote
};

newQuoteButton.addEventListener('click', showRandomQuote); // Changed to showRandomQuote

// Create Add Quote Form (replaces addQuote function)
function createAddQuoteForm() {
  const formDiv = document.createElement('div');
  formDiv.style.marginTop = '20px';

  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.placeholder = 'Enter a new quote';
  formDiv.appendChild(inputText);

  const inputCategory = document.createElement('input');
  inputCategory.id = 'newQuoteCategory';
  inputCategory.placeholder = 'Enter quote category';
  inputCategory.style.marginLeft = '10px';
  formDiv.appendChild(inputCategory);

  const addButton = document.createElement('button');
  addButton.innerText = 'Add Quote';
  addButton.addEventListener('click', function() {
    const text = inputText.value.trim();
    const category = inputCategory.value.trim();

    if (!text || !category) {
      alert('Both fields are required!');
      return;
    }

    quotes.push({ text, category });
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
    showRandomQuote();
    
    inputText.value = '';
    inputCategory.value = '';
    alert('Quote added successfully!');
  });
  formDiv.appendChild(addButton);

  app.appendChild(formDiv);
}
createAddQuoteForm();

// Core Functions
function populateCategories() {
  const categories = ['all', ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = currentCategory;
}

// Changed from displayRandomQuote to showRandomQuote
function showRandomQuote() {
  let filtered = currentCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === currentCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerText = 'No quotes in this category.';
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  quoteDisplay.innerText = filtered[randomIndex].text;
  sessionStorage.setItem('lastQuote', filtered[randomIndex].text);
}

// Server Sync Functions with async/await
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts = await response.json();
    return posts.slice(0, 5).map(post => ({
      text: post.title,
      category: 'Server'
    }));
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

async function postQuotesToServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotes)
    });
    return await response.json();
  } catch (error) {
    console.error('Post error:', error);
    throw error;
  }
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let newQuotes = 0;
    
    serverQuotes.forEach(serverQuote => {
      if (!quotes.some(localQuote => localQuote.text === serverQuote.text)) {
        quotes.push(serverQuote);
        newQuotes++;
      }
    });

    if (newQuotes > 0) {
      localStorage.setItem('quotes', JSON.stringify(quotes));
      populateCategories();
      syncStatus.textContent = 'Quotes synced with server! ' + newQuotes + ' new quotes added.';
    } else {
      syncStatus.textContent = 'Quotes synced with server! No new quotes found.';
    }

    await postQuotesToServer();
  } catch (error) {
    syncStatus.textContent = 'Failed to sync with server!';
    console.error('Sync error:', error);
  }
}

// Initialize
populateCategories();
showRandomQuote(); // Changed to showRandomQuote

// Restore last viewed quote
if (sessionStorage.getItem('lastQuote')) {
  quoteDisplay.textContent = sessionStorage.getItem('lastQuote');
}

// Periodic sync every 30 seconds
setInterval(() => {
  syncQuotes().catch(e => console.error('Periodic sync error:', e));
}, 30000);

// Initial sync
syncQuotes().catch(e => console.error('Initial sync error:', e));
