APP_NAME := serverlessTemplate# Use camel case
APP_NAME_DASHED := serverless-template# Use kebab case

functionNames := \
	InvalidationControl \
	GetSomething \
	PatchSomething \
	DeleteSomething \
	PostSomething \
	DefaultAuthorizerFunction

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf ./services/bin
	@rm -rf ./services/build

build: clean
	@mkdir -p ./services/bin
	@set -e; for n in $(functionNames); do \
		echo "Building $$n..."; \
		env GOARCH=amd64 GOOS=linux CGO_ENABLED=0 go build -o ./services/bin/bootstrap ./services/"$$n"/main.go; \
		zip -j ./services/bin/"$$n".zip ./services/bin/bootstrap; \
		rm ./services/bin/bootstrap; \
	done

build-specific:
	@set -e; \
	echo "Building $(fn)..."; \
	mkdir -p ./services/bin; \
	env GOARCH=amd64 GOOS=linux CGO_ENABLED=0 go build -o ./services/bin/bootstrap ./services/$(fn)/main.go; \
	zip -j ./services/bin/$(fn).zip ./services/bin/bootstrap; \
	rm ./services/bin/bootstrap

install:
	@npm install
	@cd ./client && npm install

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

run-frontend:
	@cd ./client && npm run start-local

run-services: build
	@echo "Fetching environment variables from services/getEnvFromStack.js..."
	@node ./services/getEnvFromStack.js local > ./services/helpers/env.local.json
	@if [ ! -s ./services/helpers/env.local.json ]; then \
		echo "Error: env.local.json is empty. Ensure getEnvFromStack.js is working correctly."; \
		exit 1; \
	fi
	@echo "Ensuring DynamoDB volume exists..."
	@mkdir -p ./services/docker/dynamodb # Recreate the local volume directory
	@echo "Starting Docker containers..."
	@docker compose -f ./services/docker-compose.yml up -d
	@sleep 5
	@make seed-local
	@rm -rf .aws-sam
	@sam build --template-file ./services/template.yml
	@echo "Starting SAM local API with dynamically set environment variables..."
	@sam local start-api --warm-containers LAZY --port 4000 --env-vars ./services/helpers/env.local.json --template-file ./services/template.yml & \
	SLS_PID=$$!; \
	trap "make down; kill $$SLS_PID" INT; \
	wait $$SLS_PID

watch:
	@echo "Looking for changes..."
	@fswatch -l 1 --exclude './services/bin/*' ./services | while read file; do \
		if echo $$file | grep -q 'main\.go$$'; then \
			fn=$$(echo $$file | sed -nE 's|.*/([^/]+)/main\.go|\1|p'); \
			make build-specific fn=$$fn; \
			echo "BUILD COMPLETED FOR $$fn"; \
		fi; \
	done

down:
	@echo "Stopping React frontend..."
	@lsof -ti :3000 | xargs -r kill -9 || echo "React frontend not running on port 3000."
	@echo "Stopping Docker containers..."
	@docker compose -f ./services/docker-compose.yml down -v
	@echo "Cleanup complete."


## TEST COMMANDS ##

test:
	@make test-client
	@make test-services

test-services:
	@echo "Fetching environment variables from services/getEnvFromStack.js..."
	@node ./services/getEnvFromStack.js local > ./services/helpers/env.local.json
	@if [ ! -s ./services/helpers/env.local.json ]; then \
		echo "Error: env.local.json is empty. Ensure getEnvFromStack.js is working correctly."; \
		exit 1; \
	fi
	@echo "Setting environment variables for tests from env.local.json..."
	@export $(shell jq -r '.Parameters | to_entries | map("\(.key)=\(.value|tostring)") | .[]' ./services/helpers/env.local.json); \
		go clean -testcache; \
		go test ./services/... -v

test-client:
	@cd ./client && npm test
	@cd ./client && npm run cy:run

## DEPLOYMENT COMMANDS ##
deploy-services-dev: build
	@rm -rf .aws-sam
	@sam build --template-file ./services/template.yml
	@sam deploy --template-file ./services/template.yml --stack-name "$(APP_NAME_DASHED)-dev" --parameter-overrides Stage=dev --capabilities CAPABILITY_NAMED_IAM

deploy-client-dev:
	@cd ./client && npm run build-dev
	@aws s3 sync ./client/build "s3://$(APP_NAME_DASHED)-dev-frontend" --delete --no-verify-ssl

deploy-dev:
	make deploy-services-dev
	make deploy-client-dev
