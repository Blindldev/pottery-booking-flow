// AWS Lambda function to handle open studio waitlist submissions
// Uses AWS SDK v3 (Node.js 20.x)

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: 'us-east-2' });

const TABLE_NAME = process.env.OPEN_STUDIO_TABLE_NAME || 'OpenStudioWaitlist';
const FROM_EMAIL = 'Create@potterychicago.com'; // Verified sender email (case-sensitive)
const TO_EMAIL = 'PotteryChicago@gmail.com';

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'OK' })
        };
    }

    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const waitlistData = body;
        
        const waitlistId = `OS-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const timestamp = new Date().toISOString();

        const dbItem = {
            waitlistId,
            timestamp,
            email: waitlistData.email || '',
            courseDate: waitlistData.courseDate || '',
            status: 'pending'
        };

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: dbItem
        }));

        const emailBody = formatEmailBody(waitlistData, waitlistId);
        const emailSubject = `New Open Studio Waitlist Request: ${waitlistData.email || 'Unknown'}`;

        await sesClient.send(new SendEmailCommand({
            Source: FROM_EMAIL,
            Destination: {
                ToAddresses: [TO_EMAIL]
            },
            Message: {
                Subject: {
                    Data: emailSubject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: emailBody,
                        Charset: 'UTF-8'
                    },
                    Text: {
                        Data: formatEmailBodyText(waitlistData, waitlistId),
                        Charset: 'UTF-8'
                    }
                }
            }
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Waitlist request submitted successfully',
                waitlistId
            })
        };

    } catch (error) {
        console.error('Error processing waitlist request:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Failed to process waitlist request',
                error: error.message
            })
        };
    }
};

function formatEmailBody(data, waitlistId) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #C56A46; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .section { margin-bottom: 20px; padding: 15px; background-color: white; border-radius: 4px; }
                .label { font-weight: bold; color: #C56A46; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Open Studio Waitlist Request</h1>
                    <p>Waitlist ID: ${waitlistId}</p>
                </div>
                <div class="content">
                    <div class="section">
                        <h2>Contact Information</h2>
                        <p><span class="label">Email:</span> ${data.email || 'N/A'}</p>
                        <p><span class="label">Course Date:</span> ${data.courseDate || 'N/A'}</p>
                    </div>
                    
                    <div class="section">
                        <p><span class="label">Submitted At:</span> ${new Date(data.submittedAt || Date.now()).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

function formatEmailBodyText(data, waitlistId) {
    return `
New Open Studio Waitlist Request
Waitlist ID: ${waitlistId}

CONTACT INFORMATION
Email: ${data.email || 'N/A'}
Course Date: ${data.courseDate || 'N/A'}

Submitted At: ${new Date(data.submittedAt || Date.now()).toLocaleString()}
    `.trim();
}



