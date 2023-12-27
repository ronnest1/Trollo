describe("Card Deletion", () => {
  const boardName = "Difficulty"; // Name of the existing board
  const listName = "easy"; // Name of the existing list
  const cardToDeleteText = "Task to Delete"; // Text of the card to be deleted

  beforeEach(() => {
    cy.visit("http://localhost:3000/index.html"); // Start at the index page
    cy.contains(boardName).click(); // Navigate to the existing board
    cy.url().should("include", "/board-overview.html");

    // Check if the card exists, if not create it
    cy.window().then((win) => {
      cy.stub(win, "prompt").returns(cardToDeleteText);
    });

    // Trigger the action that calls handleAddCardClick by the visible text of the list header
    // Replace 'List Visible Name' with the actual visible text of the list header
    cy.contains(".list-header-assigned", listName).click(); // for assigned lists
    // or cy.contains('.list-header-unassigned', 'List Visible Name').click(); // for unassigned lists

    // Wait for a moment to let the card be added
    cy.wait(1000);

    // Verification step: Check if the card with the specified text is added to the DOM
    // Replace 'List Visible Name' with the actual visible text where the card should appear
    cy.contains(".card .card-text", cardToDeleteText).should("exist");
  });

  it("should delete a card from a list", () => {
    // Locate the card by its text and trigger the deletion process
    cy.contains(".card .card-text", cardToDeleteText).click();
    cy.get("#deleteCard").click(); // Click the delete button
    cy.contains(".card .card-text", cardToDeleteText).should("not.exist"); // Verify deletion
  });
});
