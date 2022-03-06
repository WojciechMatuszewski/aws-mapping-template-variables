import { AppSyncAuthorizerHandler } from "aws-lambda";

export const handler: AppSyncAuthorizerHandler<{
  username: string;
}> = async event => {
  return {
    isAuthorized: true,
    resolverContext: {
      username: "test-username"
    }
  };
};
