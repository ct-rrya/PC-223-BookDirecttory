document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const programName = urlParams.get("program");

    if (!programName) {
        document.getElementById("program-title").textContent = "Program Not Found";
        return;
    }

    document.getElementById("program-title").textContent = `Books for ${programName}`;

    fetch("books.json")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("books-container");
            const program = data.books.find(p => p.program === programName);

            if (!program) {
                container.innerHTML = "<p>No books available for this program.</p>";
                return;
            }

            let list = document.createElement("ul");
            program.books.forEach(book => {
                let item = document.createElement("li");
                item.innerHTML = `<strong>${book.title}</strong> - ${book.author} (${book.year})`;
                list.appendChild(item);
            });

            container.appendChild(list);
        })
        .catch(error => console.error("Error loading books:", error));
});
