if (Cypress.env("STAGE") === "test") {
  describe("Investigation Checker", () => {
    it("It sends stale investigation email after two weeks", () => {
      cy.exec("node cypress/support/updateInvestTime.js", {
        failOnNonZeroExit: true,
      }).then((result) => {
        cy.log(result.stdout);
        cy.log(result.stderr);
      });

      cy.exec(
        'aws lambda invoke --function-name mcat-test-staleInvestigationsChecker --payload \'{}\' --cli-binary-format raw-in-base64-out /dev/stdout --no-verify-ssl --output json',
        { failOnNonZeroExit: false }
      ).then((result) => {
        // Log stdout and stderr to the Cypress runner for debugging
        cy.log("Command stdout:", result.stdout);
        cy.log("Command stderr:", result.stderr);

        // Debug the stdout
        console.log("Command stdout:", result.stdout);

        // Clean the stdout by removing any extraneous 'null' and trim whitespace
        let cleanedOutput = result.stdout.trim();
        if (cleanedOutput.startsWith('null')) {
          cleanedOutput = cleanedOutput.substring(4).trim();
        }

        // Parse and assert on the response
        try {
          const parsedResponse = JSON.parse(cleanedOutput);
          cy.log("Parsed Response:", JSON.stringify(parsedResponse));
          expect(parsedResponse.StatusCode).to.equal(200);
        } catch (error) {
          cy.log("Failed to parse JSON:", error.message);
          console.error("Failed to parse JSON:", error);
        }
        cy.mailosaurGetMessage("hylugahk", {
          sentTo: "admin@hylugahk.mailosaur.net",
          subject: "Stale Investigation: fsga_MIC_office_bat-cave",
        }).then((email) => {
          // Fetch the email from Mailosaur
          cy.mailosaurGetMessage("hylugahk", {
            sentTo: "admin@hylugahk.mailosaur.net",
            subject: "Stale Investigation: fsga_MIC_office_bat-cave",
          }).then((email) => {
            // Assert that the email exists
            expect(email).to.not.be.null; // Ensure the email is not null

            // Assert on email properties
            expect(email.subject).to.equal("Stale Investigation: fsga_MIC_office_bat-cave");
            expect(email.to[0].email).to.equal("admin@hylugahk.mailosaur.net");
          });
        });
      });
    });
  });
} else {
  console.log("Skipping Investigations E2E Tests: STAGE is not test");
}