import { reverseDateParser } from "../../src/Helpers";

describe("Dashboard Features", () => {
  beforeEach(() => {
    cy.intercept(Cypress.env("BASE_URL") + "/api/buildings?*").as("buildings");
    cy.intercept(Cypress.env("BASE_URL") + "/api/user/*").as("user");
    cy.intercept(Cypress.env("BASE_URL") + "/api/building/*").as("building");
    cy.intercept(Cypress.env("BASE_URL") + "/api/devices?*").as("deviceData");
    cy.viewport(1920, 1080);
    cy.login();
    cy.visit("/");

    // Wait for the `@user` request to be initiated
    cy.wait("@user");

    // Ensure the other requests are completed
    cy.wait("@buildings");
    cy.wait("@deviceData");
  });

  const selectOfficeRoom = () => {
    cy.log("selectOfficeRoom");
    return cy
      .get(".swiper-slide.swiper-slide-active")
      .contains("office")
      .parent()
      .parent()
      .parent()
      .children()
      .eq(2)
      .click()
      .parent()
      .siblings(".bottomRoomDiv")
      .contains("bat cave")
      .click({ force: true })
      .parent()
      .parent()
      .parent()
      .parent()
      .children()
      .first()
      .children()
      .eq(2)
      .click();
  };

  const selectNotOfficeRoom = () => {
    cy.log("selectNotOfficeRoom");
    return cy
      .get(".swiper-slide.swiper-slide-active")
      .contains("office")
      .parent()
      .parent()
      .parent()
      .children()
      .eq(2)
      .click()
      .parent()
      .siblings(".bottomRoomDiv")
      .contains("kitchen")
      .click();
  };

  const openOfficeDialog = () => {
    cy.log("openOfficeDialog");
    return cy
      .get(".swiper-slide.swiper-slide-active")
      .contains("office")
      .parent()
      .parent()
      .parent()
      .children()
      .first()
      .children()
      .eq(1)
      .click();
  };
  const verifyDialogContents = (location, room) => {
    cy.log("verifyDialogContents");
    cy.get(".bp5-dialog")
      .should("be.visible")
      .children()
      .first()
      .children()
      .eq(2)
      .contains(location);
    cy.get(".bp5-dialog")
      .should("be.visible")
      .children()
      .first()
      .children()
      .eq(2)
      .contains(room);
  };
  it("Opens with selected device in room.", () => {
    selectOfficeRoom();
    openOfficeDialog();
    verifyDialogContents("bat cave", "office");
  });
  it("Toggles data when selected room is toggled.", () => {
    selectOfficeRoom();
    selectNotOfficeRoom();
    openOfficeDialog();
    cy.fixture("../../../services/seedData/deviceTableSeed.json").then(
      (jsonData) => {
        cy.get("table > tr")
          .eq(1)
          .children()
          .eq(1)
          .invoke("text")
          .then((text) => {
            const numberInsideDiv = parseInt(text.trim(), 10);
            expect(numberInsideDiv).to.not.equal(jsonData[0].temperature);
          });
        cy.get("table > tr")
          .eq(1)
          .children()
          .eq(2)
          .invoke("text")
          .then((text) => {
            const numberInsideDiv = parseFloat(text.trim());
            expect(numberInsideDiv).to.not.equal(jsonData[0].humidity);
          });
        cy.get(".bp5-dialog")
          .contains("bat cave")
          .click({ force: true })
          .wait(500);

        cy.get(".bp5-dialog").within(() => {
          cy.get("table > tr")
            .eq(1)
            .children()
            .eq(2)
            .invoke("text")
            .then((text) => {
              const numberInsideDiv = parseFloat(text.trim());
              expect(numberInsideDiv).to.equal(jsonData[0].temperature);
            });

          cy.get("table > tr")
            .eq(1)
            .children()
            .eq(3)
            .invoke("text")
            .then((text) => {
              const numberInsideDiv = parseFloat(text.trim());
              expect(numberInsideDiv).to.equal(jsonData[0].humidity);
            });
        });
      }
    );
  });
  it("Paginates correctly with 24 hours.", () => {
    // Open the room dialog
    openOfficeDialog();

    // Verify the initial table length
    cy.get(".bp5-dialog table tr").should("have.length", 25);

    // Select the page size as 12
    cy.get(".bp5-html-select").click();
    cy.get('.bp5-html-select select[name="pageSize"]').select("12");
    cy.get('.bp5-html-select select[name="pageSize"]').should(
      "have.value",
      "12"
    );

    // Verify the updated table length after selecting page size
    cy.get(".bp5-dialog table tr").should("have.length", 13);

    // Extract and store the time from page 2
    let timePage2;
    let timePage1;
    cy.get("table > tr")
      .eq(1)
      .children()
      .eq(1)
      .invoke("text")
      .then((text) => {
        timePage1 = reverseDateParser(text);
        cy.log(timePage1);
      });
    // Click on right arrow to change to page 2 and verify it's page 2
    cy.get('svg[data-icon="chevron-right"]').click().wait(500);

    cy.contains("Page 2").should("exist");

    // Extract and store the time from page 1 and check if the difference is 12 hours or 43,200 seconds
    cy.get("table > tr")
      .eq(1)
      .children()
      .eq(1)
      .invoke("text")
      .then((text) => {
        timePage2 = reverseDateParser(text);
        cy.log(timePage2);
        // Compare the times
        const timeDifferenceSeconds = timePage1 - timePage2;
        expect(timeDifferenceSeconds).to.eq(43200); // Assert time difference is 12 hours
      });

    // Click on left arrow to change to page 1 and verify it's page 1
    cy.get('svg[data-icon="chevron-left"]').click().wait(500);

    cy.contains("Page 1").should("exist");
  });
  it("Paginates correctly with 48 hours generated rather than just 24.", () => {
    // Open the room dialog
    openOfficeDialog();

    // Verify the initial table length
    cy.get(".bp5-dialog table tr").should("have.length", 25);

    cy.contains("Page 1 of 3").should("exist");

    cy.get('svg[data-icon="chevron-right"]').click().wait(500);

    cy.contains("Page 2").should("exist");

    cy.get(".bp5-dialog table tr").should("have.length", 25);

    cy.get('svg[data-icon="chevron-right"]').click().wait(500);

    cy.contains("Page 3").should("exist");

    cy.get(".bp5-dialog table tr").should("have.length", 3);

    // Go back to page 2
    cy.get('svg[data-icon="chevron-left"]').click().wait(500);
    // Go back to page 1
    cy.get('svg[data-icon="chevron-left"]').click().wait(500);

    // Select the page size as 12
    cy.get(".bp5-html-select").click().wait(250);
    cy.get('.bp5-html-select select[name="pageSize"]').select("12");
    cy.get('.bp5-html-select select[name="pageSize"]').should(
      "have.value",
      "12"
    );

    // Verify the updated table length after selecting page size
    cy.get(".bp5-dialog table tr").should("have.length", 13);

    let timePage1, timePage2, timePage3, timePage4, timePage5;

    // Extract and store the time from page 1
    cy.get("table > tr")
      .eq(1)
      .children()
      .eq(1)
      .invoke("text")
      .then((text) => {
        timePage1 = reverseDateParser(text);
        cy.log(timePage1);
      });

    // Click on the right arrow to change to page 2 and verify it's page 2
    cy.get('svg[data-icon="chevron-right"]').click().wait(500);

    cy.contains("Page 2").should("exist");

    // Extract and store the time from page 2 and compare it to page 1
    cy.get("table > tr")
      .eq(1)
      .children()
      .eq(1)
      .invoke("text")
      .then((text) => {
        timePage2 = reverseDateParser(text);
        cy.log(timePage2);
        // Compare the times and assert the difference is 12 hours or 43,200 seconds
        const timeDifferenceSeconds = timePage1 - timePage2;
        expect(timeDifferenceSeconds).to.eq(43200);
      });

    // Click on the right arrow to change to page 3 and verify it's page 3
    cy.get('svg[data-icon="chevron-right"]').click().wait(500);

    cy.contains("Page 3").should("exist");

    // Extract and store the time from page 3 and compare it to page 2
    cy.get("table > tr")
      .eq(1)
      .children()
      .eq(1)
      .invoke("text")
      .then((text) => {
        timePage3 = reverseDateParser(text);
        cy.log(timePage3);
        // Compare the times and assert the difference is 12 hours or 43,200 seconds
        const timeDifferenceSeconds = timePage2 - timePage3;
        expect(timeDifferenceSeconds).to.eq(43200);
      });

    // Click on the right arrow to change to page 4 and verify it's page 4
    cy.get('svg[data-icon="chevron-right"]').click().wait(500);

    cy.contains("Page 4").should("exist");

    // Extract and store the time from page 4 and compare it to page 3
    cy.get("table > tr")
      .eq(1)
      .children()
      .eq(1)
      .invoke("text")
      .then((text) => {
        timePage4 = reverseDateParser(text);
        cy.log(timePage4);
        // Compare the times and assert the difference is 12 hours or 43,200 seconds
        const timeDifferenceSeconds = timePage3 - timePage4;
        expect(timeDifferenceSeconds).to.eq(43200);
      });
  });

  it("Filters correctly.", () => {
    const today = new Date();

    // Set startTime to two days before today
    const startTimeDate = new Date(today);
    startTimeDate.setDate(today.getDate() - 2); // Two days before today
    const startTime = startTimeDate.toISOString().split("T")[0]; // Format to YYYY-MM-DD

    // Set endTime to one day before today
    const endTimeDate = new Date(today);
    endTimeDate.setDate(today.getDate() - 1); // One day before today
    const endTime = endTimeDate.toISOString().split("T")[0]; // Format to YYYY-MM-DD

    selectOfficeRoom();
    openOfficeDialog();

    // Set start and end times
    cy.get("input[name=startTime]").type(startTime);
    cy.get("input[name=endTime]").type(endTime);
    cy.contains("Filter").click().wait("@deviceData");
    cy.contains("Page 1 of 2").should("exist");

    // Verify the initial table length
    cy.get(".bp5-dialog table tr").should("have.length", 25);

    cy.get("input[name=minTemp]").type("60");
    cy.get("input[name=maxTemp]").type("70");

    cy.contains("Filter").click().wait("@deviceData");
    cy.contains("Page 1 of 1").should("exist");

    cy.get(".bp5-dialog table tr").should("have.length", 15);

    // Select the page size as 12
    cy.get(".bp5-html-select").click();
    cy.get('.bp5-html-select select[name="pageSize"]').select("12");
    cy.get('.bp5-html-select select[name="pageSize"]').should(
      "have.value",
      "12"
    );

    cy.contains("Page 1 of 2").should("exist");

    cy.get(".bp5-dialog table tr").should("have.length", 13);

    // Click on the right arrow to change to page 3 and verify it's page 3
    cy.get('svg[data-icon="chevron-right"]').click().wait(500);

    cy.get(".bp5-dialog table tr").should("have.length", 3);
  });
});
