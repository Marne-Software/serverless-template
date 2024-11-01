describe("Room Sensors", () => {
  beforeEach(() => {
    cy.intercept(Cypress.env("BASE_URL") + "/api/buildings?*").as("buildings");
    cy.intercept(Cypress.env("BASE_URL") + "/api/user/*").as("user");
    cy.intercept("PATCH", Cypress.env("BASE_URL") + "/api/user").as(
      "patchUser"
    );
    cy.intercept(Cypress.env("BASE_URL") + "/api/building/*").as("building");
    cy.intercept(Cypress.env("BASE_URL") + "/api/devices?*").as("deviceData");
    cy.intercept("DELETE", Cypress.env("BASE_URL") + "/api/devices?*").as(
      "delete"
    );
    cy.viewport(1920, 1080);
    cy.login();
    cy.visit("/");
    cy.wait("@user");
    cy.wait("@buildings");
    cy.wait("@deviceData");
  });
  const expandRoom = (roomName) => {
    return cy
      .contains(roomName)
      .parentsUntil(".roomContainer")
      .parent()
      .children()
      .eq(4)
      .click()
      .wait(500);
  };

  const collectRoomSensors = (roomName, sensorSet) => {
    return expandRoom(roomName).then(() => {
      cy.get(".bottomRoomDiv.roomExpanded")
        .find(".Styles__FlexRow-sc-hr9o79-0")
        .each(($nameElement) => {
          const sensor = $nameElement.text().trim();
          if (sensor && !/[%.]/.test(sensor) && !sensorSet.has(sensor)) {
            sensorSet.add(sensor);
          }
        })
        .then(() => {
          cy.log(
            `Collected Sensor Names (${roomName}):`,
            JSON.stringify(Array.from(sensorSet))
          );
        });
    });
  };

  const collectBulkSensors = (roomName, bulkSensorSet) => {
    cy.contains(roomName)
      .parent()
      .next()
      .within(() => {
        cy.get("div.Styles__FlexRow-sc-hr9o79-0.bhPqbn").each(($sensor) => {
          const sensorText = $sensor.text().trim();
          if (sensorText !== "All Sensors") {
            bulkSensorSet.add(sensorText);
          }
        });
      });
  };

  const sensors1 = new Set();
  const sensors2 = new Set();
  const sensors3 = new Set();
  const bulkSensors1 = new Set();
  const bulkSensors2 = new Set();
  const bulkSensors3 = new Set();

  it("Checks the first three rooms and makes sure sensors show up in bulk delete", () => {
    // Collect sensors for each room
    collectRoomSensors("office", sensors1)
      .then(() => collectRoomSensors("rm-101", sensors2))
      .then(() => collectRoomSensors("rm-102", sensors3))
      .then(() => {
        cy.get(
          ".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown"
        ).click();

        cy.get("button").contains("Remove Sensors").click();

        // Collect bulk sensors for each room
        ["officeMIC", "rm-101MIC", "rm-102MIC"].forEach((roomName, index) => {
          const bulkSensorSet = [bulkSensors1, bulkSensors2, bulkSensors3][
            index
          ];
          cy.get("div.Styles__FlexRow-sc-hr9o79-0.bhPqbn")
            .find("span.bp5-icon.bp5-icon-chevron-right")
            .eq(0)
            .click();
          collectBulkSensors(roomName, bulkSensorSet);
        });

        // Compare sensors to their respective bulkSensors
        cy.then(() => {
          const sensorsArray = [
            Array.from(sensors1),
            Array.from(sensors2),
            Array.from(sensors3),
          ].map((arr) => arr.sort());
          const bulkSensorsArray = [
            Array.from(bulkSensors1),
            Array.from(bulkSensors2),
            Array.from(bulkSensors3),
          ].map((arr) => arr.sort());

          sensorsArray.forEach((sensors, index) => {
            expect(sensors).to.have.length.above(0);
            const bulkSensors = bulkSensorsArray[index];
            expect(sensors).to.deep.equal(bulkSensors);
          });
        });
      });
  });

  it("Deletes the bat cave and kitchen sensors in office and verifies remaining sensors", () => {
    const sensorsToDelete = new Set<string>(["bat cave", "kitchen"]);
    const initialSensors = new Set<string>();
    const remainingSensors = new Set<string>();
    // Collect initial sensors for the office
    collectRoomSensors("office", initialSensors).then(() => {
      cy.log(
        "Initial Sensors (office):",
        JSON.stringify(Array.from(initialSensors))
      );

      // Filter out the sensors to be deleted
      const filteredSensors = Array.from(initialSensors).filter(
        (sensor) => !sensorsToDelete.has(sensor)
      );
      cy.log("Filtered Sensors:", JSON.stringify(filteredSensors));

      // Proceed with deletion
      cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();

      cy.get("button").contains("Remove Sensors").click();

      cy.get("div.Styles__FlexRow-sc-hr9o79-0.bhPqbn")
        .find("span.bp5-icon.bp5-icon-chevron-right")
        .eq(0)
        .click();

      cy.get("div.Styles__FlexRow-sc-hr9o79-0.bhPqbn")
        .contains("officeMIC")
        .parent()
        .next()
        .within(() => {
          cy.get("button.bp5-button.bp5-minimal.bp5-intent-primary").each(
            ($btn) => {
              cy.wrap($btn).should(
                "have.css",
                "background-color",
                "rgba(0, 0, 0, 0)"
              );
            }
          );

          cy.get("div.Styles__FlexRow-sc-hr9o79-0.bhPqbn").each(($sensor) => {
            const sensorName = $sensor.text().trim();
            if (sensorsToDelete.has(sensorName)) {
              cy.log(`Deleting sensor: ${sensorName}`);
              cy.wrap($sensor)
                .find("button.bp5-button.bp5-minimal.bp5-intent-primary")
                .click();
            }
          });
        });

      cy.get(
        'div[style="display: flex; align-items: center; margin-top: 50px;"]'
      ).within(() => {
        cy.get("div").should("have.text", "2");
      });

      cy.get(
        'div[style="display: flex; align-items: center; margin-top: 50px;"]'
      )
        .contains("Delete")
        .click()
        .wait("@delete");

      cy.get('div[role="alert"] > div')
        .invoke("text")
        .then((text) => {
          expect(text).to.contain("Devices deleted successfully!");
        });

      cy.get(".Toastify__toast--success") // Target the success toast
        .should("be.visible") // Ensure it's visible before interacting
        .contains("Devices deleted successfully!") // Further narrow down by checking the text
        .click();

      // Collect remaining sensors after delete
      collectRoomSensors("office", remainingSensors).then(() => {
        const remainingArray = Array.from(remainingSensors);

        // Assert that the remaining sensors match the initial sensors minus the deleted ones
        expect(remainingArray.sort()).to.deep.equal(filteredSensors.sort());
      });
    });
  });

  it("Makes sure if the room delete is selected all the sensors are selected and unchangeable then they all delete", () => {
    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();

    cy.get("button").filter(':contains("Remove Sensors")').click();

    cy.get("div.Styles__FlexRow-sc-hr9o79-0.bhPqbn")
      .find("span.bp5-icon.bp5-icon-chevron-right")
      .eq(1)
      .click();
    cy.get("div.Styles__FlexRow-sc-hr9o79-0.bhPqbn")
      .contains("rm-101MIC")
      .parent()
      .within(() => {
        cy.get("span.bp5-icon-trash").parent("button").click();
      });
    cy.get("div.Styles__FlexRow-sc-hr9o79-0.bhPqbn")
      .contains("rm-101MIC")
      .parent()
      .next()
      .within(() => {
        cy.get("button.bp5-button.bp5-minimal.bp5-intent-primary").each(
          ($btn) => {
            // Wrap the button to ensure Cypress commands are chained properly
            cy.wrap($btn)
              .click()
              .wait(500)
              .then(() => {
                // Check the background color of each button after clicking
                cy.wrap($btn).should(
                  "have.css",
                  "background-color",
                  "rgb(0, 69, 142)"
                );
              });
          }
        );
      });
    cy.get(
      'div[style="display: flex; align-items: center; margin-top: 50px;"]'
    ).within(() => {
      cy.get("div").should("have.text", "4");
    });
    cy.get('div[style="display: flex; align-items: center; margin-top: 50px;"]')
      .contains("Delete")
      .click()
      .wait("@delete");

    cy.get('div[role="alert"] > div')
      .invoke("text")
      .then((text) => {
        expect(text).to.contain("Rooms and devices deleted successfully!");
      });

    cy.get(".Toastify__toast--success") // Target the success toast
      .should("be.visible") // Ensure it's visible before interacting
      .contains("Rooms and devices deleted successfully!") // Further narrow down by checking the text
      .click();

    cy.reload();
    cy.wait("@user");
    cy.wait("@buildings");
    cy.wait("@deviceData");

    cy.get("div").should("not.contain", "rm-101");
  });
});
