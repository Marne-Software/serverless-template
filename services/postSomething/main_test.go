package main

import (
	"bytes"
	"net/http"
	"os"
	"testing"

	"github.com/Marne-Software/serverless-template/services/helpers"
	"github.com/stretchr/testify/assert"
)

// Define testID as a global variable
var testID = "postSomethingTestID"
func TestAPIIntegration(t *testing.T) {
	// Set up the base URL for the running API
	stage := os.Getenv("STAGE")
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:4000/api" // Default if environment variable is not set
	}

	tableName := "serverlessTemplate-" + stage + "-somethingsTable" // Table name for local DynamoDB

	helpers.DeleteTestItem(testID, tableName, t)

	type testCase struct {
		Description      string
		Body             string
		ExpectedStatus   int
		ExpectedResponse string
	}

	// Test cases
	tests := []testCase{
		{
			Description:      "Valid Request with ID and Name",
			Body:             `{"id":"` + testID + `","name":"Post Test"}`,
			ExpectedStatus:   http.StatusOK,
			ExpectedResponse: `{"message": "Item successfully added!"}`,
		},
	}

	// Run test cases
	for _, tc := range tests {
		t.Run(tc.Description, func(t *testing.T) {
			// Make the POST request
			resp, err := http.Post(baseURL+"/something", "application/json", bytes.NewBuffer([]byte(tc.Body)))
			assert.Nil(t, err, "HTTP request failed")

			// Read and parse the response
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
