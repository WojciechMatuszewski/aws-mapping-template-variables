import { APIGatewayTokenAuthorizerHandler } from "aws-lambda";

export const handler: APIGatewayTokenAuthorizerHandler = async event => {
  // Assuming the user is authenticated and the token is valid

  return {
    principalId: "1",
    context: {
      username: "test-username"
    },
    policyDocument: {
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: event.methodArn
        }
      ],
      Version: "2012-10-17"
    }
  };
};
