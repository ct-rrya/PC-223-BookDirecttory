document.addEventListener('DOMContentLoaded', function() {
    // Get program from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const program = urlParams.get('program');

    // Initialize the page components
    updateProgramTitle(program);
    loadBooks(program);
    setupSearch();
    setupModal();
});

function updateProgramTitle(program) {
    const programTitle = document.getElementById('program-title');
    
    // Convert program code to readable name
    const programNames = {
        'BEEd': 'Bachelor of Elementary Education',
        'BTLED': 'Bachelor of Technology and Livelihood Education',
        'BSEd_Math': 'Bachelor of Secondary Education - Mathematics',
        'BSIE': 'Bachelor of Science in Industrial Engineering',
        'BSIT': 'Bachelor of Science in Information Technology',
        'BSFi': 'Bachelor of Science in Fisheries',
        'BIT_Automotive': 'Bachelor of Industrial Technology - Automotive',
        'BIT_CT': 'Bachelor of Industrial Technology - Computer Technology',
        'BIT_Electronics': 'Bachelor of Industrial Technology - Electronics',
        'BSHM': 'Bachelor of Science in Hospitality Management',
        'General_Education': 'General Education'
    };
    
    programTitle.textContent = programNames[program] || program + ' Books';
}

function loadBooks(program) {
    // Load books from the JSON file for the specified program
    fetch(`../JSON/${program}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(programBooks => {
            // Update the book count
            document.getElementById('program-count').textContent = `${programBooks.length} books available`;
            
            // Display the books
            displayBooks(programBooks);
        })
        .catch(error => {
            console.error(`Error loading books for ${program}:`, error);
            document.getElementById('program-count').textContent = 'Error loading books';
            document.getElementById('books-container').innerHTML = 
                '<p class="no-books">No books available for this program or error loading books.</p>';
        });
}

function displayBooks(books) {
    const booksContainer = document.getElementById('books-container');
    booksContainer.innerHTML = ''; // Clear any existing content
    
    if (books.length === 0) {
        booksContainer.innerHTML = '<p class="no-books">No books available for this program.</p>';
        return;
    }
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.setAttribute('data-book-id', book.id);
        
        bookCard.innerHTML = `
            <div class="book-cover">
                <img src="${book.coverImage}" alt="${book.title}">
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                <p class="book-year">${book.publicationYear}</p>
            </div>
        `;
        
        // Add click event to show modal with book details
        bookCard.addEventListener('click', () => showBookDetails(book));
        
        booksContainer.appendChild(bookCard);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    // Function to perform search
    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // If search term is empty, do nothing
        if (!searchTerm) {
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const program = urlParams.get('program');
        
        // Load the program-specific JSON file and filter it
        fetch(`../JSON/${program}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(programBooks => {
                // Filter books by search term
                const filteredBooks = programBooks.filter(book => {
                    return book.title.toLowerCase().includes(searchTerm) || 
                           book.author.toLowerCase().includes(searchTerm) ||
                           (book.description && book.description.toLowerCase().includes(searchTerm));
                });
                
                // Update the book count
                document.getElementById('program-count').textContent = `${filteredBooks.length} books found`;
                
                // Display the filtered books
                displayBooks(filteredBooks);
            })
            .catch(error => {
                console.error(`Error searching books for ${program}:`, error);
                document.getElementById('program-count').textContent = 'Error searching books';
            });
    };
    
    // Add event listeners for search
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function setupModal() {
    const modal = document.getElementById('bookModal');
    const closeButton = document.querySelector('.close-button');
    
    // Close the modal when clicking the close button
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close the modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

function showBookDetails(book) {
    const modal = document.getElementById('bookModal');
    
    // Update modal content with book details
    const coverImg = document.getElementById('modal-book-cover');
    coverImg.src = book.coverImage;
    coverImg.alt = `${book.title} cover`;
    
    document.getElementById('modal-book-title').textContent = book.title;
    document.getElementById('modal-book-author').querySelector('span').textContent = book.author;
    document.getElementById('modal-book-publisher').querySelector('span').textContent = book.publisher || 'Not specified';
    document.getElementById('modal-book-year').querySelector('span').textContent = book.publicationYear;
    
    const descriptionElement = document.getElementById('modal-book-description').querySelector('p');
    descriptionElement.textContent = book.description || 'No description available.';
    
    // Show the modal
    modal.style.display = 'block';
    
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
    
    // Add event listener to restore scrolling when modal closes
    const restoreScrolling = () => {
        document.body.style.overflow = 'auto';
    };
    
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', restoreScrolling, { once: true });
    
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            restoreScrolling();
        }
    }, { once: true });
}