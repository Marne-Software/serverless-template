APP_NAME := serverlessTemplate# Use camel case
APP_NAME_DASHED := serverless-template#use kebob case

functionNames := \
	InvalidationControl \
	GetSomething \
	PatchSomething \
	DeleteSomething \
	PostSomething \
	DefaultAuthorizerFunction

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

install:
	@npm install
	@cd ../client && npm install

# LOCAL COMMANDS

seed-local:
	@echo "Seeding local DynamoDB table..."
	@echo "Creating table: $(APP_NAME)-local-somethingsTable"
	@aws dynamodb create-table \
		--table-name "$(APP_NAME)-local-somethingsTable" \
		--attribute-definitions AttributeName=id,AttributeType=S \
		--key-schema AttributeName=id,KeyType=HASH \
		--billing-mode PAY_PER_REQUEST \
		--endpoint-url http://localhost:8080 \
		--no-cli-pager || echo "Table already exists."


run-server: build
	@docker compose up -d
	@sleep 5
	@make seed-local
	@rm -rf .aws-sam
	@sam build
	@sam local start-api --port 4000 --env-vars ../env.local.json & \
	SLS_PID=$$!; \
	trap "make down; kill $$SLS_PID" INT; \
	wait $$SLS_PID

run-frontend:
	@cd ../client && npm run start-local

down:
	@docker compose down
	@rm -rf ./docker/dynamodb

## TEST COMMANDS ##
test-client:
	@cd ../client && npm test
	@cd ../client && npm run cy:run

## DEPLOYMENT COMMANDS ##
deploy-services-dev: build
	@rm -rf .aws-sam
	@sam build
	@sam deploy --stack-name "$(APP_NAME_DASHED)-dev" --parameter-overrides Stage=dev --capabilities CAPABILITY_NAMED_IAM

deploy-client-dev:
	@cd ../client && npm run build-dev
	@aws s3 sync ../client/build "s3://$(APP_NAME_DASHED)-dev-frontend" --delete --no-verify-ssl

 deploy-dev:
	make deploy-services-dev
	make deploy-client-dev