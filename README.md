# Welcome to CDK Appsync GraphQL API With Typescript

This project shows how to setup an AppSync notes application using CDK, and Cognito that connects uses a direct lambda resolver that connects to Bedrock.

For full instructions follow the this [Blog Post](https://aws.amazon.com/blogs/mobile/building-scalable-graphql-apis-on-aws-with-cdk-and-aws-appsync/).

## Getting started

To deploy this project, follow these steps.

1. Clone the project

```sh
git clone https://github.com/ErikCH/cdk-graphql-appsync-backend
```

2. Change into the directory and install dependencies

```sh
cd cdk-graphql-appsync-backend

npm install
```

3. Run the build

```sh
npm run build
```

```sh
cdk deploy
```
