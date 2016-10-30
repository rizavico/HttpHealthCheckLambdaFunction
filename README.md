# Health Check Lambda Function for CodePipeline

Calls a URL and verifies that the response is successful.

## Info

index.js is a Lambda function to be used as a custom action in CodePipeline for running this test.

 CodePipeline -> Lambda -> Verify URL returns a successful response -> Succeed or Fail the Pipeline step

## Instructions

1. Clone this repo

  `git clone https://github.com/rizavico/HttpHealthCheckLambdaFunction.git`

2. cd to the cloned repo:

  `cd HttpHealthCheckLambdaFunction`

3. zip up the required files for the Lambda function:

  `zip -r HttpHealthCheckLambdaFunction.zip index.js`

4. Upload the Lambda function zip archive to AWS Lambda Service using AWS Console.

5. In your CodePipeline, add a new action that invokes this Lambda function. You should specific the following as UserParameters:

  `{ "url":"http://url-to-test.com", "content":"Must-contain-this-string-to-succeed"}`