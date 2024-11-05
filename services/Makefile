functionNames := \
	getSomething \
    patchSomething \
    deleteSomething \
    postSomething 

clean:
	@rm -rf ./bin 
	@rm -rf ./build
	
build: clean
	@mkdir -p ./bin
	@for n in $(functionNames); do \
		echo "Building $$n..."; \
		env GOARCH=amd64 GOOS=linux CGO_ENABLED=0 go build -o ./bin/bootstrap "$$n"/main.go; \
		zip -j ./bin/"$$n".zip ./bin/bootstrap; \
		rm ./bin/bootstrap; \
	done

# LOCAL COMMANDS

seed-local:
	@echo "Seeding local DynamoDB table..."
	@aws dynamodb create-table \
		--table-name serverlessTemplateSomethingsTable-local \
		--attribute-definitions AttributeName=id,AttributeType=S \
		--key-schema AttributeName=id,KeyType=HASH \
		--billing-mode PAY_PER_REQUEST \
		--endpoint-url http://localhost:8080 || echo "Table already exists."

run: build
	@docker compose up -d
	@sleep 2 # Wait briefly to ensure DynamoDB is ready
	@make seed-local
	@rm -rf .aws-sam
	@sam build
	@sam local start-api --port 4000 --env-vars ../env.local.json & \
	SLS_PID=$$!; \
	trap "make down; kill $$SLS_PID" INT; \
	wait $$SLS_PID

down:
	@docker compose down
	@rm -rf ./docker/dynamodb

# DEPLOY COMMANDS
deploy-dev:
	@rm -rf .aws-sam
	@sam build
	@sam deploy --stack-name serverless-template-dev --parameter-overrides Stage=dev 
	# @aws s3 sync ../client/build s3://serverless-template-frontend-dev --delete --no-verify-ssl




