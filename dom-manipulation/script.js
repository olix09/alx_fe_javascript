// Load quotes from localStorage or use default
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "The purpose of our lives is to be happy.", category: "Life" },
  { text: "Get busy living or get busy dying.", category: "Motivation" }
];

let currentCategory = localStorage.getItem('selectedCategory') || 'all';

// Main app container
const app = document.getElementById('app');

// Quote display
const quoteDisplay = document.createElement('div');
quoteDisplay.id = 'quoteDisplay';
quoteDisplay.style.margin = '20px 0';
app.appendChild(quoteDisplay);

// Category filter dropdown
const categoryFilter = document.createElement('select');
categoryFilter.id = 'categoryFilter';
categoryFilter.onchange = () => {
  currentCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', currentCategory);
  showRandomQuote();
};
app.appendChild(categoryFilter);

// Show new quote button
const newQuoteButton = document.createElement('button');
newQuoteButton.id = 'newQuote';
newQuoteButton.innerText = 'Show New Quote';
newQuoteButton.onclick = showRandomQuote;
app.appendChild(newQuoteButton);

// Add quote form
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
addButton.onclick = addQuote;
addButton.style.marginLeft = '10px';
formDiv.appendChild(addButton);

app.appendChild(formDiv);

// Import/export section
const importInput = document.createElement('input');
importInput.type = 'file';
importInput.accept = '.json';
importInput.id = 'importFile';
importInput.onchange = importFromJsonFile;
importInput.style.marginTop = '20px';
app.appendChild(importInput);

const exportButton = document.createElement('button');
exportButton.innerText = 'Export Quotes';
exportButton.onclick = exportQuotes;
exportButton.style.marginLeft = '10px';
app.appendChild(exportButton);

// Sync status UI
const syncStatus = document.createElement('div');
syncStatus.id = 'syncStatus';
syncStatus.style.marginTop = '20px';
syncStatus.innerText = 'Not synced yet';
app.appendChild(syncStatus);

// Populate category dropdown
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

// Show a random quote
function showRandomQuote() {
  let filtered = quotes;
  if (currentCategory !== 'all') {
    filtered = quotes.filter(q => q.category === currentCategory);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerText = 'No quotes available in this category.';
    return;
  }

  const random = Math.floor(Math.random() * filtered.length);
  quoteDisplay.innerText = filtered[random].text;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem('lastQuote', quoteDisplay.innerText);
}

// Add a new quote
function addQuote() {
  const text = inputText.value.trim();
  const category = inputCategory.value.trim();

  if (!text || !category) {
    alert('Please enter both quote and category.');
    return;
  }

  quotes.push({ text, category });
  inputText.value = '';
  inputCategory.value = '';
  saveQuotes();
  populateCategories();
  showRandomQuote();
  alert('Quote added!');
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Import quotes from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
    } catch {
      alert('Invalid JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Export quotes as JSON
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes.json';
  link.click();

  URL.revokeObjectURL(url);
}

// Fetch from mock server
function fetchQuotesFromServer() {
  return fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(data => {
      const serverQuotes = data.slice(0, 5).map(post => ({
        text: post.title,
        category: 'Server'
      }));
      return serverQuotes;
    });
}

// Post to mock server
function postQuotesToServer() {
  return fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(quotes),
    headers: { 'Content-Type': 'application/json' }
  }).then(response => response.json());
}

// Sync quotes with server and resolve conflicts
function syncQuotes() {
  fetchQuotesFromServer()
    .then(serverQuotes => {
      let newCount = 0;
      serverQuotes.forEach(serverQuote => {
        if (!quotes.some(q => q.text === serverQuote.text)) {
          quotes.push(serverQuote);
          newCount++;
        }
      });

      if (newCount > 0) {
        saveQuotes();
        populateCategories();
        showRandomQuote();
        syncStatus.innerText = `✅ Synced ${newCount} new quotes at ${new Date().toLocaleTimeString()}`;
      } else {
        syncStatus.innerText = `✅ No new quotes (Already synced) at ${new Date().toLocaleTimeString()}`;
      }

      return postQuotesToServer();
    })
    .catch(err => {
      console.error('Sync failed:', err);
      syncStatus.innerText = `❌ Sync failed at ${new Date().toLocaleTimeString()}`;
    });
}

// Initialize app
populateCategories();
showRandomQuote();

// Restore last viewed quote from sessionStorage
const lastViewedQuote = sessionStorage.getItem('lastQuote');
if (lastViewedQuote) {
  quoteDisplay.innerText = lastViewedQuote;
}

// Periodically sync every 30 seconds
setInterval(syncQuotes, 30000);
