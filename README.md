# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Create DynamoDB tables

### table 1:

aws dynamodb create-table \
    --table-name Products \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=title,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
        AttributeName=title,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --table-class STANDARD

### table 2:

aws dynamodb create-table \
    --table-name Stock \
    --attribute-definitions \
        AttributeName=product_id,AttributeType=S \
        AttributeName=count,AttributeType=N \
    --key-schema \
        AttributeName=product_id,KeyType=HASH \
        AttributeName=count,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --table-class STANDARD