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
  displayRandomQuote();
};

newQuoteButton.addEventListener('click', displayRandomQuote);

// Create Add Quote Form
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

  const addQuoteButton = document.createElement('button');
  addQuoteButton.innerText = 'Add Quote';
  addQuoteButton.addEventListener('click', addQuote);
  addQuoteButton.style.marginLeft = '10px';
  formDiv.appendChild(addQuoteButton);

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

function displayRandomQuote() {
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

function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert('Both fields are required!');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  displayRandomQuote();
  
  textInput.value = '';
  categoryInput.value = '';
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
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
      saveQuotes();
      populateCategories();
      syncStatus.textContent = `Synced ${newQuotes} new quotes at ${new Date().toLocaleTimeString()}`;
    } else {
      syncStatus.textContent = `Already up-to-date at ${new Date().toLocaleTimeString()}`;
    }

    await postQuotesToServer();
  } catch (error) {
    syncStatus.textContent = `Sync failed at ${new Date().toLocaleTimeString()}`;
    console.error('Sync error:', error);
  }
}

// Initialize
populateCategories();
displayRandomQuote();

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
