// CodePipeline should have the following "UserParameters":
//  'url' : URL to call
//  'content' : The body from HTTP response must contain this string for the test to pass of desination bucket for the S3 static website.
//  'topicArn' : SNS Topic to send failure notifications

var assert = require('assert');
var AWS = require('aws-sdk');
var http = require('http');

const EMAIL = 'auto@rizavi.co';
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

exports.handler = function(event, context) {

    var codepipeline = new AWS.CodePipeline();
    
    // Retrieve the Job ID from the Lambda action
    var jobId = event["CodePipeline.job"].id;
    var jobData = event['CodePipeline.job'].data;

    var userParameters = JSON.parse(jobData.actionConfiguration.configuration.UserParameters);
    var url = userParameters.url;
    var content = userParameters.content;
    var topicArn = userParameters.topicArn;
    
    // Retrieve the value of UserParameters from the Lambda action configuration in AWS CodePipeline, in this case a URL which will be
    // health checked by this function.
    
    // Notify AWS CodePipeline of a successful job
    var putJobSuccess = function(message) {
        var params = {
            jobId: jobId
        };
        codepipeline.putJobSuccessResult(params, function(err, data) {
            if(err) {
                context.fail(err);      
            } else {
                context.succeed(message);      
            }
        });
    };
    
    // Notify AWS CodePipeline of a failed job
    var putJobFailure = function(message) {
        var params = {
            jobId: jobId,
            failureDetails: {
                message: JSON.stringify(message),
                type: 'JobFailed',
                externalExecutionId: context.invokeid
            }
        };
        codepipeline.putJobFailureResult(params, function(err, data) {
            context.fail(message);      
        });
    };
    
    // Validate the URL passed in UserParameters
    if(!url || url.indexOf('http://') === -1) {
        putJobFailure('The UserParameters field must contain a valid URL address to test, including http:// or https://');  
        return;
    }
    
    // Helper function to make a HTTP GET request to the page.
    // The helper will test the response and succeed or fail the job accordingly 
    var getPage = function(url, callback) {
        var pageObject = {
            body: '',
            statusCode: 0,
            contains: function(search) {
                return this.body.indexOf(search) > -1;    
            }
        };
        http.get(url, function(response) {
            pageObject.body = '';
            pageObject.statusCode = response.statusCode;
            
            response.on('data', function (chunk) {
                pageObject.body += chunk;
            });
            
            response.on('end', function () {
                callback(pageObject);
            });
            
            response.resume(); 
        }).on('error', function(error) {
            // Fail the job if our request failed
            putJobFailure(error);    
        });           
    };
    
    getPage(url, function(returnedPage) {
        try {
            // Check if the HTTP response has a 200 status
            assert(returnedPage.statusCode === 200);
            console.log("Success: HTTP success response received");
            
            // Check if the page contains the text "Congratulations"
            // You can change this to check for different text, or add other tests as required
            assert(returnedPage.contains(content));  
            console.log("Success: Page contains specified content");
            
            // Succeed the job
            console.log("Tests passed.");
            putJobSuccess("Tests passed.");
        } catch (ex) {
            // If any of the assertions failed then fail the job
            const params = {
                Message: "URL: "+url+" -- check didn't succeed. \nPlease address the issue ASAP.",
                Subject: "Failed Health Check.",
                TopicArn: topicArn,
            };
            
            SNS.publish(params, function(err, data) {
                if(err) {
                    console.error('error publishing to SNS');
                } else {
                    console.info('message published to SNS');
                }
                putJobFailure(ex);
            });
        }
    });     
};