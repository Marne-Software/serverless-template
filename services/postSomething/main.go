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
	var req Request
	if err := json.Unmarshal([]byte(request.Body), &req); err != nil {
		fmt.Println("Error unmarshaling request body:", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Body:       `{"message": "Invalid request body"}`,
		}, err
	}

	// Set a static ID if req.Id is empty
	if req.Id == "" {
		req.Id = "f0c19de7-1aef-4a66-9a83-c15bd7b232e0"
	}

	fmt.Printf("Request ID: %s\n", req.Id)
	fmt.Printf("Request Name: %s\n", req.Name)

	stage := os.Getenv("STAGE")
	fmt.Printf("Table: %s\n", "serverlessTemplateSomethingsTable-"+stage	)
	input := &dynamodb.PutItemInput{
		TableName: aws.String("serverlessTemplateSomethingsTable-" + stage),
		Item: map[string]types.AttributeValue{
			"id":   &types.AttributeValueMemberS{Value: req.Id},
			"name": &types.AttributeValueMemberS{Value: req.Name},
		},
	}

	_, err := dbClient.PutItem(ctx, input)
	if err != nil {
		fmt.Printf("Raw error response: %v\n", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       `{"message": "Failed to put item"}`,
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       `{"message": "Item successfully added!"}`,
	}, nil
}

func main() {
	lambda.Start(handler)
}
