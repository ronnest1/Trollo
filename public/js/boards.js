// Open the modal (this function can be called from other parts of your application)
function openModal() {
  document.getElementById("createBoardModal").style.display = "block";
}

// Close the modal
function closeModal() {
  document.getElementById("createBoardModal").style.display = "none";
}

// Add a new list input field
function addListInput() {
  var listInputsContainer = document.getElementById("listInputs");
  var newListItem = document.createElement("div");
  newListItem.classList.add("list-input-item");
  newListItem.innerHTML = `
      <input type="text" class="list-input" name="listName" required>
      <button type="button" class="delete-list-btn" onclick="deleteListInput(this)">🗑️</button>
    `;
  listInputsContainer.appendChild(newListItem);
}

// Delete a list input field
function deleteListInput(button) {
  var listInputItem = button.parentElement;
  listInputItem.remove();
}

// Select color for the board
function selectColor(color) {
  // Deselect other colors
  const colors = document.getElementsByClassName("color-option");
  for (let i = 0; i < colors.length; i++) {
    colors[i].classList.remove("selected");
    colors[i].removeAttribute("data-selected");
  }
  // Select the clicked color
  const selectedColor = document.querySelector(
    `.color-option[style*="background-color: ${color}"]`
  );
  if (selectedColor) {
    selectedColor.classList.add("selected");
    selectedColor.setAttribute("data-selected", color); // Set the data-selected attribute with the color value
  }
}

// Handle the board creation form submission
document
  .getElementById("createBoardForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    const boardName = document.getElementById("boardName").value;
    const selectedColorDiv = document.querySelector(".color-option.selected");
    const color = selectedColorDiv
      ? selectedColorDiv.getAttribute("data-selected")
      : null; // Use the data-selected attribute value
    const listInputs = document.getElementsByClassName("list-input");
    const lists = Array.from(listInputs).map((input) => input.value);

    // Form data to send to the server
    const data = {
      name: boardName,
      color: color, // Ensure this matches the color format expected by your backend
      lists: lists,
    };

    // Send the POST request
    fetch("http://localhost:3000/boards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        closeModal();
        loadBoards(); // Reload the boards to include the new one
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

// Load the boards on page load
function loadBoards() {
  fetch("http://localhost:3000/boards")
    .then((response) => response.json())
    .then((boards) => {
      const boardContainer = document.getElementById("boardContainer");
      boardContainer.innerHTML = ""; // Clear existing boards
      boards.forEach((board) => {
        const boardSquare = document.createElement("div");
        boardSquare.className = "board-square";
        boardSquare.style.backgroundColor = board.color; // Use the color from the board data
        boardSquare.textContent = board.name;
        boardSquare.onclick = function () {
          // Redirect to the board overview page for this board
          window.location.href = `board-overview.html?boardId=${board.id}`;
        };
        boardContainer.appendChild(boardSquare);
      });
    })
    .catch((error) => console.error("Error loading boards:", error));
}

document.getElementById("newBoardBtn").addEventListener("click", openModal);
document.addEventListener("DOMContentLoaded", loadBoards);
