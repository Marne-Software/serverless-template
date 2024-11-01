const expandRoom = (roomName) => {
  return cy
    .get("div")
    .contains(roomName)
    .parentsUntil(".roomContainer")
    .parent()
    .children()
    .eq(4)
    .click()
    .wait("@deviceData");
};

const assertRoomExpanded = (roomName) => {
  cy.get("div")
    .contains(roomName)
    .parentsUntil(".roomContainer")
    .parent()
    .children()
    .eq(4)
    .find(".bp5-icon-chevron-up")
    .should("exist");
};

const assertRoomCollapsed = (roomName) => {
  cy.get("div")
    .contains(roomName)
    .parentsUntil(".roomContainer")
    .parent()
    .children()
    .eq(4)
    .find(".bp5-icon-chevron-down")
    .should("exist");
};

describe("Dashboard Features", () => {

  beforeEach(() => {
    cy.intercept(Cypress.env("BASE_URL") + "/api/buildings?*").as("buildings");
    cy.intercept(Cypress.env("BASE_URL") + "/api/building/*").as("building");
    cy.intercept(Cypress.env("BASE_URL") + "/api/devices?*").as("deviceData");
    cy.intercept(Cypress.env("BASE_URL") + "/api/user/*").as("user");

    cy.viewport(1920, 1080);
    cy.login();
    cy.visit("/");
    // cy.contains("Just warming things up.").should("be.visible");
    // Wait for the requests to be initiated
    cy.wait("@buildings");
    cy.wait("@deviceData");
    cy.wait("@user");
  });
  

  it("Checks if the caution button and trash icon are present.", () => {
    cy.get("#nav-bar").then(($divElement) => {
      // Find the child element with classes 'bp5-icon' and 'bp5-icon-warning-sign'
      const warningIcon = $divElement.find(".bp5-icon.bp5-icon-warning-sign");

      // Assert that the warning icon does not exist within the div element
      expect(warningIcon).to.not.exist;
    });

    expandRoom("office");

    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn")
      .contains("bat cave")
      .parent()
      .then(($parentDiv) => {
        // Find the child element with the data-icon attribute set to "trash"
        const trashIcon = $parentDiv.find(
          '.bp5-icon.bp5-icon-trash svg[data-icon="trash"]'
        );

        // Assert that the trash icon does not exist within the parent div element
        expect(trashIcon).to.not.exist;
      });
  });

  it("Checks if you can only open one room per column on the first page and then checks if changing page unexpands all rooms.", () => {
    expandRoom("office");
    assertRoomExpanded("office");

    expandRoom("rm-101");
    assertRoomCollapsed("office");
    assertRoomExpanded("rm-101");

    expandRoom("rm-103");
    assertRoomExpanded("rm-103");

    cy.get("svg[data-icon=chevron-down][height=32]").click();

    assertRoomCollapsed("rm-101");
    assertRoomCollapsed("rm-103");
  });

  it("Checks if you switch buildings, it collapses all rooms and starts on the first page with the correct amount of max rooms.", () => {
    cy.get("svg[data-icon=chevron-down][height=32]").click();

    expandRoom("rm-119");
    assertRoomExpanded("rm-119");
    expandRoom("rm-123");
    assertRoomExpanded("rm-123");
    expandRoom("rm-133");
    assertRoomExpanded("rm-133");

    cy.get(".Styles__FlexCol-sc-hr9o79-1 .Building__BuildingTab-sc-ffm4ta-3")
      .eq(1)
      .click();
    cy.contains("Just warming things up.")
      .should("be.visible")
      .wait("@building")
      .wait("@deviceData");

    cy.get(".Styles__FlexCol-sc-hr9o79-1.djBISg").should(
      "contain.text",
      "1 / 3"
    );

    cy.get(".swiper-slide.swiper-slide-active")
      .children()
      .each(($child) => {
        cy.wrap($child).find(".bp5-icon-chevron-down").should("exist");
      });
    cy.get("svg[data-icon=chevron-down][height=32]").click();

    expandRoom("rm-323");
    assertRoomExpanded("rm-323");

    expandRoom("rm-324");
    assertRoomCollapsed("rm-323");
    assertRoomExpanded("rm-324");

    expandRoom("rm-329");
    assertRoomExpanded("rm-329");

    expandRoom("rm-334");
    assertRoomExpanded("rm-334");

    cy.get("svg[data-icon=chevron-up][height=32]").click();

    cy.get(".swiper-slide.swiper-slide-active")
      .children()
      .each(($child) => {
        cy.wrap($child).find(".bp5-icon-chevron-down").should("exist");
      });
  });
});
