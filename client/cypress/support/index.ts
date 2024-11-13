// cypress/support/index.ts

// Import custom commands
import './commands';

// Optionally, configure any global Cypress event listeners here
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on uncaught exceptions
  return false;
});

// Import any additional setup or libraries if needed

// You can set up other global configuration or utilities here
// For example, if you wanted to configure the viewport globally:
Cypress.Commands.overwrite('viewport', (originalFn, width, height, options) => {
  return originalFn(width || 1280, height || 720, options); // Default viewport if none specified
});

