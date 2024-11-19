# AWS Serverless Template

This template uses AWS's Serverless Application Model (SAM) Template and makes deployment even easier using provided a suite of command.

## Resource Naming Conventions

All resources are created using the template.yml in services with the following naming convention for easy identification:

<div align="center">
    <h3><strong>`{appName}-{stage}-{resourceName}`</strong></h3>
</div>

## App Name Amendment

The app name is dynamically amend to all the resources. Just navigate to the template.yml and amend you app name like so under the Parameters section:

```yaml
  AppName:
    Type: String
    Default: "serverlessTemplate" # Put app name here in camel case
  AppNameDashed:
    Type: String
    Default: "serverless-template" # Put app name here in kebab case
```

Then, navigate to the makefile in the services directory and amend the app name there:

```makefile
APP_NAME_DASHED := serverless-template #use kebob case
```

## Architecture Diagram

The template is initially architected in the manner below. All lambda functions are written in Go Lang, a great language for API development. Little experience with the language is needed due to the serverless architecture. Note that while Go is suggested for API endpoints it is not nesscarily suggested for all resources. 

<br/>
<br/>
Legend:
<div style="text-align: center;">
    <img src="./assets/resource-types.png" alt="template-types" title="template-types">
</div>

<div style="text-align: center;">
    <img src="./assets/template-arc.png" alt="template-arc" title="template-arc">
</div>

## Global Dependencies

Ensure the following tools are installed on your system before proceeding:

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop)**  
   Used to containerize and run applications.

2. **[AWS CLI](https://aws.amazon.com/cli/)**  
   Enables interaction with AWS services from your terminal.

3. **[SAM CLI](https://aws.amazon.com/serverless/sam/)**  
   Simplifies building and running serverless applications locally.

## Developing Locally

To set up and run the project locally, follow these steps:

1. Open a terminal and navigate to the `services` directory:
   ```bash
   cd services
    ```
2. Install the necessary dependencies:
    ```bash
    make install
    ```
3. Make sure Docker is open and start the server:
    ```bash
    make run-server
    ```
4. Once you see the message that the server is running start the frontend:
    ```bash
    make run-frontend
    ```

    ### Adding a Function
    
    1. Create a folder with the function name inside services that contained a file named main.go.

    2. Inside the main file implement your lambda code.

    3. Add the function to the template.yml. Make sure the necessary role and policies are attached.

        ```yaml
        GetSomethingFunction:
            Type: AWS::Serverless::Function
            Properties:
            FunctionName: !Sub "${AppName}-${Stage}-getSomethingFunction"
            Handler: bootstrap
            CodeUri: bin/GetSomething.zip
            Role: !GetAtt LambdaApiExecutionRole.Arn
            Events:
                GetSomethingApi:
                Type: Api
                Properties:
                    RestApiId: !Ref RestApi
                    Path: /api/something/{id}
                    Method: get
                    Auth:
                    Authorizer: DefaultAuthorizer
        ```
    
    4. In the MakeFile add the function name to the functionNames array so that it is built before containerization and deployment:

        ```makefile
        functionNames := \
            NewFunctionName \
            InvalidationControl \
            GetSomething \
            PatchSomething \
            DeleteSomething \
            PostSomething \
            DefaultAuthorizerFunction
        ```





