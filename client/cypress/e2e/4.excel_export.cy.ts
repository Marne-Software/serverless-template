import * as xlsx from "xlsx";
import { reverseDateParser } from "../../src/Helpers";

function mapExcelDataToJson(sheetData, id) {
  const mappedData = sheetData.map((row) => {
    // Parse the date string and convert it to Unix timestamp
    const timestamp = reverseDateParser(row["Time"]);

    return {
      id: id,
      timeHour: timestamp,
      temperature: row["Temperature"],
      humidity: row["Humidity"],
      status: row["Status"],
    };
  });

  return mappedData;
}
// Function to compare data
function compareData(mappedData, expectedData) {
  // Ensure the lengths are equal before comparing
  expect(mappedData).to.have.lengthOf(expectedData.length);

  // Compare each item in the mapped data with the expected data
  mappedData.forEach((mappedItem, index) => {
    const expectedItem = expectedData[index];

    // Compare properties of each item
    expect(mappedItem.id).to.equal(expectedItem.id);
    expect(mappedItem.timeHour).to.equal(expectedItem.timeHour);
    expect(mappedItem.temperature).to.equal(expectedItem.temperature);
    expect(mappedItem.humidity).to.equal(expectedItem.humidity);
  });
}

describe("excel download", () => {
  beforeEach(() => {
    cy.intercept(Cypress.env("BASE_URL") + "/api/buildings?*").as("buildings");
    cy.intercept(Cypress.env("BASE_URL") + "/api/user/*").as("user");
    cy.intercept(Cypress.env("BASE_URL") + "/api/building/*").as("building");
    cy.intercept(Cypress.env("BASE_URL") + "/api/devices?*").as("deviceData");
    cy.intercept(Cypress.env("BASE_URL") + "/api/download?*").as("download");
    cy.viewport(1920, 1080);
    cy.login();
    cy.visit("/");
    cy.wait("@user");
    cy.wait("@buildings");
    cy.wait("@deviceData");
  });

  it("Downloads the files and checks data to see if it matches JSON", () => {
    cy.get("#nav-bar")
      .find(".bp5-icon-import") // Select the import button within the specified container
      .click();

    cy.get("div")
      .contains("office")
      .parentsUntil(".roomContainer")
      .parent()
      .children()
      .eq(4)
      .click();

    // Click the checkbox for the first room
    cy.get("div")
      .contains("office")
      .parentsUntil(".roomContainer")
      .get("div")
      .contains("bat cave")
      .children()
      .first()
      .click();

    // Click the checkbox for the second room
    cy.get("div")
      .contains("office")
      .parentsUntil(".roomContainer")
      .get("div")
      .contains("kitchen")
      .children()
      .first()
      .click();

    cy.contains("DOWNLOAD").click({ force: true }).wait("@download");

    const filePath = "./cypress/downloads/devices.xlsx";
    // Read the downloaded file
    cy.readFile(filePath, "binary").then((fileContent) => {
      const workbook = xlsx.read(fileContent, { type: "binary" });

      // Process data from the first sheet
      const sheet1Data = xlsx.utils.sheet_to_json(
        workbook.Sheets["THE-staticid987654"]
      );
      const mappedSheet1Data = mapExcelDataToJson(
        sheet1Data,
        "THE-staticid987654"
      );

      // Compare data from the first sheet
      cy.fixture("../../../services/seedData/deviceTableSeed.json").then(
        (deviceTableSeed) => {
          const expectedSheet1Data = deviceTableSeed.filter(
            (item) => item.id === "THE-staticid987654"
          );
          compareData(mappedSheet1Data, expectedSheet1Data);
        }
      );

      // Process data from the second sheet
      const sheet2Data = xlsx.utils.sheet_to_json(
        workbook.Sheets["THE-staticid876234"]
      );
      const mappedSheet2Data = mapExcelDataToJson(
        sheet2Data,
        "THE-staticid876234"
      );

      // Compare data from the second sheet
      cy.fixture("../../../services/seedData/deviceTableSeed.json").then(
        (deviceTableSeed) => {
          const expectedSheet2Data = deviceTableSeed.filter(
            (item) => item.id === "THE-staticid876234"
          );
          compareData(mappedSheet2Data, expectedSheet2Data);
        }
      );
    });
  });
});
