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
var testID = "getSomethingTestID"


func TestGetSomethingHandler(t *testing.T) {
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:4000" // Default base URL for local tests
	}

	tableName := "serverlessTemplate-local-somethingsTable" // Default table name for local tests

	helpers.DeleteTestItem(testID, tableName, t)
	helpers.PostTestItem(testID, "Get Test", tableName, t)

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
			ExpectedResponse: fmt.Sprintf(`[{"id":"%s","name":"Get Test"}]`, testID),
		},
		{
			Description:      "Request with Non-Existing ID",
			ID:               "999",
			ExpectedStatus:   http.StatusNotFound,
			ExpectedResponse: `{"message": "No items found with id 999"}`,
		},
		{
			Description:      "Request with Missing ID",
			ID:               "",
			ExpectedStatus:   http.StatusForbidden,
			ExpectedResponse: `{"message": "Missing Authentication Token"}`,
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

			// Make the GET request
			resp, err := http.Get(url)
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
