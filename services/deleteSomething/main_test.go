package main

import (
	"bytes"
	"fmt"
	"net/http"
	"os"
	"testing"

	"github.com/Marne-Software/serverless-template/services/helpers"
	"github.com/stretchr/testify/assert"
)

// Define testID as a global variable
var testID = "deleteSomethingTestID"

func TestDeleteSomethingHandler(t *testing.T) {
	stage := os.Getenv("STAGE")
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:4000" // Default base URL for local tests
	}

	tableName := "serverlessTemplate-" + stage + "-somethingsTable" // Default table name for local tests

	// Ensure the test item exists before testing the deletion
	helpers.DeleteTestItem(testID, tableName, t)
	helpers.PostTestItem(testID, "Delete Test", tableName, t)

	type testCase struct {
		Description      string
		ID               string // The path parameter
		ExpectedStatus   int
		ExpectedResponse string
	}

	tests := []testCase{
		{
			Description:      "Valid Request with Existing ID",
			ID:               testID,
			ExpectedStatus:   http.StatusOK,
			ExpectedResponse: `{"message": "Item successfully deleted!"}`,
		},
		{
			Description:      "Request with Non-Existing ID",
			ID:               "999",
			ExpectedStatus:   http.StatusOK, // Delete still returns success even if the item does not exist
			ExpectedResponse: `{"message": "Item successfully deleted!"}`,
		},
		{
			Description:      "Request with Missing ID",
			ID:               "",
			ExpectedStatus:   http.StatusForbidden,
			ExpectedResponse: `{"message":"Missing Authentication Token"}`,
		},
	}

	// Run test cases
	for _, tc := range tests {
		t.Run(tc.Description, func(t *testing.T) {
			url := baseURL + "/something"
			if tc.ID != "" {
				url += "/" + tc.ID
			}
			fmt.Println("Requesting URL:", url)

			// Make the DELETE request
			client := &http.Client{}
			req, err := http.NewRequest(http.MethodDelete, url, nil)
			assert.Nil(t, err, "Failed to create HTTP request")

			resp, err := client.Do(req)
			assert.Nil(t, err, "HTTP request failed")

			defer resp.Body.Close()
			buf := new(bytes.Buffer)
			buf.ReadFrom(resp.Body)
			body := buf.String()

			// Assert the status code
			assert.Equal(t, tc.ExpectedStatus, resp.StatusCode, "Unexpected status code")

			// Assert the response body
			assert.JSONEq(t, tc.ExpectedResponse, body, "Response body does not match")
		})
	}
}
