import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

import {
  AmplifyGraphqlApi,
  AmplifyGraphqlDefinition,
} from "@aws-amplify/graphql-api-construct";
import * as path from "path";
import * as awsCognito from "aws-cdk-lib/aws-cognito";
import {
  IdentityPool,
  UserPoolAuthenticationProvider,
} from "@aws-cdk/aws-cognito-identitypool-alpha";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class AppsyncCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda
    const bedrockLambda = new lambda.Function(this, "bedrockLambda", {
      functionName: "MyBedrockLambda",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "handlers/bedrocklambda")
      ),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(300),
    });

    bedrockLambda.grantPrincipal.addToPrincipalPolicy(
      new PolicyStatement({
        resources: [
          "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2",
        ],
        actions: ["bedrock:InvokeModel"],
      })
    );

    // UserPool
    const userPool = new awsCognito.UserPool(this, "MyUserPool", {
      userPoolName: "MyUserPool",
      selfSignUpEnabled: true,
      autoVerify: {
        email: true,
      },
      accountRecovery: awsCognito.AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: awsCognito.VerificationEmailStyle.CODE,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    // User Pool Client
    const userPoolClient = new awsCognito.UserPoolClient(
      this,
      "MyUserpoolClient",
      { userPool }
    );

    // Identity Pool
    const identityPool = new IdentityPool(this, "MyIdentityPool", {
      identityPoolName: "MyIdentityPool",
      allowUnauthenticatedIdentities: true,
      authenticationProviders: {
        userPools: [
          new UserPoolAuthenticationProvider({
            userPool: userPool,
            userPoolClient: userPoolClient,
          }),
        ],
      },
    });

    // AppSync
    new AmplifyGraphqlApi(this, "MyNewAPI", {
      apiName: "MyNewAPI",
      definition: AmplifyGraphqlDefinition.fromFiles(
        path.join(__dirname, "schema.graphql")
      ),

      authorizationModes: {
        defaultAuthorizationMode: "AMAZON_COGNITO_USER_POOLS",
        apiKeyConfig: {
          expires: cdk.Duration.days(30),
        },
        userPoolConfig: {
          userPool,
        },
      },
      functionNameMap: { noteSummary: bedrockLambda },
    });

    // outputs
    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.identityPoolId,
    });
  }
}
