# Health Check Lambda Function for CodePipeline

Calls a URL and verifies that the response is successful.

## Info

index.js is a Lambda function to be used as a custom action in CodePipeline for running this test.

 CodePipeline -> Lambda -> Verify URL returns a successful response -> Succeed or Fail the Pipeline step

## Instructions

1. Copy the code from index.js to AWS Lambda Function - Inline Code Editor.

2. Upload the Lambda function zip archive to AWS Lambda Service using AWS Console.

3. In your CodePipeline, add a new action that invokes this Lambda function. You should specific the following as UserParameters:

  `{ "url":"http://url-to-test.com", "content":"Must-contain-this-string-to-succeed", "topicArn": "SNS-TOPIC-ARN-TO-NOTIFY-FOR-FAILURES"}`
  
## Tip
You can use the lambda-test-event.json to test your Lambda function in the AWS Lambda Inline Code Editor. 

* Go to Lambda Code Editor
* Navigate to Actions > Configure Test Event > Paste the contents of the json file
* Modify the UserParameters
* Test