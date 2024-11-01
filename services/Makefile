functionNames := \
	getSomething \
    patchSomething \
    deleteSomething \
    postSomething 

clean:
	@rm -rf ./bin 
	@rm -rf ./build
	
build: clean
	@mkdir -p ./bin && cd bin
	@for n in $(functionNames); \
	do \
		echo "$$n"; \
		env GOARCH=amd64 GOOS=linux CGO_ENABLED=0 go build -o bootstrap "$$n"/main.go; \
		zip -j ./bin/"$$n".zip bootstrap; \
		rm bootstrap; \
	done

# LOCAL COMMANDS	

run: build
	@docker compose up -d
	@sam local start-api --port 4000  --env-vars ../env.local.json & \
	SLS_PID=$$!; \
	trap "make down; kill $$SLS_PID" INT; \
	wait $$SLS_PID

down:
	@docker compose down --volumes