package helpers

import (
    "context"
    "fmt"
    "os"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

// InitializeDynamoDBClient sets up and returns a DynamoDB client based on environment variables
func InitializeDynamoDBClient() *dynamodb.Client {
    cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-1"))
    if err != nil {
        panic("unable to load SDK config, " + err.Error())
    }

    var dbClient *dynamodb.Client

    if os.Getenv("STAGE") == "local" {
        dbClient = dynamodb.New(dynamodb.Options{
            Region:      "us-east-1",
            Credentials: cfg.Credentials,
            EndpointResolver: dynamodb.EndpointResolverFromURL(os.Getenv("DYNAMODB_ENDPOINT")),
        })
        fmt.Println("Using local DynamoDB endpoint:", os.Getenv("DYNAMODB_ENDPOINT"))
    } else {
        dbClient = dynamodb.NewFromConfig(cfg)
    }

    return dbClient
}

// GetDefaultHeaders returns a map of common headers to be used in Lambda functions.
func GetDefaultHeaders() map[string]string {
	return map[string]string{
		"Content-Type":                 "application/json",
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
		"Access-Control-Allow-Methods": "GET,POST,DELETE,PATCH,OPTIONS",
		"Access-Control-Expose-Headers": "Authorization",  
		"Cache-Control":                "no-cache",      
	}
}
