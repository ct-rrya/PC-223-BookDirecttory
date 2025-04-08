document.addEventListener("DOMContentLoaded", function () {
    fetch("books.json")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("programs-container");

            data.books.forEach(program => {
                let button = document.createElement("button");
                button.textContent = program.program;
                button.addEventListener("click", function () {
                    window.location.href = `program.html?program=${encodeURIComponent(program.program)}`;
                });

                container.appendChild(button);
            });
        })
        .catch(error => console.error("Error loading programs:", error));

    const categoryCards = document.querySelectorAll('.category-card');

    categoryCards.forEach(card => {
        card.addEventListener('click', function () {
            const program = this.getAttribute('data-program');
            window.location.href = `books.html?program=${encodeURIComponent(program)}`;
        });
    });

});

document.addEventListener('DOMContentLoaded', function() {
    const categoryCards = document.querySelectorAll('.category-card');
    const totalCards = categoryCards.length;
    let currentIndex = 0;
    
    // Add slider controls to HTML
    const categoriesSection = document.querySelector('.categories-section');
    const sliderControls = document.createElement('div');
    sliderControls.className = 'slider-controls';
    sliderControls.innerHTML = `
        <button class="slider-btn prev-btn">&#10094;</button>
        <button class="slider-btn next-btn">&#10095;</button>
    `;
    categoriesSection.appendChild(sliderControls);
    
    // Add slider dots
    const sliderDots = document.createElement('div');
    sliderDots.className = 'slider-dots';
    for (let i = 0; i < totalCards; i++) {
        const dot = document.createElement('div');
        dot.className = 'slider-dot';
        dot.dataset.index = i;
        sliderDots.appendChild(dot);
    }
    categoriesSection.appendChild(sliderDots);
    
    // Set up initial positions
    function updateSlider() {
        categoryCards.forEach((card, index) => {
            // Remove all classes first
            card.classList.remove('active', 'prev', 'next', 'prev-2', 'next-2');
            card.style.left = '50%';
            
            // Calculate position relative to current index
            const position = (index - currentIndex + totalCards) % totalCards;
            
            if (position === 0) {
                // Current card
                card.classList.add('active');
                card.style.transform = 'translateX(-50%) scale(1)';
                card.style.zIndex = '3';
                card.style.opacity = '1';
            } else if (position === 1 || position === totalCards - 1) {
                // Card next to active
                if (position === 1) {
                    card.classList.add('next');
                    card.style.transform = 'translateX(40%) scale(0.9)';
                } else {
                    card.classList.add('prev');
                    card.style.transform = 'translateX(-140%) scale(0.9)';
                }
                card.style.zIndex = '2';
                card.style.opacity = '0.7';
            } else if (position === 2 || position === totalCards - 2) {
                // 2 cards away
                if (position === 2) {
                    card.classList.add('next-2');
                    card.style.transform = 'translateX(120%) scale(0.8)';
                } else {
                    card.classList.add('prev-2');
                    card.style.transform = 'translateX(-220%) scale(0.8)';
                }
                card.style.zIndex = '1';
                card.style.opacity = '0.5';
            } else {
                // Hidden cards
                if (position < totalCards / 2) {
                    card.style.transform = 'translateX(200%) scale(0.7)';
                } else {
                    card.style.transform = 'translateX(-300%) scale(0.7)';
                }
                card.style.zIndex = '0';
                card.style.opacity = '0';
            }
        });
        
        // Update dots
        const dots = document.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Initial setup
    updateSlider();
    
    // Event listeners for navigation
    document.querySelector('.prev-btn').addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateSlider();
    });
    
    document.querySelector('.next-btn').addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % totalCards;
        updateSlider();
    });
    
    // Dot navigation
    document.querySelectorAll('.slider-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            currentIndex = parseInt(this.dataset.index);
            updateSlider();
        });
    });
    
    // Optional: Add touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    const slider = document.querySelector('.categories-grid');
    
    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchStartX - touchEndX > 50) {
            // Swipe left - go next
            currentIndex = (currentIndex + 1) % totalCards;
            updateSlider();
        } else if (touchEndX - touchStartX > 50) {
            // Swipe right - go previous
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateSlider();
        }
    }
    
    // Card click navigation
    categoryCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            if (index !== currentIndex) {
                currentIndex = index;
                updateSlider();
            }
        });
    });
});