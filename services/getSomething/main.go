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

var dbClient *dynamodb.Client

func init() {
    dbClient = helpers.InitializeDynamoDBClient()
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
    // Retrieve the id from the path parameters
    id, exists := request.PathParameters["id"]
    if !exists || id == "" {
        fmt.Println("ID not provided in path parameters")
        return events.APIGatewayProxyResponse{
            StatusCode: 400,
            Body:       `{"message": "ID not provided in path parameters"}`,
        }, nil
    }

    stage := os.Getenv("STAGE")
    input := &dynamodb.QueryInput{
        TableName:              aws.String("serverlessTemplateSomethingsTable-" + stage),
        KeyConditionExpression: aws.String("id = :id"),
        ExpressionAttributeValues: map[string]types.AttributeValue{
            ":id": &types.AttributeValueMemberS{Value: id},
        },
    }

    result, err := dbClient.Query(ctx, input)
    if err != nil {
        fmt.Printf("Failed to query items: %v\n", err)
        return events.APIGatewayProxyResponse{
            StatusCode: 500,
            Body:       `{"message": "Failed to query items"}`,
        }, err
    }

    if len(result.Items) == 0 {
        return events.APIGatewayProxyResponse{
            StatusCode: 404,
            Body:       fmt.Sprintf(`{"message": "No items found with id %s"}`, id),
        }, nil
    }

    // Marshal the query results to JSON for the response body
    items, err := json.Marshal(result.Items)
    if err != nil {
        fmt.Printf("Failed to marshal items: %v\n", err)
        return events.APIGatewayProxyResponse{
            StatusCode: 500,
            Body:       `{"message": "Failed to process items"}`,
        }, err
    }

    return events.APIGatewayProxyResponse{
        StatusCode: 200,
        Body:       string(items),
    }, nil
}

func main() {
    lambda.Start(handler)
}
