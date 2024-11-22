package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/Marne-Software/serverless-template/services/helpers"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type Request struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

var dbClient *dynamodb.Client

func init() {
	dbClient = helpers.InitializeDynamoDBClient()
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	headers := helpers.GetDefaultHeaders()

	// Check if the request body is empty
	if request.Body == "" {
		fmt.Println("Error: Empty request body")
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers:    headers,
			Body:       `{"message": "Request body cannot be empty"}`,
		}, nil
	}

	// Unmarshal the request body into the Request struct
	var req Request
	if err := json.Unmarshal([]byte(request.Body), &req); err != nil {
		fmt.Printf("Error unmarshaling request body: %v\n", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers:    headers,
			Body:       `{"message": "Invalid request body"}`,
		}, nil
	}

	// Validate request fields
	if req.Name == "" {
		fmt.Println("Validation failed: Name field is empty")
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers:    headers,
			Body:       `{"message": "Name field is required"}`,
		}, nil
	}

	// Set a default ID if none is provided
	if req.Id == "" {
		req.Id = "f0c19de7-1aef-4a66-9a83-c15bd7b232e0"
	}

	stage := os.Getenv("STAGE")
	tableName := fmt.Sprintf("serverlessTemplate-%s-somethingsTable", stage)
	fmt.Printf("Using DynamoDB table: %s\n", tableName)

	// Check if the item already exists in DynamoDB
	getItemInput := &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: req.Id},
		},
	}

	result, err := dbClient.GetItem(ctx, getItemInput)
	if err != nil {
		fmt.Printf("Error checking item existence: %v\n", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    headers,
			Body:       `{"message": "Failed to check item existence"}`,
		}, err
	}

	// If the item exists, return a conflict response (409)
	if result.Item != nil {
		fmt.Printf("Item with ID %s already exists\n", req.Id)
		return events.APIGatewayProxyResponse{
			StatusCode: 409,
			Headers:    headers,
			Body:       `{"message": "Item with the same ID already exists"}`,
		}, nil
	}

	// Insert the item into DynamoDB
	putItemInput := &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item: map[string]types.AttributeValue{
			"id":   &types.AttributeValueMemberS{Value: req.Id},
			"name": &types.AttributeValueMemberS{Value: req.Name},
		},
	}

	_, err = dbClient.PutItem(ctx, putItemInput)
	if err != nil {
		fmt.Printf("Error inserting item into DynamoDB: %v\n", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    headers,
			Body:       `{"message": "Failed to put item"}`,
		}, err
	}

	fmt.Printf("Item with ID %s successfully added\n", req.Id)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    headers,
		Body:       `{"message": "Item successfully added!"}`,
	}, nil
}

func main() {
	lambda.Start(handler)
}
