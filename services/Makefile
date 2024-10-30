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

run: build
	@sls offline start --stage local --noTimeout --noAuth & \
	SLS_PID=$$!; \
	trap "make down; kill $$SLS_PID" INT; \
	while ! nc -z localhost 3000; do sleep 1; done; \
	wait $$SLS_PID

down:
	@docker stop $$(docker ps -a -q)
	@docker rm $$(docker ps -a -q)