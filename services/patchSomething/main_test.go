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

var testID = "patchSomethingTestID"


func TestUpdateSomethingHandler(t *testing.T) {
	stage := os.Getenv("STAGE")
	if stage == "" {
		stage = "local"
	}
	tableName := "serverlessTemplate-" + stage + "-somethingsTable"

	helpers.DeleteTestItem(testID, tableName, t)
	helpers.PostTestItem(testID, "Patch Test", tableName, t)

	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:4000" // Default base URL for local tests
	}

	type testCase struct {
		Description      string
		RequestBody      string
		ExpectedStatus   int
		ExpectedResponse string
	}

	tests := []testCase{
		{
			Description:      "Valid Update Request",
			RequestBody:      fmt.Sprintf(`{"id":"%s","name":"Updated Name"}`, testID),
			ExpectedStatus:   http.StatusOK,
			ExpectedResponse: `{"message": "Item successfully updated!"}`,
		},
		{
			Description:      "Request with Missing Name",
			RequestBody:      fmt.Sprintf(`{"id":"%s"}`, testID),
			ExpectedStatus:   http.StatusBadRequest,
			ExpectedResponse: `{"message":"'id' and 'name' are required in the request body"}`,
		},
		{
			Description:      "Request with Missing ID",
			RequestBody:      `{"name":"Updated Name"}`,
			ExpectedStatus:   http.StatusBadRequest,
			ExpectedResponse: `{"message":"'id' and 'name' are required in the request body"}`,
		},
	}

	for _, tc := range tests {
		t.Run(tc.Description, func(t *testing.T) {
			// Create a PATCH request
			req, err := http.NewRequest(http.MethodPatch, baseURL+"/something", bytes.NewBuffer([]byte(tc.RequestBody)))
			assert.Nil(t, err, "Failed to create HTTP request")
	
			// Set the content type
			req.Header.Set("Content-Type", "application/json")
	
			// Make the HTTP request
			client := &http.Client{}
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
