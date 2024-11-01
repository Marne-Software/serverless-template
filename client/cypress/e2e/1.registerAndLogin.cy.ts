describe("Register", () => {
  before(() => {
    cy.mailosaurDeleteAllMessages("hylugahk");
    cy.exec("node cypress/support/deleteUser.js", {
      failOnNonZeroExit: true,
    // }).then((result) => {
    //   cy.log(result.stdout);
    //   cy.log(result.stderr);
    });

    cy.log("deleteUser.js executed.");
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
    cy.visit("/");
    cy.wait(250);
  });

  it("runs form verification successfully.", () => {
    cy.contains("Click here to register!").click();
    cy.get('input[name="firstName"]').type("John");
    cy.get('input[name="lastName"]').type("Doe");

    cy.contains("Register").click();

    cy.get('div[role="alert"] > div')
      .invoke("text")
      .then((text) => {
        expect(text).to.contain("All fields are required");
      })
      .then(() => {
        // Click the original element
        cy.get('div[role="alert"]').click();
      });

    cy.get('input[name="email"]').type("not an email");
    cy.get('select[name="post"]').select("fort-stewart");
    cy.get('input[name="position"]').type("Software Developer");
    cy.get('select[name="role"]').select("unconfirmedReq");
    cy.get('input[name="password"]').type("Password1!");
    cy.get('input[name="passConf"]').type("Password1!");

    cy.contains("Register").click();

    cy.get('div[role="alert"] > div')
      .invoke("text")
      .then((text) => {
        expect(text).to.contain("Invalid email address");
      });
  });

  it("sends email when registering and clicks verification link.", () => {
    cy.intercept("POST", "https://cognito-idp.us-east-1.amazonaws.com/").as(
      "createUser"
    );
    cy.intercept("https://mailosaur.com/api/messages/*").as("email");

    cy.contains("Click here to register!").click();
    cy.get('input[name="firstName"]').type("John");
    cy.get('input[name="lastName"]').type("Doe");
    cy.get('input[name="email"]').type(
      "mcat-" + Cypress.env("MCAT_USER") + "@hylugahk.mailosaur.net"
    );
    cy.get('select[name="post"]').select("fort-stewart");
    cy.get('input[name="position"]').type("Software Developer");
    cy.get('select[name="role"]').select("unconfirmedReq");
    cy.get('input[name="password"]').type("Password1!");
    cy.get('input[name="passConf"]').type("Password1!");

    cy.contains("Register").click();

    // Wait for the email to be sent
    cy.wait(3000);

    cy.mailosaurSearchMessages("hylugahk", {
      sentTo: "mcat-" + Cypress.env("MCAT_USER") + "@hylugahk.mailosaur.net",
    })
      .then((result) => {
        cy.log(`${result.items.length} matching messages found`);
        let emailSubjects = [];
        let linkEmailId;
        result.items.forEach((email) => {
          emailSubjects.push(email.subject);
          if (email.subject === "Your MCAT Verification Link") {
            linkEmailId = email.id;
          }
        });

        expect(emailSubjects).to.include("Your MCAT Verification Link");
        expect(emailSubjects).to.include("Welcome to MCAT");

        return cy.mailosaurGetMessageById(linkEmailId);
      })
      .then((firstEmail) => {
        // Extract the verification link from the email body
        const verificationLink = firstEmail.html.links.find(
          (link) => link.text === "here"
        ).href;
        cy.log(verificationLink);

        // Visit the verification link
        cy.visit(verificationLink);
        cy.log("stage: ", Cypress.env("STAGE"));
        // Return to the original site if necessary
        cy.visit("/").wait(250);

        if (Cypress.env("STAGE") !== "test") {
          cy.exec("node cypress/support/createUser.js", {
            failOnNonZeroExit: true,
          }).then((result) => {
            cy.log(result.stdout);
            cy.log(result.stderr);
          });
        }
      });
  });

  it("Logs in for the first time.", () => {
    Cypress.session.clearAllSavedSessions();
    cy.login();
    cy.visit("/");
    cy.contains("Just warming things up.").should("be.visible").wait(250);
    cy.wait("@user");

    cy.get("#building-drop-down").should(
      "contain",
      "Select a building to get started."
    );

    cy.get("#building-drop-down").click();

    // Clicks the second building (MIC)
    cy.get("a.bp5-menu-item").contains("MIC").click();
    cy.contains("Just warming things up.").should("be.visible");
    cy.wait("@building");
    cy.wait("@deviceData");

    // Adds building
    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();
    cy.contains("Just warming things up.").should("be.visible");
    cy.wait("@patchUser");
    cy.wait("@user");

    // Clicks Software Lab and adds it.
    cy.get("#building-drop-down").click();
    cy.get("a.bp5-menu-item").contains("Software Lab").click();
    cy.contains("Just warming things up.").should("be.visible");
    cy.wait("@building");
    cy.wait("@deviceData");

    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();
    cy.contains("Just warming things up.").should("be.visible");
    cy.wait("@patchUser");
    cy.wait("@buildings");
    cy.wait("@user");

    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();

    cy.contains("Email Sent").should("exist");
    cy.contains("Subscribed").should("not.exist");
    // Fetch AWS Notification - Subscription Confirmation email
    cy.mailosaurSearchMessages("hylugahk", {
      sentTo: "mcat-" + Cypress.env("MCAT_USER") + "@hylugahk.mailosaur.net",
    })
      .then((result) => {
        let linkEmailId;
        result.items.forEach((email) => {
          if (
            email.subject === "AWS Notification - Subscription Confirmation"
          ) {
            linkEmailId = email.id;
          }
        });

        return cy.mailosaurGetMessageById(linkEmailId);
      })
      .then((awsEmail) => {
        // Extract the verification link from the email body
        const verificationLink = awsEmail.html.links[0].href;
        cy.log(verificationLink);

        // Visit the verification link
        cy.visit(verificationLink);
      });
    cy.visit("/");
    cy.contains("Just warming things up.").should("be.visible").wait(500);
    cy.wait("@user");
    cy.wait("@buildings");
    cy.wait("@deviceData");

    cy.get(".Styles__FlexRow-sc-hr9o79-0.bhPqbn.addBuildingDropDown").click();

    cy.contains("Subscribed").should("exist");
    cy.contains("Email Sent").should("not.exist");

    cy.get("body").click();
  });
});
