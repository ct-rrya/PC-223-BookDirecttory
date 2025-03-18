document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const program = urlParams.get('program');

    updateProgramTitle(program);
    loadBooks(program);
    setupSearch();
    setupModal();
});

function updateProgramTitle(program) {
    const programTitle = document.getElementById('program-title');

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
    fetch(`../JSON/${program}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(programBooks => {
            document.getElementById('program-count').textContent = `${programBooks.length} books available`;
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
    booksContainer.innerHTML = ''; 
    
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

        bookCard.addEventListener('click', () => showBookDetails(book));
        
        booksContainer.appendChild(bookCard);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (!searchTerm) {
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const program = urlParams.get('program');

        fetch(`../JSON/${program}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(programBooks => {
                const filteredBooks = programBooks.filter(book => {
                    return book.title.toLowerCase().includes(searchTerm) || 
                           book.author.toLowerCase().includes(searchTerm) ||
                           (book.description && book.description.toLowerCase().includes(searchTerm));
                });

                document.getElementById('program-count').textContent = `${filteredBooks.length} books found`;
                
                displayBooks(filteredBooks);
            })
            .catch(error => {
                console.error(`Error searching books for ${program}:`, error);
                document.getElementById('program-count').textContent = 'Error searching books';
            });
    };

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

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

function showBookDetails(book) {
    const modal = document.getElementById('bookModal');

    const coverImg = document.getElementById('modal-book-cover');
    coverImg.src = book.coverImage;
    coverImg.alt = `${book.title} cover`;
    
    document.getElementById('modal-book-title').textContent = book.title;
    document.getElementById('modal-book-author').querySelector('span').textContent = book.author;
    document.getElementById('modal-book-publisher').querySelector('span').textContent = book.publisher || 'Not specified';
    document.getElementById('modal-book-year').querySelector('span').textContent = book.publicationYear;
    
    const descriptionElement = document.getElementById('modal-book-description').querySelector('p');
    descriptionElement.textContent = book.description || 'No description available.';
    
    modal.style.display = 'block';
    
    document.body.style.overflow = 'hidden';
    
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