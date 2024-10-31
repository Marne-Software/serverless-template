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
    Id        string `json:"id"`
    Name      string `json:"name"`
    NewStatus string `json:"newStatus"` // Additional attribute for updating
}

var dbClient *dynamodb.Client

func init() {
    dbClient = helpers.InitializeDynamoDBClient()
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
    var updateReq UpdateRequest
    if err := json.Unmarshal([]byte(request.Body), &updateReq); err != nil {
        fmt.Println("Error unmarshaling request body:", err)
        return events.APIGatewayProxyResponse{
            StatusCode: 400,
            Body:       `{"message": "Invalid request body"}`,
        }, nil
    }

    // Validate that all required fields are provided
    if updateReq.Id == "" || updateReq.Name == "" || updateReq.NewStatus == "" {
        return events.APIGatewayProxyResponse{
            StatusCode: 400,
            Body:       `{"message": "Both 'id', 'name', and 'newStatus' are required in the request body"}`,
        }, nil
    }

    tableName := "serverlessTemplateSomethingsTable-" + os.Getenv("STAGE")
    input := &dynamodb.UpdateItemInput{
        TableName: aws.String(tableName),
        Key: map[string]types.AttributeValue{
            "id":   &types.AttributeValueMemberS{Value: updateReq.Id},
            "name": &types.AttributeValueMemberS{Value: updateReq.Name},
        },
        UpdateExpression:          aws.String("SET #status = :newStatus"),
        ExpressionAttributeNames:  map[string]string{"#status": "status"},
        ExpressionAttributeValues: map[string]types.AttributeValue{":newStatus": &types.AttributeValueMemberS{Value: updateReq.NewStatus}},
        ReturnValues:              types.ReturnValueUpdatedNew,
    }

    _, err := dbClient.UpdateItem(ctx, input)
    if err != nil {
        fmt.Printf("Failed to update item: %v\n", err)
        return events.APIGatewayProxyResponse{
            StatusCode: 500,
            Body:       `{"message": "Failed to update item"}`,
        }, err
    }

    return events.APIGatewayProxyResponse{
        StatusCode: 200,
        Body:       `{"message": "Item successfully updated"}`,
    }, nil
}

func main() {
    lambda.Start(handler)
}
