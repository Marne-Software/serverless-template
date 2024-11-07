package main

import (
	"context"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cloudfront"
	"github.com/aws/aws-sdk-go-v2/service/cloudfront/types"
)

func invalidateCache(ctx context.Context, event events.S3Event) error {
	// Load the AWS configuration
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return err
	}

	// Initialize the CloudFront client
	cf := cloudfront.NewFromConfig(cfg)

	// CloudFront distribution ID
	distributionID := os.Getenv("DISTRIBUTION_ID")

	for _, record := range event.Records {
		// Convert the time.Time value to a string
		eventTimeStr := record.EventTime.Format(time.RFC3339)

		// Create an InvalidationBatch request
		invalidationInput := &cloudfront.CreateInvalidationInput{
			DistributionId: aws.String(distributionID),
			InvalidationBatch: &types.InvalidationBatch{
				CallerReference: aws.String(eventTimeStr),
				Paths: &types.Paths{
					Quantity: aws.Int32(1),
					Items:    []string{"/*"}, // Invalidate all files under "/*"
				},
			},
		}

		// Create the cache invalidation
		_, err := cf.CreateInvalidation(ctx, invalidationInput)
		if err != nil {
			return err
		}
	}
	return nil
}

func main() {
	lambda.Start(invalidateCache)
}
