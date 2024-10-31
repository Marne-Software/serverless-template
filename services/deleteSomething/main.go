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

type DeleteRequest struct {
    Id   string `json:"id"`
    Name string `json:"name"`
}

var dbClient *dynamodb.Client

func init() {
    dbClient = helpers.InitializeDynamoDBClient()
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
    var deleteReq DeleteRequest
    if err := json.Unmarshal([]byte(request.Body), &deleteReq); err != nil {
        fmt.Println("Error unmarshaling request body:", err)
        return events.APIGatewayProxyResponse{
            StatusCode: 400,
            Body:       `{"message": "Invalid request body"}`,
        }, nil
    }

    // Check if both id and name are provided
    if deleteReq.Id == "" || deleteReq.Name == "" {
        return events.APIGatewayProxyResponse{
            StatusCode: 400,
            Body:       `{"message": "Both 'id' and 'name' are required in the request body"}`,
        }, nil
    }

    tableName := "serverlessTemplateSomethingsTable-" + os.Getenv("STAGE")
    input := &dynamodb.DeleteItemInput{
        TableName: aws.String(tableName),
        Key: map[string]types.AttributeValue{
            "id":   &types.AttributeValueMemberS{Value: deleteReq.Id},
            "name": &types.AttributeValueMemberS{Value: deleteReq.Name},
        },
    }

    _, err := dbClient.DeleteItem(ctx, input)
    if err != nil {
        fmt.Printf("Failed to delete item: %v\n", err)
        return events.APIGatewayProxyResponse{
            StatusCode: 500,
            Body:       `{"message": "Failed to delete item"}`,
        }, err
    }

    return events.APIGatewayProxyResponse{
        StatusCode: 200,
        Body:       `{"message": "Item successfully deleted"}`,
    }, nil
}

func main() {
    lambda.Start(handler)
}
