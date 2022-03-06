import { aws_lambda_nodejs, aws_apigateway } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "path";

export class APIGW extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const authorizerFn = new aws_lambda_nodejs.NodejsFunction(
      this,
      "AuthorizerFn",
      {
        handler: "handler",
        entry: join(__dirname, "../src/apigw-authorizer.ts")
      }
    );

    const api = new aws_apigateway.RestApi(this, "API", {});

    const rootGETMethod = api.root.addMethod(
      "GET",
      new aws_apigateway.MockIntegration({
        requestTemplates: {
          "application/json": `
            {
              "statusCode": 200,
            }
          `
        },
        passthroughBehavior: aws_apigateway.PassthroughBehavior.NEVER,
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": `
                {
                  "authorizerContextUsernameProperty": "$context.authorizer.username",
                  "wholeAuthorizerVariable": "$util.escapeJavaScript($context)",
                }
              `
            }
          }
        ]
      }),
      {
        methodResponses: [
          {
            statusCode: "200"
          }
        ],
        requestParameters: {
          "method.request.header.Authorization": true
        },
        authorizer: new aws_apigateway.TokenAuthorizer(this, "Authorizer", {
          resultsCacheTtl: cdk.Duration.seconds(0),
          handler: authorizerFn
        })
      }
    );
  }
}
