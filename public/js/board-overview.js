// Add the new JavaScript for the modal here
var modal = document.getElementById("editModal");
var closeBtn = document.getElementsByClassName("close")[0];

closeBtn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
// Function to add a new card to a list
function addCard(listSelector, cardText) {
  const boardId = getBoardIdFromUrl(); // Get the current board ID
  if (!boardId) {
    console.error("No board ID found");
    return;
  }
  // Include board_id in the request body
  fetch("http://localhost:3000/cards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: listSelector,
      content: cardText,
      board_id: boardId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error("Error:", data.error);
      } else {
        console.log("Card added:", data);
        addCardToDOM(listSelector, cardText, data.id); // Update the DOM
      }
    })
    .catch((error) => console.error("Error:", error));
}

function addCardToDOM(listSelector, cardText, cardId) {
  console.log("Attempting to add card to: ", listSelector);
  var list = document.querySelector(listSelector);
  console.log("List found: ", list);

  if (list) {
    var list = document.querySelector(listSelector);
    console.log("List Selector:", listSelector);
    console.log("List Element Found:", list);

    var card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-card-id", cardId);

    // Create a text element inside the card
    var textElement = document.createElement("span");
    textElement.textContent = cardText;
    textElement.className = "card-text"; // Add a class for styling if needed

    // Add an event listener to the text element to open the modal
    textElement.addEventListener("click", function () {
      var cardId = card.getAttribute("data-card-id");
      openModal(cardText, cardId);
    });

    // Append the text element to the card
    card.appendChild(textElement);

    // Append other elements like edit and delete icons to the card here...

    list.appendChild(card);
  } else {
    console.error("List not found for selector:", listSelector);
  }
}

function openModal(cardText, cardId) {
  document.getElementById("cardEditText").value = cardText;
  modal.setAttribute("data-card-id", cardId); // Store the card ID
  modal.style.display = "block";
}

// Function to handle the header click
function handleAddCardClick(listContentSelector) {
  console.log(
    "handleAddCardClick - List Content Selector:",
    listContentSelector
  );
  var cardText = prompt("Enter the card text:"); // Get card text from the user
  if (cardText) {
    addCard(listContentSelector, cardText); // Add the card to the list if text was entered
  }
}

function loadCards(boardId) {
  fetch(`http://localhost:3000/cards?board_id=${boardId}`)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((card) => {
        let listSelector;
        if (card.title === ".list-content-unassigned") {
          listSelector = card.title; // Unassigned list
        } else if (
          card.title &&
          card.title.startsWith(".list-content-") &&
          card.title.length > ".list-content-".length
        ) {
          // Convert class selector to ID selector for dynamic lists and ensure it's not just '.list-content-'
          let listName = card.title.split(".list-content-")[1];
          listSelector = "#list-content-" + listName;
        } else if (
          card.title &&
          card.title.startsWith("#") &&
          card.title.length > 1
        ) {
          // Correctly formatted ID selector and ensure it's not just '#'
          listSelector = card.title;
        } else {
          // Reassign to unassigned if the list does not exist or title is generic/incomplete
          listSelector = ".list-content-unassigned";
          console.log(
            "Invalid or non-existent list title, reassigned to unassigned:",
            card
          );
        }
        console.log("Loading card with selector:", listSelector);
        addCardToDOM(listSelector, card.content, card.id);
      });
    });
}

document.getElementById("saveEdit").addEventListener("click", function () {
  const updatedText = document.getElementById("cardEditText").value;
  const cardId = modal.getAttribute("data-card-id");
  console.log(cardId);
  fetch(`http://localhost:3000/cards/${cardId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: updatedText }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Update response:", data);
      // Update the card text in the DOM
      var updatedCard = document.querySelector(
        `[data-card-id="${cardId}"] .card-text`
      );
      if (updatedCard) {
        updatedCard.textContent = updatedText;
      }
      modal.style.display = "none";
    })
    .catch((error) => console.error("Error:", error));
});
document.getElementById("deleteCard").addEventListener("click", function () {
  const cardId = modal.getAttribute("data-card-id");
  deleteCard(cardId);
});

function deleteCard(cardId) {
  fetch(`http://localhost:3000/cards/${cardId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Delete response:", data);
      // Close the modal and remove the card element from the DOM
      modal.style.display = "none";
      var cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
      if (cardElement) {
        cardElement.remove();
      }
    })
    .catch((error) => console.error("Error:", error));
}
document.querySelector(".add-icon").addEventListener("click", function () {
  const newListName = document.querySelector(".new-list-input input").value;
  if (newListName) {
    const board_id = getBoardIdFromUrl();
    addNewListToBoard(newListName, board_id);
    document.querySelector(".new-list-input input").value = ""; // Reset input field
  }
});

function getBoardIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("boardId"); // Assuming the URL parameter is named 'boardId'
}

// Function to fetch and render all lists from the backend on page load
function loadLists() {
  const boardId = getBoardIdFromUrl();
  if (!boardId) {
    console.error("No board ID found in URL");
    return;
  }

  fetch(`http://localhost:3000/boards/${boardId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((board) => {
      const boardColor = board.color; // Fetching the color of the board
      const boardName = board.name; // Fetching the name of the board
      const boardElement = document.querySelector(".board");
      boardElement.innerHTML = ""; // Clear existing lists

      // Add the 'Unassigned' list
      const unassignedListHTML = `
    <div class="list-unassigned" style="border-color: ${boardColor};">
      <div class="list-header-unassigned" style="background-color: ${boardColor};">
        <div class="header-text-container">
          <div>${boardName}</div>
          <div class="subtext" style="color: white;">Unassigned</div>
        </div>
        <span class="number-box" id="unassigned-number-box" style="color: ${boardColor};">0</span>
      </div>
      <div class="list-content list-content-unassigned"></div>
    </div>
  `;
      boardElement.innerHTML += unassignedListHTML;

      fetch(`http://localhost:3000/lists?board_id=${boardId}`)
        .then((response) => response.json())
        .then((lists) => {
          lists.forEach((list) => {
            if (list.name.toLowerCase() !== "unassigned") {
              const newListElement = createListElement(
                list,
                boardColor,
                boardName
              );
              boardElement.appendChild(newListElement);
            }
          });
          updateCardCount(boardId); // Update card count after lists are loaded
        })
        .catch((error) => console.error("Error:", error));
    })
    .catch((error) => console.error("Error fetching board details:", error));
}

function createListElement(list, boardColor, boardName) {
  const listDiv = document.createElement("div");
  listDiv.className = "list";
  listDiv.style.borderColor = boardColor;
  listDiv.innerHTML = `
    <div class="list-header-assigned" style="color: ${boardColor};">
      <div class="header-text-container">
        <div>${list.name}</div>
        <div class="subtext" style="color: ${boardColor};">${boardName}</div>
      </div>
      <span class="number-box-assigned" id="list-${list.id}-number-box" style="background-color: ${boardColor}; color: white;">0</span>
    </div>
    <div class="list-content" id="list-content-${list.id}"></div>
  `;
  return listDiv;
}

// UpdateCardCount function remains the same

function updateCardCount(boardId) {
  fetch(`http://localhost:3000/cards?board_id=${boardId}`)
    .then((response) => response.json())
    .then((cards) => {
      const unassignedCards = cards.filter(
        (card) => card.title === ".list-content-unassigned"
      );
      document.getElementById("unassigned-number-box").textContent =
        unassignedCards.length;

      cards.forEach((card) => {
        if (card.title.startsWith(".list-content-")) {
          const listId = card.title.split(".list-content-")[1];
          const numberBox = document.getElementById(
            `list-${listId}-number-box`
          );
          if (numberBox) {
            let count = parseInt(numberBox.textContent, 10);
            numberBox.textContent = count + 1;
          }
        }
      });
    })
    .catch((error) => console.error("Error fetching cards:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  const boardId = getBoardIdFromUrl();
  if (boardId) {
    loadLists(boardId);
    loadCards(boardId);
  } else {
    // Handle case where no board ID is present
  }
});

// Updated function to add a new list and store it in the backend
function addNewListToBoard(name, boardId) {
  // Include board_id in the request body
  fetch("http://localhost:3000/lists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name, board_id: boardId }),
  })
    .then((response) => response.json())
    .then((existingLists) => {
      // Check if the list already exists
      const listExists = existingLists.some((list) => list.name === name);
      if (!listExists) {
        // Add the list to the database
        fetch("http://localhost:3000/lists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: name }),
        })
          .then((response) => response.json())
          .then((data) => console.log("List added:", data))
          .catch((error) => console.error("Error:", error));
      }
    })
    .catch((error) => console.error("Error:", error));

  // Add the list to the DOM
  const board = document.querySelector(".board");
  const newList = document.createElement("div");
  newList.className = "list-assigned";
  const listContentId = "list-content-" + name.replace(/\s+/g, "-"); // Replace spaces with dashes for the ID
  console.log("List Content ID:", listContentId);
  newList.innerHTML = `
          <div class="list-header-assigned">
            ${name}
            <span class="subtext">Severity</span>
            <span class="number-box-assigned">0</span>
          </div>
          <div class="list-content" id="${listContentId}"></div>
          `;
  board.appendChild(newList);
}
document.querySelector(".board").addEventListener("click", function (event) {
  let header = event.target;

  if (
    !header.classList.contains("list-header-unassigned") &&
    !header.classList.contains("list-header-assigned")
  ) {
    if (
      header.parentElement.classList.contains("list-header-unassigned") ||
      header.parentElement.classList.contains("list-header-assigned")
    ) {
      header = header.parentElement;
    } else {
      return; // Click was not on a list header or its child
    }
  }

  let listContentSelector = "";
  if (header.classList.contains("list-header-unassigned")) {
    listContentSelector = ".list-content-unassigned";
  } else if (header.classList.contains("list-header-assigned")) {
    // Use ID selector for dynamically created lists
    listContentSelector = "#" + header.nextElementSibling.id;
  }

  console.log(
    "Board Event Listener - List Content Selector:",
    listContentSelector
  );
  handleAddCardClick(listContentSelector);
});
function loadBoards() {
  fetch("http://localhost:3000/boards")
    .then((response) => response.json())
    .then((boards) => {
      const boardSelect = document.getElementById("boardSelect");
      boards.forEach((board) => {
        const option = document.createElement("option");
        option.value = board.id;
        option.textContent = board.name;
        boardSelect.appendChild(option);
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadBoards(); // Load boards on page load
});
function loadBoard() {
  const boardId = document.getElementById("boardSelect").value;
  if (boardId) {
    loadLists(boardId);
    loadCards(boardId);
  }
}
