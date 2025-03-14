document.addEventListener("DOMContentLoaded", function () {
    fetch("books.json")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("programs-container");

            data.books.forEach(program => {
                let button = document.createElement("button");
                button.textContent = program.program;
                button.addEventListener("click", function () {
                    window.location.href = `program.html?program=${program.program}`;
                });

                container.appendChild(button);
            });
        })
        .catch(error => console.error("Error loading programs:", error));
});
