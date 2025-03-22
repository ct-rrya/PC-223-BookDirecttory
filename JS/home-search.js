document.addEventListener('DOMContentLoaded', function() {
    setupHomeSearch();
});

function setupHomeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    let isSearching = false;

    const debounce = (func, delay) => {
        let debounceTimer;
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const performHomeSearch = () => {
        if (isSearching) {
            console.log('Search is already in progress');
            return;
        }

        const searchTerm = searchInput.value.toLowerCase().trim();

        if (!searchTerm) {
            console.log('Search term is empty');
            return;
        }
        
        console.log(`Starting search for: ${searchTerm}`);

        // List of all program codes - make sure this matches your actual programs
        const programCodes = [
            'BEED', 'BTLED', 'BSEd_Math', 'BSIE', 'BSIT', 'BSFi', 
            'BIT_Auto', 'BIT_CT', 'BIT_Elex', 'BSHM', 'Gen_Ed'
        ];
        
        // We'll store all search results here
        let allResults = [];
        let programsSearched = 0;
        
        isSearching = true;
        
        // Create a loading indicator
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = ''; // Clears previous results
        resultsContainer.innerHTML = '<p>Searching across all programs...</p>';
        resultsContainer.style.display = 'block';
        
        const checkAllProgramsSearched = () => {
            if (programsSearched === programCodes.length) {
                isSearching = false;
                displayHomeSearchResults(allResults, searchTerm);
                console.log('Search completed');
            }
        };
        
        // Search each program's JSON file
        programCodes.forEach(program => {
            console.log(`Fetching data for program: ${program}`);
            fetch(`../JSON/${program}.json`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load data for ${program}`);
                    }
                    return response.json();
                })
                .then(programBooks => {
                    programsSearched++;
                    console.log(`Data fetched for program: ${program}`);
                    
                    const filteredBooks = programBooks.filter(book => {
                        const titleMatch = book.title?.toLowerCase().includes(searchTerm);
                        const authorMatch = typeof book.author === 'string' ? book.author.toLowerCase().includes(searchTerm) : false;
                        const descriptionMatch = typeof book.description === 'string' ? book.description.toLowerCase().includes(searchTerm) : false;
                    
                        return titleMatch || authorMatch || descriptionMatch;
                    });                    
                    
                    if (filteredBooks.length > 0) {
                        // Add program info to each book result
                        filteredBooks.forEach(book => {
                            book.program = program;
                            book.programName = getProgramName(program);
                        });
                        
                        allResults = allResults.concat(filteredBooks);
                    }
                    
                    checkAllProgramsSearched();
                })
                .catch(error => {
                    console.error(`Error searching books for ${program}:`, error);
                    programsSearched++;
                    checkAllProgramsSearched();
                });
        });
    };

    searchButton.addEventListener('click', performHomeSearch);
    searchInput.addEventListener('keyup', debounce((e) => {
        if (e.key === 'Enter') {
            performHomeSearch();
        }
    }, 300));
}

function getProgramName(programCode) {
    const programNames = {
        'BEED': 'Bachelor of Elementary Education',
        'BTLED': 'Bachelor of Technology and Livelihood Education',
        'BSEd_Math': 'Bachelor of Secondary Education - Mathematics',
        'BSIE': 'Bachelor of Science in Industrial Engineering',
        'BSIT': 'Bachelor of Science in Information Technology',
        'BSFi': 'Bachelor of Science in Fisheries',
        'BIT_Auto': 'Bachelor of Industrial Technology - Automotive',
        'BIT_CT': 'Bachelor of Industrial Technology - Computer Technology',
        'BIT_Elex': 'Bachelor of Industrial Technology - Electronics',
        'BSHM': 'Bachelor of Science in Hospitality Management',
        'Gen_Ed': 'General Education'
    };
    
    return programNames[programCode] || programCode;
}

function displayHomeSearchResults(books, searchTerm) {
    let resultsContainer = document.getElementById('search-results');
    
    if (!resultsContainer) {
        // Create results container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'search-results';
        container.className = 'search-results-container';
        document.querySelector('#home').appendChild(container);
        resultsContainer = container;
    }
    
    if (books.length === 0) {
        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <h2>Search Results for "${searchTerm}"</h2>
                <p>No books found matching your search.</p>
                <button class="close-results-btn">Close</button>
            </div>
        `;
    } else {
        // Group books by program
        const booksByProgram = {};
        books.forEach(book => {
            if (!booksByProgram[book.program]) {
                booksByProgram[book.program] = [];
            }
            booksByProgram[book.program].push(book);
        });
        
        let resultsHTML = `
            <div class="search-results-header">
                <h2>Search Results for "${searchTerm}"</h2>
                <p>Found ${books.length} books across ${Object.keys(booksByProgram).length} programs</p>
                <button class="close-results-btn">Close</button>
            </div>
            <div class="search-results-grid">
        `;
        
        // Display books grouped by program
        Object.keys(booksByProgram).forEach(program => {
            const programBooks = booksByProgram[program];
            resultsHTML += `
                <div class="program-results">
                    <h3>${getProgramName(program)} (${programBooks.length})</h3>
                    <div class="program-books">
            `;
            
            programBooks.forEach(book => {
                resultsHTML += `
                    <div class="book-card" data-book-id="${book.id}">
                        <div class="book-cover">
                            <img src="${book.coverImage}" alt="${book.title}">
                        </div>
                        <div class="book-info">
                            <h4 class="book-title">${book.title}</h4>
                            <p class="book-author">By ${book.author}</p>
                            <p class="book-year">${book.publicationYear}</p>
                            <a href="../HTML/books.html?program=${program}&search=${encodeURIComponent(searchTerm)}" class="view-program-btn">View in Program</a>
                        </div>
                    </div>
                `;
            });
            
            resultsHTML += `
                    </div>
                </div>
            `;
        });
        
        resultsHTML += `</div>`;
        resultsContainer.innerHTML = resultsHTML;
    }
    
    // Add click event to close button
    const closeButton = resultsContainer.querySelector('.close-results-btn');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            resultsContainer.style.display = 'none';
        });
    }
    
    // Make sure the results are visible
    resultsContainer.style.display = 'block';
}

// Parallax effect for elements
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.getElementById('logo');
    const title = document.getElementById('title');
    const paragraphs = document.querySelectorAll('#home p');
    const statBoxes = document.querySelectorAll('.stat-box');

    
    // Initialize the search button functionality
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('search-results');
    
    if (searchButton && searchInput && searchResults) {
        // Apply glassmorphism effect to search results
        searchButton.addEventListener('click', function() {
            if (searchInput.value.trim() !== '') {
                // Display the search results container
                searchResults.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                
                // Create a sample search results UI with glassmorphism
                searchResults.innerHTML = `
                    <div class="search-results-header">
                        <div>
                            <h2>Search results for: "${searchInput.value}"</h2>
                            <p>Showing best matches from our library</p>
                        </div>
                        <button class="close-results-btn">Close</button>
                    </div>
                    <div class="search-results-grid">
                        <div class="program-results">
                            <h3>Academic Resources</h3>
                            <div class="program-books">
                                <!-- Sample Book Cards -->
                                ${generateSampleBookCards(5)}
                            </div>
                        </div>
                    </div>
                `;
                
                // Add click event to close button
                const closeButton = searchResults.querySelector('.close-results-btn');
                if (closeButton) {
                    closeButton.addEventListener('click', function() {
                        searchResults.style.display = 'none';
                        document.body.style.overflow = 'auto'; // Enable scrolling
                    });
                }
                
                // Apply parallax to the book cards
                const bookCards = searchResults.querySelectorAll('.book-card');
                bookCards.forEach((card, index) => {
                    card.style.animationDelay = `${0.1 + (index * 0.05)}s`;
                });
            }
        });
    }
    
    // Function to generate sample book cards for demo purposes
    function generateSampleBookCards(count) {
        let cards = '';
        for (let i = 0; i < count; i++) {
            cards += `
                <div class="book-card glass-effect">
                    <div class="book-cover" style="background-color: hsl(${i * 60}, 70%, 60%);">
                        <span class="book-icon">📚</span>
                    </div>
                    <div class="book-info">
                        <h4>Sample Resource ${i + 1}</h4>
                        <p class="book-author">Author Name</p>
                        <p class="book-description">A brief description of this academic resource and what topics it covers.</p>
                        <div class="book-meta">
                            <span class="book-rating">★★★★☆</span>
                            <span class="book-category">Category ${i % 3 + 1}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        return cards;
    }
});

// Add smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

