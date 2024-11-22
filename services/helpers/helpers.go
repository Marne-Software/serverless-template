package helpers

import (
	"context"
	"fmt"
	"log"
	"os"
	"testing"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
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

// TEST HELPERS
func DeleteTestItem(testID string, tableName string, t *testing.T) {
	ctx := context.Background()

    // Load AWS credentials and region
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		t.Fatalf("Failed to load AWS configuration: %v", err)
	}

	dbClient := dynamodb.New(dynamodb.Options{
		Region:      "us-east-1",
        Credentials: cfg.Credentials,
		EndpointResolver: dynamodb.EndpointResolverFromURL("http://localhost:8080"),
	})

	// Delete the item with id = testID
	log.Printf("Deleting item with id=%s from table %s", testID, tableName)
	_, err = dbClient.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: &tableName,
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: testID},
		},
	})
	if err != nil {
		log.Printf("Failed to delete item with id=%s: %v", testID, err)
	}
	log.Printf("Item with id=%s deleted successfully from table %s", testID, tableName)
}

func PostTestItem(testID string, testName string, tableName string, t *testing.T) {
	ctx := context.Background()

	// Load AWS credentials and region
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		t.Fatalf("Failed to load AWS configuration: %v", err)
	}
	
	// Initialize DynamoDB client with custom endpoint
	dbClient := dynamodb.New(dynamodb.Options{
		Region:      "us-east-1",
		Credentials: cfg.Credentials,
		EndpointResolver: dynamodb.EndpointResolverFromURL("http://localhost:8080"),
	})
	
	// Define the item to put with the name attribute
	item := map[string]types.AttributeValue{
		"id":   &types.AttributeValueMemberS{Value: testID},
		"name": &types.AttributeValueMemberS{Value: testName},
	}
	
	// Put the item into the table
	log.Printf("Putting item with id=%s and name=%s into table %s", item["id"].(*types.AttributeValueMemberS).Value, item["name"].(*types.AttributeValueMemberS).Value, tableName)
	_, err = dbClient.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: &tableName,
		Item:      item,
	})
	if err != nil {
		t.Fatalf("Failed to put item with id=%s: %v", item["id"].(*types.AttributeValueMemberS).Value, err)
	}
	log.Printf("Item with id=%s and name=%s added successfully to table %s", item["id"].(*types.AttributeValueMemberS).Value, item["name"].(*types.AttributeValueMemberS).Value, tableName)
}

