describe("Homepage", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    cy.login();
    cy.visit("/");
  });

  beforeEach(() => {
    cy.login();
    cy.intercept(Cypress.env("API_URL") + "/something/*").as("getSomething");
    cy.intercept("POST", Cypress.env("API_URL") + "/something").as("postSomething");
    cy.intercept("PATCH", Cypress.env("API_URL") + "/something").as("patchSomething");
    cy.intercept("DELETE", Cypress.env("API_URL") + "/something/*").as("deleteSomething");
    cy.viewport(1920, 1080);
    cy.visit("/");
    cy.wait("@getSomething")
    cy.wait(250);
  });

  it("Makes a post.", () => {
    cy.get('input[name="name"]').type("test");
    cy.contains("Post").click()
    cy.wait("@postSomething");
    cy.contains("Item successfully added!").should("exist");
    cy.contains("test").should("exist");
  });

  it("Makes a patch.", () => {
    cy.get('input[name="name"]').type("test 2");
    cy.contains("Patch").click()
    cy.wait("@patchSomething");
    cy.contains("Item successfully updated!").should("exist");
    cy.contains("test 2").should("exist");
  });

  it("Makes a delete.", () => {
    cy.contains("test 2").should("exist");
    cy.contains("Delete").click()
    cy.wait("@deleteSomething");
    cy.contains("Item successfully deleted!").should("exist");
    cy.contains("test 2").should("not.exist");
  });

  it("Logs out.", () => {
    cy.contains("Log Out").click()
    cy.url().should("include", "/login");
  });
});
