describe("Create List and Add Card", () => {
  const boardName = "New_Board2"; // Replace with the name of the board to test
  const listName = "New_List2"; // Replace with the name of the list to test
  const newCardText = "New_Card2"; // Text for the new card

  beforeEach(() => {
    cy.visit("http://localhost:3000/index.html"); // Start at the index page

    // Check if the board exists, if not create it
    cy.get("#boardContainer").then(($container) => {
      if ($container.text().includes(boardName)) {
        // Board exists, navigate to it
        cy.contains(boardName).click();
      } else {
        // Board does not exist, create it
        cy.get("#newBoardBtn").click(); // Click the 'New board' button
        cy.get("#boardName").type(boardName); // Type the board name
        // Add more steps if needed to set board color or other properties
        cy.get("#createBoardButton").click(); // Click the 'Create' button
        cy.contains(boardName).click(); // Navigate to the newly created board
      }
    });

    // Ensure the board page is loaded
    cy.url().should("include", "/board-overview.html");

    // Check if the list exists on the board, if not create it
    cy.get(".board").then(($board) => {
      if (!$board.text().includes(listName)) {
        // List does not exist, create it
        cy.get(".new-list-input input").type(listName); // Type the list name
        cy.get(".add-icon").click(); // Click to add the list
      }
    });
  });

  it("should add a card to an existing list", () => {
    // Locate the target list and initiate the process to add a new card

    // Stub the window.prompt to automatically provide the new card text
    // Stub the window.prompt to automatically provide the new card text
    cy.window().then((win) => {
      cy.stub(win, "prompt").returns(newCardText);
    });

    // Trigger the action that calls handleAddCardClick by the visible text of the list header
    // Replace 'List Visible Name' with the actual visible text of the list header
    cy.contains(".list-header-assigned", listName).click(); // for assigned lists
    // or cy.contains('.list-header-unassigned', 'List Visible Name').click(); // for unassigned lists

    // Wait for a moment to let the card be added
    cy.wait(1000);

    // Verification step: Check if the card with the specified text is added to the DOM
    // Replace 'List Visible Name' with the actual visible text where the card should appear
    cy.contains(".card .card-text", newCardText).should("exist");
  });
});
