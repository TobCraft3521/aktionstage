describe("Test login", () => {
  it("should login with valid credentials", () => {
    cy.visit("http://localhost:3000/login")

    cy.get('input[name="name"]').type("teacher")
    cy.get('input[name="password"]').type("test")
    cy.get('button[type="submit"]').click()
    cy.url().should("include", "/projects")
  })

  it("should show error message with invalid credentials", () => {
    cy.visit("http://localhost:3000/login")

    cy.get('input[name="name"]').type("invalidUser")
    cy.get('input[name="password"]').type("invalidPassword")
    cy.get('button[type="submit"]').click()
    cy.contains(/falsch.*passwort|passwort.*falsch/i).should("exist")
  })
})
