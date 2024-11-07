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
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type Something struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

var dbClient *dynamodb.Client

func init() {
	dbClient = helpers.InitializeDynamoDBClient()
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	headers := helpers.GetDefaultHeaders()
	stage := os.Getenv("STAGE")

	// Retrieve the id from the path parameters
	id, exists := request.PathParameters["id"]
	if !exists || id == "" {
		fmt.Println("ID not provided in path parameters")
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers:    headers,
			Body:       `{"message": "ID not provided in path parameters"}`,
		}, nil
	}

	// Set up DynamoDB query input
	input := &dynamodb.QueryInput{
		TableName:              aws.String("serverlessTemplate-" + stage + "-somethingsTable" ),
		KeyConditionExpression: aws.String("id = :id"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":id": &types.AttributeValueMemberS{Value: id},
		},
	}

	// Execute the DynamoDB query
	result, err := dbClient.Query(ctx, input)
	if err != nil {
		fmt.Printf("Failed to query items: %v\n", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    headers,
			Body:       `{"message": "Failed to query items"}`,
		}, err
	}

	// Check if no items were found and return 404
	if len(result.Items) == 0 {
		fmt.Printf("No items found with id %s\n", id)
		return events.APIGatewayProxyResponse{
			StatusCode: 404,
			Headers:    headers,
			Body:       fmt.Sprintf(`{"message": "No items found with id %s"}`, id),
		}, nil
	}

	// Unmarshal the query results into a slice of Something structs
	var items []Something
	err = attributevalue.UnmarshalListOfMaps(result.Items, &items)
	if err != nil {
		fmt.Printf("Failed to unmarshal items: %v\n", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    headers,
			Body:       `{"message": "Failed to process items"}`,
		}, err
	}

	// Convert the unmarshaled items to JSON for the response body
	responseJSON, err := json.Marshal(items)
	if err != nil {
		fmt.Printf("Failed to marshal items: %v\n", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    headers,
			Body:       `{"message": "Failed to process items"}`,
		}, err
	}

	// Successful response
	return events.APIGatewayProxyResponse{
		Headers:    headers,
		StatusCode: 200,
		Body:       string(responseJSON),
	}, nil
}

func main() {
	lambda.Start(handler)
}
