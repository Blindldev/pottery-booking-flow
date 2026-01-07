#!/bin/bash

# Setup Cyber Monday Endpoint via AWS CLI
# This script creates the Lambda function, DynamoDB table, API Gateway endpoint, and IAM permissions

set -e  # Exit on error

# Configuration
REGION="us-east-2"
API_ID="mg9brncx39"  # Your API Gateway ID
STAGE_NAME="prod"
LAMBDA_FUNCTION_NAME="cybermonday-handler"
TABLE_NAME="CyberMondayGamePlays"
ROLE_NAME="cybermonday-lambda-role"
POLICY_NAME="cybermonday-lambda-policy"

echo "🚀 Setting up Cyber Monday endpoint via AWS CLI..."
echo ""

# Step 1: Create IAM Role for Lambda
echo "📋 Step 1: Creating IAM Role..."
ROLE_ARN=$(aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }]
  }' \
  --query 'Role.Arn' \
  --output text 2>/dev/null || aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)

echo "✅ IAM Role: $ROLE_ARN"
echo ""

# Step 2: Attach Basic Lambda Execution Policy
echo "📋 Step 2: Attaching basic Lambda execution policy..."
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || echo "Policy already attached"
echo "✅ Basic execution policy attached"
echo ""

# Step 3: Create Custom Policy for DynamoDB and SES
echo "📋 Step 3: Creating custom IAM policy..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

cat > /tmp/cybermonday-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:GetItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}",
        "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:${REGION}:${ACCOUNT_ID}:*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name $ROLE_NAME \
  --policy-name $POLICY_NAME \
  --policy-document file:///tmp/cybermonday-policy.json 2>/dev/null || echo "Policy already exists"
echo "✅ Custom policy created"
echo ""

# Wait for IAM role to propagate
echo "⏳ Waiting for IAM role to propagate..."
sleep 10

# Step 4: Create DynamoDB Table
echo "📋 Step 4: Creating DynamoDB table..."
aws dynamodb create-table \
  --table-name $TABLE_NAME \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"email-index\",
      \"KeySchema\": [{\"AttributeName\": \"email\", \"KeyType\": \"HASH\"}],
      \"Projection\": {\"ProjectionType\": \"ALL\"}
    }]" \
  --region $REGION 2>/dev/null || echo "Table already exists"
echo "✅ DynamoDB table created"
echo ""

# Step 5: Create Lambda Deployment Package
echo "📋 Step 5: Creating Lambda deployment package..."
cd "$(dirname "$0")"
mkdir -p /tmp/cybermonday-lambda
cp aws-lambda/cybermonday-handler.js /tmp/cybermonday-lambda/index.js

# Install dependencies
cd /tmp/cybermonday-lambda
npm init -y > /dev/null 2>&1
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-ses --save > /dev/null 2>&1

# Create zip file
zip -r /tmp/cybermonday-lambda.zip . > /dev/null 2>&1
echo "✅ Lambda package created"
echo ""

# Step 6: Create Lambda Function
echo "📋 Step 6: Creating Lambda function..."
aws lambda create-function \
  --function-name $LAMBDA_FUNCTION_NAME \
  --runtime nodejs20.x \
  --role $ROLE_ARN \
  --handler index.handler \
  --zip-file fileb:///tmp/cybermonday-lambda.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment Variables="{CYBERMONDAY_TABLE_NAME=${TABLE_NAME},BOOKINGS_URL=https://thepotteryloop.com}" \
  --region $REGION 2>/dev/null || {
    echo "Function exists, updating..."
    aws lambda update-function-code \
      --function-name $LAMBDA_FUNCTION_NAME \
      --zip-file fileb:///tmp/cybermonday-lambda.zip \
      --region $REGION > /dev/null
    
    aws lambda update-function-configuration \
      --function-name $LAMBDA_FUNCTION_NAME \
      --timeout 30 \
      --memory-size 256 \
      --environment Variables="{CYBERMONDAY_TABLE_NAME=${TABLE_NAME},BOOKINGS_URL=https://thepotteryloop.com}" \
      --region $REGION > /dev/null
  }
echo "✅ Lambda function created/updated"
echo ""

# Step 7: Get API Gateway Root Resource ID
echo "📋 Step 7: Setting up API Gateway..."
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --query 'items[?path==`/`].id' \
  --output text)

echo "✅ Root resource ID: $ROOT_RESOURCE_ID"
echo ""

# Step 8: Create /cybermonday-play Resource
echo "📋 Step 8: Creating /cybermonday-play resource..."
RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_RESOURCE_ID \
  --path-part "cybermonday-play" \
  --region $REGION \
  --query 'id' \
  --output text 2>/dev/null || \
  aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query "items[?path==\`/cybermonday-play\`].id" \
    --output text)

echo "✅ Resource ID: $RESOURCE_ID"
echo ""

# Step 9: Create POST Method
echo "📋 Step 9: Creating POST method..."
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

echo "✅ POST method created"
echo ""

# Step 10: Create OPTIONS Method (for CORS)
echo "📋 Step 10: Creating OPTIONS method for CORS..."
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

# Set up integration response for OPTIONS
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'\''*'\''","method.response.header.Access-Control-Allow-Headers":"'\''Content-Type'\''","method.response.header.Access-Control-Allow-Methods":"'\''POST,OPTIONS'\''"}' \
  --region $REGION > /dev/null

echo "✅ OPTIONS method created"
echo ""

# Step 11: Add Lambda Permission for API Gateway
echo "📋 Step 11: Adding Lambda permission for API Gateway..."
aws lambda add-permission \
  --function-name $LAMBDA_FUNCTION_NAME \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/POST/cybermonday-play" \
  --region $REGION 2>/dev/null || echo "Permission already exists"
echo "✅ Lambda permission added"
echo ""

# Step 12: Deploy API
echo "📋 Step 12: Deploying API to ${STAGE_NAME} stage..."
DEPLOYMENT_ID=$(aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name $STAGE_NAME \
  --region $REGION \
  --query 'id' \
  --output text 2>/dev/null || echo "Deployment created")

echo "✅ API deployed"
echo ""

# Cleanup
rm -rf /tmp/cybermonday-lambda
rm -f /tmp/cybermonday-lambda.zip
rm -f /tmp/cybermonday-policy.json

echo "🎉 Setup complete!"
echo ""
echo "📝 Summary:"
echo "  - Lambda Function: ${LAMBDA_FUNCTION_NAME}"
echo "  - DynamoDB Table: ${TABLE_NAME}"
echo "  - API Endpoint: https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE_NAME}/cybermonday-play"
echo ""
echo "🧪 Test the endpoint:"
echo "  curl -X POST https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE_NAME}/cybermonday-play \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"consent\":true}'"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Verify create@potterychicago.com in SES (us-east-2)"
echo "  2. If SES is in sandbox mode, verify recipient emails too"
echo ""





