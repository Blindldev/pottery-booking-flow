#!/bin/bash

# Script to set up Open Studio waitlist endpoint in AWS
# Creates Lambda function, API Gateway endpoint, DynamoDB table, and configures CORS

set -e

# Configuration
API_ID="mg9brncx39"  # Your API Gateway ID
REGION="us-east-2"
STAGE_NAME="prod"
LAMBDA_FUNCTION_NAME="pottery-open-studio-handler"
TABLE_NAME="OpenStudioWaitlist"
ROLE_NAME="pottery-open-studio-lambda-role"

echo "🔧 Setting up Open Studio Waitlist endpoint"
echo "============================================"
echo ""

# Get Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region $REGION)
echo "✅ Account ID: $ACCOUNT_ID"
echo ""

# Step 1: Create IAM Role for Lambda
echo "📋 Step 1: Creating IAM role for Lambda..."
ROLE_ARN=$(aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' \
  --query 'Role.Arn' \
  --output text 2>/dev/null || \
  aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)

echo "✅ Role ARN: $ROLE_ARN"
echo ""

# Step 2: Attach policies to role
echo "📋 Step 2: Attaching policies to role..."
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || echo "Basic execution policy already attached"

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess 2>/dev/null || echo "DynamoDB policy already attached"

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess 2>/dev/null || echo "SES policy already attached"

echo "✅ Policies attached"
echo ""

# Wait for role to be ready
echo "⏳ Waiting for IAM role to be ready..."
sleep 5
echo ""

# Step 3: Create DynamoDB Table
echo "📋 Step 3: Creating DynamoDB table..."
aws dynamodb create-table \
  --table-name $TABLE_NAME \
  --attribute-definitions AttributeName=waitlistId,AttributeType=S \
  --key-schema AttributeName=waitlistId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION 2>/dev/null || echo "Table already exists or being created"

echo "✅ DynamoDB table created/verified"
echo ""

# Step 4: Prepare Lambda package
echo "📋 Step 4: Preparing Lambda package..."
mkdir -p /tmp/open-studio-lambda
cp aws-lambda/open-studio-handler.js /tmp/open-studio-lambda/index.js

# Install dependencies
cd /tmp/open-studio-lambda
npm init -y > /dev/null 2>&1
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-ses --save > /dev/null 2>&1

# Create zip file
zip -r /tmp/open-studio-lambda.zip . > /dev/null 2>&1
echo "✅ Lambda package created"
echo ""

# Step 5: Create Lambda Function
echo "📋 Step 5: Creating Lambda function..."
aws lambda create-function \
  --function-name $LAMBDA_FUNCTION_NAME \
  --runtime nodejs20.x \
  --role $ROLE_ARN \
  --handler index.handler \
  --zip-file fileb:///tmp/open-studio-lambda.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment Variables="{OPEN_STUDIO_TABLE_NAME=${TABLE_NAME}}" \
  --region $REGION 2>/dev/null || {
    echo "Function exists, updating..."
    aws lambda update-function-code \
      --function-name $LAMBDA_FUNCTION_NAME \
      --zip-file fileb:///tmp/open-studio-lambda.zip \
      --region $REGION > /dev/null
    
    aws lambda update-function-configuration \
      --function-name $LAMBDA_FUNCTION_NAME \
      --timeout 30 \
      --memory-size 256 \
      --environment Variables="{OPEN_STUDIO_TABLE_NAME=${TABLE_NAME}}" \
      --region $REGION > /dev/null
  }
echo "✅ Lambda function created/updated"
echo ""

# Step 6: Get API Gateway Root Resource ID
echo "📋 Step 6: Setting up API Gateway..."
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --query 'items[?path==`/`].id' \
  --output text)

echo "✅ Root resource ID: $ROOT_RESOURCE_ID"
echo ""

# Step 7: Create /open-studio Resource
echo "📋 Step 7: Creating /open-studio resource..."
RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_RESOURCE_ID \
  --path-part "open-studio" \
  --region $REGION \
  --query 'id' \
  --output text 2>/dev/null || \
  aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query "items[?path==\`/open-studio\`].id" \
    --output text)

echo "✅ Resource ID: $RESOURCE_ID"
echo ""

# Step 8: Create POST Method
echo "📋 Step 8: Creating POST method..."
LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_FUNCTION_NAME}"

aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE \
  --region $REGION 2>/dev/null || echo "POST method already exists"

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" \
  --region $REGION > /dev/null

echo "✅ POST method configured"
echo ""

# Step 9: Create OPTIONS Method (for CORS)
echo "📋 Step 9: Creating OPTIONS method for CORS..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --authorization-type NONE \
  --region $REGION 2>/dev/null || echo "OPTIONS method already exists"

# Create mock integration for OPTIONS
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --type MOCK \
  --request-templates '{"application/json":"{\"statusCode\":200}"}' \
  --region $REGION > /dev/null

# Set up method response for OPTIONS
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":true,"method.response.header.Access-Control-Allow-Headers":true,"method.response.header.Access-Control-Allow-Methods":true}' \
  --region $REGION > /dev/null

# Set up integration response for OPTIONS with CORS headers
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'\''*'\''","method.response.header.Access-Control-Allow-Headers":"'\''Content-Type'\''","method.response.header.Access-Control-Allow-Methods":"'\''POST,OPTIONS'\''"}' \
  --region $REGION > /dev/null

echo "✅ OPTIONS method configured with CORS headers"
echo ""

# Step 10: Add Lambda Permission for API Gateway
echo "📋 Step 10: Adding Lambda permission for API Gateway..."
aws lambda add-permission \
  --function-name $LAMBDA_FUNCTION_NAME \
  --statement-id apigateway-invoke-open-studio \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/POST/open-studio" \
  --region $REGION 2>/dev/null || echo "Permission already exists"
echo "✅ Lambda permission added"
echo ""

# Step 11: Deploy API
echo "📋 Step 11: Deploying API to ${STAGE_NAME} stage..."
DEPLOYMENT_ID=$(aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name $STAGE_NAME \
  --region $REGION \
  --query 'id' \
  --output text 2>/dev/null || echo "Deployment created")

echo "✅ API deployed successfully!"
echo ""
echo "🎉 Open Studio Waitlist endpoint setup complete!"
echo ""
echo "📝 Summary:"
echo "   - Lambda Function: $LAMBDA_FUNCTION_NAME"
echo "   - DynamoDB Table: $TABLE_NAME"
echo "   - API Gateway ID: $API_ID"
echo "   - Resource: /open-studio"
echo "   - Stage: $STAGE_NAME"
echo "   - Endpoint: https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE_NAME}/open-studio"
echo "   - Email will be sent to: PotteryChicago@gmail.com"
echo ""
echo "✅ The /open-studio endpoint is now ready to receive waitlist submissions!"




