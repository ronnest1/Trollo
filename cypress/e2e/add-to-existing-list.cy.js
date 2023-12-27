describe("Add To Existing List", () => {
  const boardName = "Difficulty"; // Name of the existing board
  const listName = "easy"; // Name of the existing list
  const newCardText = "New Task"; // Text for the new card

  beforeEach(() => {
    cy.visit("http://localhost:3000/index.html"); // Start at the index page

    // Navigate to the existing board
    cy.contains(boardName).click();

    // Ensure the board page is loaded
    cy.url().should("include", "/board-overview.html");
  });

  it("should add a card to an existing list", () => {
    // Stub the window.prompt to automatically provide the new card text
    cy.window().then((win) => {
      cy.stub(win, "prompt").returns(newCardText);
    });

    // Trigger the action that calls handleAddCardClick by the visible text of the list header
    cy.contains(".list-header-assigned", listName).click(); // assuming the list is an 'assigned' list

    // Wait for a moment to let the card be added
    cy.wait(1000);

    // Verification step: Check if the card with the specified text is added to the DOM
    cy.contains(".card .card-text", newCardText).should("exist");
  });
});
