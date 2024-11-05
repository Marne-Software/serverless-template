package main

import (
	"context"
	"fmt"
	"os"

	"github.com/Marne-Software/serverless-template/services/helpers"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
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

	// Set up DynamoDB delete item input
	input := &dynamodb.DeleteItemInput{
		TableName: aws.String("serverlessTemplateSomethingsTable-" + stage),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	}

	// Execute the DynamoDB delete operation
	_, err := dbClient.DeleteItem(ctx, input)
	if err != nil {
		fmt.Printf("Failed to delete item: %v\n", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers:    headers,
			Body:       `{"message": "Failed to delete item"}`,
		}, err
	}

	// Successful deletion response
	return events.APIGatewayProxyResponse{
		Headers:    headers,
		StatusCode: 200,
		Body:       `{"message": "Item successfully deleted!"}`,
	}, nil
}

func main() {
	lambda.Start(handler)
}
