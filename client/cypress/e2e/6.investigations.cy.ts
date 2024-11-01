interface ILog {
  timeHour: number;
  temperature: number;
  humidity: number;
  timeExact: number;
  location: string;
}

const addEntriesEveryHour = (startHour) => {
  const interval = 3600; // 1 hour in seconds
  const entries: ILog[] = [
    {
      timeHour: 0,
      temperature: 89.3,
      humidity: 85,
      timeExact: 0,
      location: "bat-cave",
    },
    {
      timeHour: 0,
      temperature: 89.3,
      humidity: 85,
      timeExact: 0,
      location: "bat-cave",
    },
    {
      timeHour: 0,
      temperature: 89.3,
      humidity: 85,
      timeExact: 0,
      location: "bat-cave",
    },
  ];

  cy.wrap(entries, { log: false }).each((entry, i) => {
    const currentTimeHour = startHour + i * interval;
    (entry as unknown as ILog).timeHour = currentTimeHour;

    const entryString = JSON.stringify(entry);

    cy.exec(`node cypress/support/publishIot.js '${entryString}'`, {
      failOnNonZeroExit: false,
    }).then((result) => {
      cy.log(`Output for entry ${i}: ${result.stdout}`);
      cy.log(`Error for entry ${i}: ${result.stderr}`);
      if (result.code !== 0) {
        throw new Error(
          `Command failed with code ${result.code}: ${result.stderr}`
        );
      }
    });

    // Fast forward time by 1 hour
    cy.clock(currentTimeHour * 1000, { log: false }); // Convert to milliseconds
    cy.tick(3600 * 1000, { log: false }); // Move time forward by 1 hour in milliseconds
  });
};

describe("Investigations", () => {
  beforeEach(() => {
    cy.intercept(Cypress.env("BASE_URL") + "/api/buildings?*").as(
      "buildings"
    );
    cy.intercept(Cypress.env("BASE_URL") + "/api/user/*").as("user");
    cy.intercept("PATCH", Cypress.env("BASE_URL") + "/api/user").as(
      "patchUser"
    );
    cy.intercept(Cypress.env("BASE_URL") + "/api/building/*").as("building");
    cy.intercept(Cypress.env("BASE_URL") + "/api/devices?*").as("deviceData");
    cy.intercept("PATCH", Cypress.env("BASE_URL") + "/api/investigation").as("patchInvestigation");
    cy.viewport(1920, 1080);
    cy.clock(); // Initialize the clock at the start of the test
    cy.login();
    cy.visit("/");
    cy.wait("@user");
    cy.wait("@deviceData");
    cy.get('svg[data-icon="warning-sign"]').click().wait("@deviceData");
  });

  if (Cypress.env("STAGE") === "test") {
    it("Triggers an investigation", () => {

      cy.contains("Nothing to report.").should("exist");

      cy.exec("node cypress/support/createIoT.js", {
        failOnNonZeroExit: true,
        timeout: 60000,
      }).then((result) => {
        cy.log(result.stdout);
        cy.log(result.stderr);
      });

      cy.exec("node cypress/support/deleteIoT.js", {
        failOnNonZeroExit: true,
        timeout: 60000,
      }).then((result) => {
        cy.log(result.stdout);
        cy.log(result.stderr);
      });

      cy.exec("node cypress/support/createIoT.js", {
        failOnNonZeroExit: true,
        timeout: 60000,
      }).then((result) => {
        cy.log(result.stdout);
        cy.log(result.stderr);
      });

      cy.fixture("../../../services/seedData/deviceTableSeed.json").then(
        (jsonData) => {
          const startHour = jsonData[0].timeHour + 3600;
          addEntriesEveryHour(startHour);
        }
      );

      cy.reload().wait(250);
      cy.wait("@user");
      cy.wait("@deviceData");

      cy.get("#investigations-container", { timeout: 10000 }) // Wait for the container to load properly
        .should("exist")
        .should("be.visible") // Ensure the container is visible again
        .children()
        .should("have.length", 1);

      cy.mailosaurGetMessage("hylugahk", {
        sentTo: "mcat-" + Cypress.env("MCAT_USER") + "@hylugahk.mailosaur.net",
        subject: "Room office in building MIC needs your attention - MCAT",
      }).then((email) => {
        cy.log("Latest email subject: " + email.subject);

        expect(email.text.body).to.contain(
          "The sensor in the location of bat-cave has been RED for 3 hours please act accordingly."
        );
      });
    });
  } else {
    console.log("Skipping Investigations E2E Tests: STAGE is not test");
  }

  it("Adds an action", () => {
    cy.exec("node cypress/support/addInvestigation.js", {
      failOnNonZeroExit: true,
      timeout: 60000,
    }).then((result) => {
      cy.log(result.stdout);
      cy.log(result.stderr);
    }); 

    cy.reload().wait(1000);
    cy.wait("@user");
    cy.wait("@deviceData");

    cy.get('#investigations-container')
    .children()
    .first()
    .click()
    .contains("Select an Action")

    cy.get('select[name="action"]').select("Investigation Report");

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 16);
    cy.get('input[type="datetime-local"]').type(formattedDate);

    cy.get('input[name="item1"]').check({force: true});
    cy.get('input[name="item2"]').check({force: true});
    cy.get('input[name="item3"]').check({force: true});

    cy.get('textarea[placeholder="Work Order Details"]').type("Needs work order.");

    cy.contains("SUBMIT").click()
    cy.wait("@patchInvestigation")

    cy.contains('Investigation Report');
    cy.get("#investigation-actions").contains("Investigation Report").should("exist")

    if (Cypress.env("STAGE") === "test") {
      cy.mailosaurGetMessage("hylugahk", {
        sentTo: "mcat-" + Cypress.env("MCAT_USER") + "@hylugahk.mailosaur.net",
        subject: "Investigation Updated in building MIC - MCAT",
      }).then((email) => {
        expect(email).to.exist;
      });
    }
  })
});


