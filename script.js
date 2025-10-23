// DOM elements
const datasetSelect = document.getElementById('datasetSelect');
const querySelect = document.getElementById('querySelect');
const filtersContainer = document.getElementById('filtersContainer');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const queryInfoDiv = document.getElementById('queryInfo');
const queryIdSpan = document.getElementById('queryId');
const queryStringSpan = document.getElementById('queryString');
const tableContainer = document.getElementById('tableContainer');
const tableBody = document.getElementById('tableBody');
const resultCountSpan = document.getElementById('resultCount');

// Filter checkboxes
const judgementFilters = document.querySelectorAll('.filter-judgement');
const stratumFilters = document.querySelectorAll('.filter-stratum');

// Data storage
let queries = new Map(); // Map of queryId -> queryString
let allResults = []; // All results from the current result file
let filteredResults = []; // Results after filtering

// Event listeners
datasetSelect.addEventListener('change', loadQueries);
querySelect.addEventListener('change', loadResultsForQuery);
judgementFilters.forEach(cb => cb.addEventListener('change', applyFilters));
stratumFilters.forEach(cb => cb.addEventListener('change', applyFilters));

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadQueries();
});

// Load queries from selected dataset
async function loadQueries() {
    const dataset = datasetSelect.value;
    const queryFile = `${dataset}.tsv`;

    showLoading();
    hideError();
    hideQueryInfo();
    hideTable();
    hideFilters();

    try {
        const text = await fetchFile(queryFile);
        queries = parseQueryFile(text);

        if (queries.size === 0) {
            throw new Error('No queries found in file');
        }

        // Populate query dropdown
        querySelect.innerHTML = '<option value="">-- Select a query --</option>';
        queries.forEach((queryString, queryId) => {
            const option = document.createElement('option');
            option.value = queryId;
            option.textContent = `${queryId}: ${queryString}`;
            querySelect.appendChild(option);
        });

        querySelect.disabled = false;
        hideLoading();
    } catch (error) {
        console.error('Error loading queries:', error);
        showError(error.message);
        hideLoading();
    }
}

// Load results for selected query
async function loadResultsForQuery() {
    const queryId = querySelect.value;

    if (!queryId) {
        hideQueryInfo();
        hideTable();
        hideFilters();
        return;
    }

    showLoading();
    hideError();

    const dataset = datasetSelect.value;
    const resultFile = `${dataset}_result.tsv`;

    try {
        const text = await fetchFile(resultFile);
        allResults = parseResultFile(text, queryId);

        // Display query info
        queryIdSpan.textContent = queryId;
        queryStringSpan.textContent = queries.get(queryId) || 'N/A';
        showQueryInfo();

        // Apply filters and display results
        applyFilters();
        showFilters();
        hideLoading();
        showTable();
    } catch (error) {
        console.error('Error loading results:', error);
        showError(error.message);
        hideLoading();
    }
}

// Fetch file from server
async function fetchFile(filename) {
    const response = await fetch(filename);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}`);
    }
    return await response.text();
}

// Parse query file (TSV with comments)
function parseQueryFile(text) {
    const queries = new Map();
    const lines = text.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        // Skip empty lines and comments (lines starting with #)
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        // Try tab separator first, then fall back to space
        let parts = trimmed.split('\t');
        if (parts.length < 2) {
            // If no tab, split by first space
            const spaceIndex = trimmed.indexOf(' ');
            if (spaceIndex > 0) {
                parts = [
                    trimmed.substring(0, spaceIndex),
                    trimmed.substring(spaceIndex + 1)
                ];
            }
        }

        if (parts.length >= 2) {
            const queryId = parts[0].trim();
            const queryString = parts[1].trim();

            // Only add if queryId is numeric (all valid queries have numeric IDs)
            if (queryId && queryString && /^\d+$/.test(queryId)) {
                queries.set(queryId, queryString);
            }
        }
    }

    console.log('Loaded queries:', queries.size);
    return queries;
}

// Parse result file (TSV) and filter by query ID
function parseResultFile(text, targetQueryId) {
    const results = [];
    const lines = text.split('\n');
    const targetWithPrefix = '1' + targetQueryId; // Results have queryId prepended with '1'

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            continue;
        }

        // Split by tabs and handle variable whitespace
        const parts = line.split(/\s+/);

        if (parts.length >= 5) {
            const queryId = parts[0].trim();

            // Only include results for the selected query
            if (queryId === targetWithPrefix) {
                results.push({
                    queryId: queryId,
                    junk: parts[1].trim(),
                    shotId: parts[2].trim(),
                    stratum: parts[3].trim(),
                    judgement: parts[4].trim()
                });
            }
        }
    }

    return results;
}

// Apply filters to results
function applyFilters() {
    // Get selected judgement values
    const selectedJudgements = Array.from(judgementFilters)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // Get selected stratum values
    const selectedStrata = Array.from(stratumFilters)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // Filter results
    filteredResults = allResults.filter(result => {
        return selectedJudgements.includes(result.judgement) &&
               selectedStrata.includes(result.stratum);
    });

    // Update display
    renderTable();
    updateResultCount();
}

// Render table with filtered results
function renderTable() {
    tableBody.innerHTML = '';

    if (filteredResults.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.textContent = 'No results match the current filters';
        td.style.textAlign = 'center';
        td.style.fontStyle = 'italic';
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
    }

    filteredResults.forEach(result => {
        const tr = document.createElement('tr');

        const createCell = (text) => {
            const td = document.createElement('td');
            td.textContent = text;
            return td;
        };

        tr.appendChild(createCell(result.queryId));
        tr.appendChild(createCell(result.junk));
        tr.appendChild(createCell(result.shotId));
        tr.appendChild(createCell(result.stratum));
        tr.appendChild(createCell(result.judgement));

        tableBody.appendChild(tr);
    });
}

// Update result count display
function updateResultCount() {
    const count = filteredResults.length;
    const total = allResults.length;
    resultCountSpan.textContent = `Showing ${count} of ${total} results`;
}

// UI helper functions
function showLoading() {
    loadingDiv.style.display = 'block';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

function showError(message) {
    if (message) {
        if (message.includes('fetch') || message.includes('NetworkError')) {
            errorDiv.innerHTML = '<p><strong>CORS Error:</strong> Please open this page through a web server.</p><p>Try: <code>python3 -m http.server 8000</code><br>Then visit: <code>http://localhost:8000</code></p>';
        } else {
            errorDiv.innerHTML = `<p>Error: ${message}</p>`;
        }
    }
    errorDiv.style.display = 'block';
}

function hideError() {
    errorDiv.style.display = 'none';
}

function showQueryInfo() {
    queryInfoDiv.style.display = 'block';
}

function hideQueryInfo() {
    queryInfoDiv.style.display = 'none';
}

function showTable() {
    tableContainer.style.display = 'block';
}

function hideTable() {
    tableContainer.style.display = 'none';
}

function showFilters() {
    filtersContainer.style.display = 'block';
}

function hideFilters() {
    filtersContainer.style.display = 'none';
}
