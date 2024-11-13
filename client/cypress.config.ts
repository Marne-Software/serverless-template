/// <reference types="node" />
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // The base URL for the application under test
    baseUrl: 'http://localhost:3000', // Change to your app's URL

    // Configure the viewport size
    viewportWidth: 1280,
    viewportHeight: 720,

    // Default command timeout in milliseconds
    defaultCommandTimeout: 15000,

    // Path to support file (set to false to disable)
    supportFile: './cypress/support/index.ts',

    // Set up test retries
    retries: {
      runMode: 2, // Number of retries for `cypress run`
      openMode: 0, // Number of retries for `cypress open`
    },

    // Define custom reporter if needed
    reporter: 'spec',

    // Enables video recording for each test
    video: false,

    // Set up any environment variables for Cypress
    env: {
      LOGIN_EMAIL: 'salem.ezz@gmail.com',
      LOGIN_PASSWORD: 'Password1!',
      API_URL: process.env.API_URL
    },

    // Define test patterns or directories
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',

    // Event listeners can be added here
    setupNodeEvents(on, config) {
      // Example: Add tasks, custom event listeners, or plugins here
      return config;
    },
  },
});
