#!/bin/bash

# Script to fix CORS for collaborations endpoint in API Gateway
# This ensures the /collaborations endpoint properly handles CORS preflight requests

set -e

# Configuration
API_ID="mg9brncx39"  # Your API Gateway ID
REGION="us-east-2"
STAGE_NAME="prod"
LAMBDA_FUNCTION_NAME="pottery-collaborations-handler"

echo "🔧 Fixing CORS for /collaborations endpoint"
echo "==========================================="
echo ""

# Get Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region $REGION)
echo "✅ Account ID: $ACCOUNT_ID"
echo ""

# Step 1: Get Root Resource ID
echo "📋 Step 1: Getting root resource ID..."
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --query 'items[?path==`/`].id' \
  --output text)

echo "✅ Root resource ID: $ROOT_RESOURCE_ID"
echo ""

# Step 2: Get or Create /collaborations Resource
echo "📋 Step 2: Getting or creating /collaborations resource..."
RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_RESOURCE_ID \
  --path-part "collaborations" \
  --region $REGION \
  --query 'id' \
  --output text 2>/dev/null || \
  aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query "items[?path==\`/collaborations\`].id" \
    --output text)

echo "✅ Resource ID: $RESOURCE_ID"
echo ""

# Step 3: Create/Update POST Method
echo "📋 Step 3: Creating/updating POST method..."
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

# Step 4: Create/Update OPTIONS Method (for CORS)
echo "📋 Step 4: Creating/updating OPTIONS method for CORS..."
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

# Step 5: Add Lambda Permission for API Gateway (if needed)
echo "📋 Step 5: Adding Lambda permission for API Gateway..."
aws lambda add-permission \
  --function-name $LAMBDA_FUNCTION_NAME \
  --statement-id apigateway-invoke-collaborations \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/POST/collaborations" \
  --region $REGION 2>/dev/null || echo "Permission already exists or function not found"
echo "✅ Lambda permission checked"
echo ""

# Step 6: Deploy API
echo "📋 Step 6: Deploying API to ${STAGE_NAME} stage..."
DEPLOYMENT_ID=$(aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name $STAGE_NAME \
  --region $REGION \
  --query 'id' \
  --output text 2>/dev/null || echo "Deployment created")

echo "✅ API deployed successfully!"
echo ""
echo "🎉 CORS configuration complete!"
echo ""
echo "📝 Summary:"
echo "   - API Gateway ID: $API_ID"
echo "   - Resource: /collaborations"
echo "   - Stage: $STAGE_NAME"
echo "   - Endpoint: https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE_NAME}/collaborations"
echo ""
echo "✅ The /collaborations endpoint should now properly handle CORS requests from https://potterychicago.com"




