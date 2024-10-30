package main

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

// Request holds the expected input for the Lambda function
type Request struct {
    Id string `json:"id"`
}

// Response holds the output format for the Lambda function
type Response struct {
    Items []map[string]types.AttributeValue `json:"items"`
}

var dbClient *dynamodb.Client

func init() {
    // Load the AWS configuration
    cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-1"))
    if err != nil {
        panic("unable to load SDK config, " + err.Error())
    }

    // Create a DynamoDB client
    dbClient = dynamodb.NewFromConfig(cfg)
}

func handler(ctx context.Context, req Request) (Response, error) {
	stage := os.Getenv("STAGE")
    // Define the input for the Query request, specifying only the partition key (id)
    input := &dynamodb.QueryInput{
        TableName:              aws.String("serverlessTemplateSomethingsTable-" + stage),
        KeyConditionExpression: aws.String("id = :id"),
        ExpressionAttributeValues: map[string]types.AttributeValue{
            ":id": &types.AttributeValueMemberS{Value: req.Id},
        },
    }

    // Query DynamoDB for items with the specified id
    result, err := dbClient.Query(ctx, input)
    if err != nil {
        return Response{}, fmt.Errorf("failed to query items: %w", err)
    }

    // Check if any items were found
    if len(result.Items) == 0 {
        return Response{}, fmt.Errorf("no items found with id %s", req.Id)
    }

    // Return the found items
    return Response{Items: result.Items}, nil
}

func main() {
    lambda.Start(handler)
}
