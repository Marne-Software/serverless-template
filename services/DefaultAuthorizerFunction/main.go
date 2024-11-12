package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
)

// Handler for API Gateway custom authorizer request
func Handler(ctx context.Context, request events.APIGatewayCustomAuthorizerRequest) (events.APIGatewayCustomAuthorizerResponse, error) {
	log.Println("Handling request...")
	authorizationToken := request.AuthorizationToken
	log.Printf("Authorization token: %s", authorizationToken)

	if isValidAuthorizationToken(ctx, authorizationToken) {
		log.Println("Authorization token is valid")
		return generatePolicy("user", "Allow", request.MethodArn), nil
	}
	log.Println("Authorization token is invalid")
	return generatePolicy("user", "Deny", request.MethodArn), nil
}

// isValidAuthorizationToken checks if the token is a valid JWT Bearer token
func isValidAuthorizationToken(ctx context.Context, authorizationToken string) bool {
	log.Println("Validating authorization token...")

	// Expecting "Bearer <token>"
	tokenParts := strings.Fields(authorizationToken)
	if len(tokenParts) != 2 || strings.ToLower(tokenParts[0]) != "bearer" {
		log.Println("Invalid token format: Only Bearer tokens are accepted")
		return false
	}

	log.Println("Validating Cognito token...")
	return isValidCognitoToken(ctx, tokenParts[1])
}

// isValidCognitoToken validates the JWT through AWS Cognito
func isValidCognitoToken(ctx context.Context, token string) bool {
	log.Println("Validating Cognito token...")
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		log.Printf("Error loading AWS config: %v", err)
		return false
	}

	cognitoClient := cognitoidentityprovider.NewFromConfig(cfg)
	userPoolID := os.Getenv("USER_POOL_ID")

	// Validate token by getting user info from Cognito
	_, err = cognitoClient.GetUser(ctx, &cognitoidentityprovider.GetUserInput{
		AccessToken: aws.String(token),
	})
	if err != nil {
		log.Printf("Error validating Cognito token with Cognito GetUser API: %v", err)
		return false
	}

	// Parse token claims to verify the issuer
	tokenClaims, err := parseCognitoToken(token)
	if err != nil {
		log.Printf("Error parsing Cognito token claims: %v", err)
		return false
	}

	// Set expected issuer to include the region and user pool ID
	expectedIssuer := fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s", cfg.Region, userPoolID)
	if tokenClaims.Issuer != expectedIssuer {
		log.Printf("Token issuer mismatch: expected %v, got %v", expectedIssuer, tokenClaims.Issuer)
		return false
	}

	log.Println("Cognito Token Validation Successful")
	return true
}




// parseCognitoToken parses JWT token and verifies its claims
func parseCognitoToken(token string) (*cognitoIDTokenClaims, error) {
	log.Println("Parsing Cognito token...")
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid Cognito token format")
	}

	// Decode the JWT claims part (second part)
	decodedClaims, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("error decoding Cognito token claims: %v", err)
	}

	var claims cognitoIDTokenClaims
	if err := json.Unmarshal(decodedClaims, &claims); err != nil {
		return nil, fmt.Errorf("error unmarshalling Cognito token claims: %v", err)
	}

	return &claims, nil
}

// cognitoIDTokenClaims represents the expected JWT claims
type cognitoIDTokenClaims struct {
	Issuer   string `json:"iss"`
	Sub      string `json:"sub"`
	Audience string `json:"aud"`
	// Additional claims can be added here
}

// generatePolicy generates an IAM policy to allow or deny access
func generatePolicy(principalID, effect, resource string) events.APIGatewayCustomAuthorizerResponse {
	log.Println("Generating policy...")
	stage := os.Getenv("STAGE")
	policy := events.APIGatewayCustomAuthorizerResponse{
		PrincipalID: principalID,
		PolicyDocument: events.APIGatewayCustomAuthorizerPolicy{
			Version: "2012-10-17",
			Statement: []events.IAMPolicyStatement{
				{
					Action:   []string{"execute-api:Invoke"},
					Effect:   effect,
					Resource: []string{"arn:aws:execute-api:us-east-1:827183242253:*/" + stage + "/*"},
				},
			},
		},
	}
	return policy
}


func main() {
	log.Println("Starting Lambda function...")
	lambda.Start(Handler)
}
