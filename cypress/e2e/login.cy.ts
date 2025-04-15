describe("Hello World test", () => {
  it("should visit the page and check the title", () => {
    cy.visit("https://example.cypress.io")
    cy.title().should("include", "Cypress")
  })
})
