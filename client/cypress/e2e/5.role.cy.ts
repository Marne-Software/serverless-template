describe("Roles", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
  });

  beforeEach(() => {
    cy.intercept(Cypress.env("BASE_URL") + "/api/buildings?*").as("buildings");
    cy.intercept(Cypress.env("BASE_URL") + "/api/user/*").as("user");
    cy.intercept("PATCH", Cypress.env("BASE_URL") + "/api/user").as(
      "patchUser"
    );
    cy.intercept(Cypress.env("BASE_URL") + "/api/building/*").as("building");
    cy.intercept(Cypress.env("BASE_URL") + "/api/devices?*").as("deviceData");
    cy.viewport(1920, 1080);
    cy.login();
    cy.visit("/");
    // cy.contains("Just warming things up.").should("be.visible");
    cy.wait("@user");
    cy.wait("@buildings");
    cy.wait("@deviceData");
  });

  it("Changes role", () => {
    cy.get('svg[data-icon="warning-sign"]').should("not.exist");

    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();

    cy.get(".bp5-drawer").within(() => {
      cy.contains("Add Rooms").should("not.exist");
    });

    cy.document().then((doc) => {
      const { innerWidth: width, innerHeight: height } = doc.defaultView!;
      const centerX = width / 2;
      const centerY = height / 2;

      // Trigger click at the center of the viewport
      cy.get("body").trigger("mousedown", {
        clientX: centerX,
        clientY: centerY,
      });
      cy.get("body").trigger("mouseup", { clientX: centerX, clientY: centerY });
      cy.get("body").trigger("click", { clientX: centerX, clientY: centerY });
    });

    cy.task(
      "changeUserRoleToRequester",
      "mcat-" + Cypress.env("MCAT_USER") + "@hylugahk.mailosaur.net"
    ).then(() => {
      // You can add additional assertions or actions here if needed
      cy.log("User role updated to requester");
    });

    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();

    Cypress.session.clearAllSavedSessions();
    cy.login();
    cy.visit("/");
    cy.contains("Just warming things up.").should("be.visible");
    cy.wait(250);
    cy.get('svg[data-icon="warning-sign"]').should("exist");
    cy.get('svg[data-icon="import"]').should("exist");
  });
});
