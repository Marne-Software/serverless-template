describe("Building Drawer", () => {
  before(() => {});

  beforeEach(() => {
    cy.intercept(Cypress.env("BASE_URL") + "/api/buildings?*").as("buildings");
    cy.intercept(Cypress.env("BASE_URL") + "/api/building/*").as("building");
    cy.intercept(Cypress.env("BASE_URL") + "/api/user/*").as("user");
    cy.intercept(Cypress.env("BASE_URL") + "/api/devices?*").as("deviceData");
    cy.intercept("PATCH", Cypress.env("BASE_URL") + "/api/user").as(
      "patchUser"
    );
    cy.intercept("POST", Cypress.env("BASE_URL") + "/api/rooms").as(
      "postRooms"
    );
    cy.intercept("DELETE", Cypress.env("BASE_URL") + "/api/user").as(
      "deleteFromUser"
    );
    cy.viewport(1920, 1080);
    cy.login();
    cy.visit("/");
    // cy.contains("Just warming things up.").should("be.visible").wait(250);
    cy.wait("@user");
    cy.wait("@buildings");
    cy.wait("@deviceData");
  });

  it("Change default building, refresh and see if it stays default.", () => {
    // Click the second building
    cy.get(".Styles__FlexCol-sc-hr9o79-1 .Building__BuildingTab-sc-ffm4ta-3")
      .eq(1)
      .click({ force: true })
      .wait(500)
      .wait("@deviceData");

    // Click the setting button to see building settings
    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown")
      .click()
      .wait(500);

    cy.get("#default-switch").click({ force: true });

    cy.intercept("PATCH", Cypress.env("BASE_URL") + "/api/user", (req) => {
      cy.wait(1000).then(() => {
        req.continue(); // Continue with the original response after the delay
      });
    }).as("longerPatchUser");

    cy.contains("Just warming things up.").should("be.visible").wait(500);

    // Select the element and check its color
    let selectedElementName = "";

    cy.get(".Styles__FlexCol-sc-hr9o79-1 > .Building__BuildingTab-sc-ffm4ta-3")
      .each(($el) => {
        cy.wrap($el)
          .should("have.css", "color")
          .then((color) => {
            if (color.toString() === "rgb(255, 255, 255)") {
              selectedElementName = $el.text();
            }
          });
      })
      .then(() => {
        cy.log("Selected Element Name:", selectedElementName);
        expect(selectedElementName).to.not.be.empty;
      })
      .wait(1000);

    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown")
      .click()
      .wait('@patchUser')
      .wait('@user')
      .wait(250)
      
      cy.contains('Default building updated!').should('exist')

    cy.get("#default-switch")
      .then(($checkbox) => {
        // Log the checked state
        cy.log("Checkbox is checked: ", $checkbox.is(":checked"));
        // Assert the checkbox is checked
        expect($checkbox.is(":checked")).to.be.true;
      });

    // Selects the first building and makes sure isn't set to default anymore.
    cy.get("body").click();
    cy.get(".Styles__FlexCol-sc-hr9o79-1 .Building__BuildingTab-sc-ffm4ta-3")
      .eq(0)
      .click()
      .wait("@building")
      .wait("@deviceData");

    // Click the setting button to see building settings
    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();

    cy.get("#default-switch")
      // .find('input[type="checkbox"]')
      .should("not.be.checked") // Ensure the checkbox is not checked
      .then(($checkbox) => {
        $checkbox.is(":checked");
        // Log the checked state
        cy.log("Checkbox is checked:", $checkbox.is(":checked"));
        // Assert the checkbox is not checked
        expect($checkbox.is(":checked")).to.be.false;
      });
  });
  it("Checks if switching the building switches names.", () => {
    // Click on the first building tab
    cy.get(".Styles__FlexCol-sc-hr9o79-1 .Building__BuildingTab-sc-ffm4ta-3")
      .eq(0)
      .click()
      .wait("@building");

    // Get the name associated with the first building tab
    cy.contains(".Building__BuildingTab-sc-ffm4ta-3", "MIC")
      .should("be.visible")
      .invoke("text")
      .then((buildingName) => {
        buildingName = buildingName.trim(); // Trim any leading or trailing whitespace

        // Get the name associated with the dropdown
        cy.get("#building-drop-down")
          .find(".Styles__FlexRow-sc-hr9o79-0.bhPqbn")
          .should("contain", buildingName); // Ensure dropdown name matches building name
      });
  });
  it("Checks if you can add a building to favorites.", () => {
    cy.get("#building-drop-down").click();

    cy.get(".bp5-menu-item").eq(2).click();

    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();
    cy.contains("Just warming things up.").should("be.visible");
    cy.wait("@patchUser");
    cy.wait("@user");
    cy.wait("@deviceData");

    cy.get(
      ".Styles__FlexCol-sc-hr9o79-1.Building__BuildingContainer-sc-ffm4ta-0.djBISg.ggdHxq"
    )
      .find(
        ".Styles__FlexRow-sc-hr9o79-0.Building__BuildingTab-sc-ffm4ta-3.bhPqbn"
      )
      .should("have.length", 3)
      .then((children) => {
        const numberOfBuildings = children.length;
        cy.log(`Number of buildings: ${numberOfBuildings}`);
        expect(numberOfBuildings).to.equal(3);
      });
  });
  it("Checks if you can remove a building from favorites.", () => {
    // Click the third building
    cy.get(".Styles__FlexCol-sc-hr9o79-1 .Building__BuildingTab-sc-ffm4ta-3")
      .eq(2)
      .click()
      .wait("@building");

    // Click the setting button to see building settings
    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown")
      .click()
      .wait(500);

    cy.get(".bp5-drawer") // Select the parent div with class bp5-drawer
      .find("span.bp5-icon.bp5-icon-remove") // Find the specific span element within the parent div
      .click();
    cy.intercept("DELETE", Cypress.env("BASE_URL") + "/api/user", (req) => {
      cy.wait(1000).then(() => {
        req.continue(); // Continue with the original response after the delay
      });
    }).as("longerDeleteFromUser");

    cy.contains("Just warming things up.")
      .should("be.visible")
      .wait("@deleteFromUser")
      .wait("@user")
      .wait("@deviceData")
      .wait(500);

    cy.get(".Styles__FlexCol-sc-hr9o79-1 .Building__BuildingTab-sc-ffm4ta-3")
      .its("length")
      .then((length) => {
        // Store the length for further use
        const numberOfBuildings = length;
        // Now you can use numberOfBuildings for further assertions or actions
        // For example, you can log it to the Cypress console
        cy.log(`Number of buildings: ${numberOfBuildings}`);
        expect(numberOfBuildings).to.equal(2);
      });
  });
  it("Checks if the second buildings information is correct for the user and location", () => {
    // Load building table seed data
    cy.fixture("../../../services/seedData/buildingTableSeed.json").then(
      (buildingData) => {
        // Specify which building to test
        const buildingIndex = 1; // Change this index to test different buildings

        // Click the second building
        cy.get(
          ".Styles__FlexCol-sc-hr9o79-1 .Building__BuildingTab-sc-ffm4ta-3"
        )
          .eq(buildingIndex)
          .click()
          .wait("@building");

        // Click the setting button to see building settings
        cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown")
          .click()
          .wait(500);

        // Get the street
        cy.get(".bp5-drawer .Styles__FlexCol-sc-hr9o79-1 > div")
          .eq(1) // Selecting the second div child
          .invoke("text")
          .then((street) => {
            const expectedStreet = buildingData[buildingIndex].address.street; // Extracted from JSON data
            expect(street.trim()).to.equal(expectedStreet);
          });

        // Get the city, state, and zipcode
        cy.get(".bp5-drawer .Styles__FlexCol-sc-hr9o79-1 > div")
          .eq(2) // Selecting the third div child
          .invoke("text")
          .then((address) => {
            const [city, stateZip] = address.trim().split(", ");
            const [state, zipCode] = stateZip.split(" ");

            const expectedCity = buildingData[buildingIndex].address.city;
            const expectedState = buildingData[buildingIndex].address.state;
            const expectedZipCode = parseInt(
              buildingData[buildingIndex].address.zipCode
            ); // Convert to number

            expect(city).to.equal(expectedCity);
            expect(state).to.equal(expectedState);
            expect(parseInt(zipCode)).to.equal(expectedZipCode); // Convert to number
          });

        // Get the last name
        cy.get(".bp5-drawer .Styles__FlexCol-sc-hr9o79-1 > div")
          .eq(3) // Selecting the fourth div child
          .invoke("text")
          .then((name) => {
            const [lastName, firstName] = name.trim().split(", ");

            const expectedLastName =
              buildingData[buildingIndex].manager.lastName;
            const expectedFirstName =
              buildingData[buildingIndex].manager.firstName;

            expect(lastName).to.equal(expectedLastName);
            expect(firstName).to.equal(expectedFirstName);
          });

        // Get the email
        cy.get(".bp5-drawer .Styles__FlexCol-sc-hr9o79-1 > div")
          .eq(4) // Selecting the fifth div child
          .invoke("text")
          .then((email) => {
            const expectedEmail = buildingData[buildingIndex].manager.email;
            expect(email.trim()).to.equal(expectedEmail);
          });

        // Get the phone number
        cy.get(".bp5-drawer .Styles__FlexCol-sc-hr9o79-1 > div")
          .eq(5) // Selecting the sixth div child
          .invoke("text")
          .then((phoneNumber) => {
            const expectedPhoneNumber =
              buildingData[buildingIndex].manager.phoneNumber;
            expect(phoneNumber.trim()).to.equal(expectedPhoneNumber);
          });
      }
    );
  });
  it("Checks if it requires all input fields for adding rooms and adds two rooms", () => {
    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();
    cy.wait("@deviceData");

    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn")
      .filter(":has(span.bp5-icon-key)")
      .within(() => {
        // Click the dropdown menu
        cy.get(".bp5-icon-chevron-down").click();

        // Wait for the dropdown to open (if necessary)
        cy.wait(500); // Adjust the wait time as necessary

        // Find the input field and type "secret"
        cy.get('input[type="text"]').type("1");

        cy.get('svg[data-icon="add"]').click();
        // for form validation
        cy.get("span.bp5-icon-floppy-disk").click();
      });

    cy.get('div[role="alert"].Toastify__toast-body')
      .should("exist") // Ensure the alert exists
      .should("contain.text", "Fill In All Room Names");

    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn")
      .filter(":has(span.bp5-icon-key)")
      .within(() => {
        cy.get('input[type="text"]').eq(1).type("2");

        cy.get("span.bp5-icon-floppy-disk").click();
      });
    cy.contains("Just warming things up.").should("be.visible");
    cy.wait("@postRooms");

    cy.get("div.Room__TopDiv-sc-15z31zd-0")
      .find("div")
      .contains("1")
      .should("exist");
    cy.wait(200);
    cy.get("div.Room__TopDiv-sc-15z31zd-0")
      .eq(1) // Select the second instance (index 1 as it is zero-based)
      .find("div")
      .contains("2")
      .should("exist");
  });
});
