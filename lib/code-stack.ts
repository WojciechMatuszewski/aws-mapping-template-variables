import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { APIGW } from "./apigw";
import { AppSync } from "./appsync";

export class CodeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new APIGW(this, "APIGW");
    new AppSync(this, "AppSync");
  }
}
