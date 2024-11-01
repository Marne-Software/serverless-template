/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(): Chainable<Subject>;
    parseXlsx(inputFile: string): Chainable<Subject>;
    logWorkingDirectory(): Chainable<Subject>;
    fileExists(filePath: string): Chainable<Subject>;
    executeDeleteUserScript(): Chainable<Subject>; // Add the new command declaration
  }
}

Cypress.Commands.add("login", () => {
  cy.session(
    "mcat-" + Cypress.env("MCAT_USER") + "@hylugahk.mailosaur.net",
    () => {
      cy.visit("/");
      cy.wait(1000);
      // Login process
      cy.get('input[name="email"]').type(
        "mcat-" + Cypress.env("MCAT_USER") + "@hylugahk.mailosaur.net"
      );
      cy.get('input[name="password"]').type("Password1!");
      cy.contains("Login").click({ force: true });
      cy.location("pathname").should("eq", "/");
    },
    {
      cacheAcrossSpecs: true,
    }
  );
});

Cypress.Commands.add("parseXlsx", (inputFile) => {
  return cy.task("parseXlsx", { filePath: inputFile });
});

Cypress.Commands.add("logWorkingDirectory", () => {
  cy.exec("pwd").then(({ stdout }) => {
    cy.log(`Current working directory: ${stdout.trim()}`);
  });
});

Cypress.Commands.add("fileExists", (filePath: string) => {
  return cy.task("fileExists", filePath);
});
