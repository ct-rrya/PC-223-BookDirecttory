document.addEventListener("DOMContentLoaded", function () {
    // Get program name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const programName = urlParams.get("program");
    let allBooks = []; // Store all books for filtering
    
    // Initialize the page
    initializeProgram();
    
    function initializeProgram() {
        if (!programName) {
            document.getElementById("program-title").textContent = "Program Not Found";
            document.getElementById("books-container").innerHTML = 
                '<div class="empty-state"><p>No program selected. Please go back to browse programs.</p>' +
                '<a href="browse.html" class="modal-action-button borrow-button">Browse Programs</a></div>';
            return;
        }
        
        // Set program title with formatted name
        const formattedName = formatProgramName(programName);
        document.getElementById("program-title").textContent = `Books for ${formattedName}`;
        
        // Set program description based on program name
        setProgramDescription(programName);
        
        // Show loading spinner
        showLoadingSpinner();
        
        // Fetch books data
        fetchBooks();
    }
    
    function showBookDetails(book) {
        const modal = document.getElementById("book-modal");
        const modalContent = document.getElementById("modal-book-details");

        const shelfLocation = book.location || generateShelfLocation(book);

        modalContent.innerHTML = `
            <div class="modal-book-details">
                <div class="modal-book-image">
                    <img src="${book.image || 'images/default-cover.jpg'}" alt="${book.title}" onerror="this.src='images/default-cover.jpg'">
                </div>
                <div class="modal-book-info">
                    <h2 class="modal-book-title">${book.title}</h2>
                    <div class="modal-book-metadata">
                        <p><span>Author:</span> ${book.author}</p>
                        <p><span>Year:</span> ${book.year || 'N/A'}</p>
                        <p><span>Publisher:</span> ${book.publisher || 'N/A'}</p>
                        <p><span>Category:</span> ${book.category || 'General'}</p>
                        <p><span>ISBN:</span> ${book.isbn || 'N/A'}</p>
                        <p><span>Status:</span> ${book.available !== false ? 'Available' : 'Unavailable'}</p>
                        <p><span>Library Location:</span> ${shelfLocation}</p>
                    </div>
                    <div class="modal-book-description">
                        ${book.description || 'No description available for this book.'}
                    </div>
                    <div class="modal-action-buttons">
                        ${book.available !== false ? 
                            '<button class="modal-action-button locate-button">Find in Library</button>' : 
                            '<button class="modal-action-button locate-button" disabled>Currently Unavailable</button>'}
                        <button class="modal-action-button favorite-button">Add to Favorites</button>
                        <button class="modal-action-button export-button">Export Details</button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = "block";
    }

    function generateShelfLocation(book) {
        return `Shelf ${book.id ? book.id % 10 : 'Unknown'}`;
    }

    function setupEventListeners() {
        document.getElementById("book-modal-close").addEventListener("click", () => {
            document.getElementById("book-modal").style.display = "none";
        });

        window.addEventListener("click", event => {
            if (event.target === document.getElementById("book-modal")) {
                document.getElementById("book-modal").style.display = "none";
            }
        });
    }
});
