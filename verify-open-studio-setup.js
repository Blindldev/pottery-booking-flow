// Script to verify if Open Studio endpoint is set up
// Checks Lambda function, DynamoDB table, and API Gateway

const { LambdaClient, GetFunctionCommand } = require('@aws-sdk/client-lambda');
const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { APIGatewayClient, GetResourcesCommand } = require('@aws-sdk/client-api-gateway');

const lambdaClient = new LambdaClient({ region: 'us-east-2' });
const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const apiGatewayClient = new APIGatewayClient({ region: 'us-east-2' });

const LAMBDA_FUNCTION_NAME = 'pottery-open-studio-handler';
const TABLE_NAME = 'OpenStudioWaitlist';
const API_ID = 'mg9brncx39';

async function verifySetup() {
    console.log('Verifying Open Studio endpoint setup...\n');
    
    // Check Lambda Function
    console.log('1. Checking Lambda Function...');
    try {
        const lambdaResult = await lambdaClient.send(new GetFunctionCommand({
            FunctionName: LAMBDA_FUNCTION_NAME
        }));
        console.log(`   ✅ Lambda function exists: ${LAMBDA_FUNCTION_NAME}`);
        console.log(`   Runtime: ${lambdaResult.Configuration.Runtime}`);
        console.log(`   Last Modified: ${lambdaResult.Configuration.LastModified}`);
    } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
            console.log(`   ❌ Lambda function NOT FOUND: ${LAMBDA_FUNCTION_NAME}`);
            console.log('   You need to create the Lambda function first.');
        } else {
            console.log(`   ⚠️  Error checking Lambda: ${error.message}`);
        }
    }
    console.log('');
    
    // Check DynamoDB Table
    console.log('2. Checking DynamoDB Table...');
    try {
        const tableResult = await dynamoClient.send(new DescribeTableCommand({
            TableName: TABLE_NAME
        }));
        console.log(`   ✅ Table exists: ${TABLE_NAME}`);
        console.log(`   Item Count: ${tableResult.Table.ItemCount || 'Unknown'}`);
        console.log(`   Status: ${tableResult.Table.TableStatus}`);
        
        // Try to scan for items
        const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
        const docClient = DynamoDBDocumentClient.from(dynamoClient);
        const scanResult = await docClient.send(new ScanCommand({
            TableName: TABLE_NAME,
            Limit: 10
        }));
        console.log(`   Items in table: ${scanResult.Items?.length || 0}`);
        if (scanResult.Items && scanResult.Items.length > 0) {
            console.log('   Recent submissions:');
            scanResult.Items.slice(0, 5).forEach((item, idx) => {
                console.log(`     ${idx + 1}. ${item.email || 'N/A'} - ${item.timestamp || 'N/A'}`);
            });
        }
    } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
            console.log(`   ❌ Table NOT FOUND: ${TABLE_NAME}`);
            console.log('   You need to create the DynamoDB table first.');
        } else {
            console.log(`   ⚠️  Error checking table: ${error.message}`);
        }
    }
    console.log('');
    
    // Check API Gateway Resource
    console.log('3. Checking API Gateway Resource...');
    try {
        const apiResult = await apiGatewayClient.send(new GetResourcesCommand({
            restApiId: API_ID
        }));
        
        const openStudioResource = apiResult.items?.find(item => item.path === '/open-studio');
        if (openStudioResource) {
            console.log(`   ✅ /open-studio resource exists`);
            console.log(`   Resource ID: ${openStudioResource.id}`);
            
            // Check for methods
            if (openStudioResource.resourceMethods) {
                const methods = Object.keys(openStudioResource.resourceMethods);
                console.log(`   Methods: ${methods.join(', ')}`);
            } else {
                console.log('   ⚠️  No methods configured');
            }
        } else {
            console.log('   ❌ /open-studio resource NOT FOUND');
            console.log('   You need to create the API Gateway resource.');
        }
    } catch (error) {
        console.log(`   ⚠️  Error checking API Gateway: ${error.message}`);
    }
    console.log('');
    
    console.log('📝 Summary:');
    console.log('   If any components are missing, run: setup-open-studio-cli.sh');
    console.log('   Endpoint URL should be: https://mg9brncx39.execute-api.us-east-2.amazonaws.com/prod/open-studio');
}

verifySetup().catch(console.error);


