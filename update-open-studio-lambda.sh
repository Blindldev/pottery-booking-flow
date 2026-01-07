#!/bin/bash

# Script to update the Open Studio Lambda function with the fixed email address

set -e

LAMBDA_FUNCTION_NAME="pottery-open-studio-handler"
REGION="us-east-2"
ZIP_FILE="open-studio-handler.zip"

echo "📦 Updating Open Studio Lambda function..."
echo ""

# Create zip file (Lambda expects handler at root, not in subdirectory)
cd aws-lambda
cp open-studio-handler.js index.js
zip -q ../$ZIP_FILE index.js
rm index.js
cd ..

echo "✅ Created deployment package: $ZIP_FILE"
echo ""

# Update Lambda function
echo "🚀 Deploying updated Lambda function..."
aws lambda update-function-code \
  --function-name $LAMBDA_FUNCTION_NAME \
  --zip-file fileb://$ZIP_FILE \
  --region $REGION \
  --output json | jq -r '.FunctionName, .LastModified, .CodeSize'

echo ""
echo "✅ Lambda function updated successfully!"
echo ""
echo "The function now uses: Create@potterychicago.com (verified email)"
echo ""
echo "🧹 Cleaning up..."
rm -f $ZIP_FILE

echo "✅ Done!"

