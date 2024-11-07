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

type UpdateRequest struct {
    Id   string `json:"id"`
    Name string `json:"name"`
}

var dbClient *dynamodb.Client

func init() {
    dbClient = helpers.InitializeDynamoDBClient()
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
    stage := os.Getenv("STAGE")
    headers := helpers.GetDefaultHeaders()

    var updateReq UpdateRequest
    if err := json.Unmarshal([]byte(request.Body), &updateReq); err != nil {
        fmt.Println("Error unmarshaling request body:", err)
        return events.APIGatewayProxyResponse{
            StatusCode: 400,
            Body:       `{"message": "Invalid request body"}`,
        }, nil
    }

    // Validate that all required fields are provided
    if updateReq.Id == "" || updateReq.Name == "" {
        return events.APIGatewayProxyResponse{
            Headers: headers,
            StatusCode: 400,
            Body:       `{"message": "'id' and 'name' are required in the request body"}`,
        }, nil
    }

    tableName := "serverlessTemplate-" + stage + "-somethingsTable" 
    input := &dynamodb.UpdateItemInput{
        TableName: aws.String(tableName),
        Key: map[string]types.AttributeValue{
            "id": &types.AttributeValueMemberS{Value: updateReq.Id},
        },
        UpdateExpression:          aws.String("SET #name = :name"),
        ExpressionAttributeNames:  map[string]string{"#name": "name"},
        ExpressionAttributeValues: map[string]types.AttributeValue{":name": &types.AttributeValueMemberS{Value: updateReq.Name}},
        ReturnValues:              types.ReturnValueUpdatedNew,
    }

    _, err := dbClient.UpdateItem(ctx, input)
    if err != nil {
        fmt.Printf("Failed to update item: %v\n", err)
        return events.APIGatewayProxyResponse{
            Headers: headers,
            StatusCode: 500,
            Body:       `{"message": "Failed to update item"}`,
        }, err
    }

    return events.APIGatewayProxyResponse{
        Headers: headers,
        StatusCode: 200,
        Body:       `{"message": "Item successfully updated!"}`,
    }, nil
}

func main() {
    lambda.Start(handler)
}
