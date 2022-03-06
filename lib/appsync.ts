import { Construct } from "constructs";
import { aws_lambda_nodejs } from "aws-cdk-lib";
import * as aws_appsync_alpha from "@aws-cdk/aws-appsync-alpha";
import * as cdk from "aws-cdk-lib";
import { join } from "path";

export class AppSync extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const authorizerFn = new aws_lambda_nodejs.NodejsFunction(
      this,
      "AuthorizerFn",
      {
        handler: "handler",
        entry: join(__dirname, "../src/appsync-authorizer.ts")
      }
    );

    const schema = new aws_appsync_alpha.Schema();
    const api = new aws_appsync_alpha.GraphqlApi(this, "API", {
      name: "GraphQLApi",
      schema,
      authorizationConfig: {
        defaultAuthorization: {
          lambdaAuthorizerConfig: {
            handler: authorizerFn,
            resultsCacheTtl: cdk.Duration.seconds(0)
          },
          authorizationType: aws_appsync_alpha.AuthorizationType.LAMBDA
        }
      }
    });
    new cdk.CfnOutput(this, "GraphQLApiEndpoint", {
      value: api.graphqlUrl
    });

    const dataType = schema.addType(
      new aws_appsync_alpha.ObjectType("data", {
        definition: {
          authorizerContextUsernameProperty:
            aws_appsync_alpha.GraphqlType.string(),
          wholeAuthorizerVariable: aws_appsync_alpha.GraphqlType.string()
        }
      })
    );
    schema.addQuery(
      "getData",
      new aws_appsync_alpha.ResolvableField({
        returnType: dataType.attribute(),
        requestMappingTemplate: aws_appsync_alpha.MappingTemplate.fromString(`
            #set($payload = {
              "authorizerContextUsernameProperty": $context.identity.resolverContext.username,
              "wholeAuthorizerVariable": $util.escapeJavaScript($context.identity)
            })
            {
              "version": "2018-05-29",
              "payload": $util.toJson($payload),
            }
          `),
        responseMappingTemplate: aws_appsync_alpha.MappingTemplate.fromString(
          `$util.toJson($context.result)`
        ),
        dataSource: new aws_appsync_alpha.NoneDataSource(
          this,
          "NoneDataSource",
          {
            api
          }
        )
      })
    );
  }
}
