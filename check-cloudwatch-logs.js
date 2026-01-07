// Script to check CloudWatch logs for booking Lambda function
// This will help identify if emails failed to send

const { CloudWatchLogsClient, FilterLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');

const logsClient = new CloudWatchLogsClient({ region: 'us-east-2' });

// Common log group names for Lambda functions
const LOG_GROUP_NAMES = [
    '/aws/lambda/pottery-booking-handler',
    '/aws/lambda/pottery-booking-handler-v3',
    '/aws/lambda/booking-handler',
    '/aws/lambda/booking-handler-v3'
];

async function checkLogs() {
    console.log('Checking CloudWatch logs for booking Lambda errors...\n');
    
    // Check last 7 days
    const startTime = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const logGroupName of LOG_GROUP_NAMES) {
        try {
            console.log(`Checking log group: ${logGroupName}...`);
            
            const result = await logsClient.send(new FilterLogEventsCommand({
                logGroupName: logGroupName,
                startTime: startTime,
                filterPattern: 'ERROR error Error Exception'
            }));

            if (result.events && result.events.length > 0) {
                console.log(`\n⚠️  Found ${result.events.length} error events in ${logGroupName}:\n`);
                result.events.slice(0, 10).forEach((event, index) => {
                    console.log(`${index + 1}. [${new Date(event.timestamp).toISOString()}]`);
                    console.log(`   ${event.message.substring(0, 200)}...`);
                    console.log('');
                });
            } else {
                console.log(`   No errors found in ${logGroupName}`);
            }
        } catch (error) {
            if (error.name === 'ResourceNotFoundException') {
                console.log(`   Log group ${logGroupName} not found (this is OK if using a different name)`);
            } else {
                console.error(`   Error checking ${logGroupName}:`, error.message);
            }
        }
    }
    
    console.log('\n=== Checking for SES email errors ===\n');
    
    // Also check for SES-specific errors
    for (const logGroupName of LOG_GROUP_NAMES) {
        try {
            const result = await logsClient.send(new FilterLogEventsCommand({
                logGroupName: logGroupName,
                startTime: startTime,
                filterPattern: 'SES SendEmail email'
            }));

            if (result.events && result.events.length > 0) {
                console.log(`Found ${result.events.length} email-related events in ${logGroupName}`);
                // Show last few
                result.events.slice(-5).forEach((event) => {
                    const message = event.message;
                    if (message.includes('Error') || message.includes('error') || message.includes('failed')) {
                        console.log(`\n⚠️  [${new Date(event.timestamp).toISOString()}]`);
                        console.log(`   ${message.substring(0, 300)}`);
                    }
                });
            }
        } catch (error) {
            // Ignore ResourceNotFoundException
        }
    }
}

checkLogs().catch(console.error);


