package main

import (
    "context"
    "fmt"
    "github.com/aws/aws-lambda-go/lambda"
    "github.com/aws/aws-sdk-go-v2/aws"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/dynamodb"
    "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

// Request holds the expected input for the Lambda function
type Request struct {
    Id   string `json:"id"`
    Name string `json:"name"`
}

// Response holds the output format for the Lambda function
type Response struct {
    Message string `json:"message"`
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
    // Define the input for the PutItem request
    input := &dynamodb.PutItemInput{
        TableName: aws.String("serverlessTemplateSomethingsTable"),
        Item: map[string]types.AttributeValue{
            "id":   &types.AttributeValueMemberS{Value: req.Id},
            "name": &types.AttributeValueMemberS{Value: req.Name},
        },
    }

    // Put item into DynamoDB
    _, err := dbClient.PutItem(ctx, input)
    if err != nil {
        return Response{}, fmt.Errorf("failed to put item: %w", err)
    }

    // Return a success message
    return Response{Message: "Item successfully added"}, nil
}

func main() {
    lambda.Start(handler)
}
