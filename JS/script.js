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
