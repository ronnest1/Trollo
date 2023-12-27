describe("Card Updating", () => {
  const boardName = "Difficulty"; // Name of the existing board
  const listName = "easy"; // Name of the existing list
  const cardToUpdateText = "Task to Update"; // Text of the card to be updated
  const updatedCardText = "Updated Task"; // New text for the updated card

  beforeEach(() => {
    cy.visit("http://localhost:3000/index.html"); // Start at the index page
    cy.contains(boardName).click(); // Navigate to the existing board
    cy.url().should("include", "/board-overview.html");
    cy.window().then((win) => {
      cy.stub(win, "prompt").returns(cardToUpdateText);
    });

    // Trigger the action that calls handleAddCardClick by the visible text of the list header
    // Replace 'List Visible Name' with the actual visible text of the list header
    cy.contains(".list-header-assigned", listName).click(); // for assigned lists
    // or cy.contains('.list-header-unassigned', 'List Visible Name').click(); // for unassigned lists

    // Wait for a moment to let the card be added
    cy.wait(1000);

    // Verification step: Check if the card with the specified text is added to the DOM
    // Replace 'List Visible Name' with the actual visible text where the card should appear
    cy.contains(".card .card-text", cardToUpdateText).should("exist");
  });

  it("should update a card in a list", () => {
    // Locate the card by its text and trigger the update process
    cy.contains(".card .card-text", cardToUpdateText).click();
    cy.get("#cardEditText").clear().type(updatedCardText);
    cy.get("#saveEdit").click(); // Click the save button
    cy.contains(".card .card-text", updatedCardText).should("exist"); // Verify update
  });
});
