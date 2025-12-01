// AWS Lambda function to handle contact form submissions
// Uses AWS SDK v3 (Node.js 20.x)

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: 'us-east-2' });

const TABLE_NAME = process.env.CONTACT_TABLE_NAME || 'ContactMessages';
const FROM_EMAIL = 'create@potterychicago.com';
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
        const contactData = body;
        
        const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const timestamp = new Date().toISOString();

        const dbItem = {
            messageId,
            timestamp,
            ...contactData,
            status: 'new'
        };

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: dbItem
        }));

        const emailBody = formatEmailBody(contactData, messageId);
        const emailSubject = `New Contact Message from ${contactData.name || 'Unknown'}`;

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
                        Data: formatEmailBodyText(contactData, messageId),
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
                message: 'Message sent successfully',
                messageId
            })
        };

    } catch (error) {
        console.error('Error processing contact message:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Failed to send message',
                error: error.message
            })
        };
    }
};

function formatEmailBody(data, messageId) {
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
                .message-box { background-color: #f0f0f0; padding: 15px; border-radius: 8px; border-left: 4px solid #C56A46; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Contact Message</h1>
                    <p>Message ID: ${messageId}</p>
                </div>
                <div class="content">
                    <div class="section">
                        <h2>Contact Information</h2>
                        <p><span class="label">Name:</span> ${data.name || 'N/A'}</p>
                        <p><span class="label">Email:</span> ${data.email || 'N/A'}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Message</h2>
                        <div class="message-box">
                            ${(data.message || 'N/A').replace(/\n/g, '<br>')}
                        </div>
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

function formatEmailBodyText(data, messageId) {
    return `
New Contact Message
Message ID: ${messageId}

CONTACT INFORMATION
Name: ${data.name || 'N/A'}
Email: ${data.email || 'N/A'}

MESSAGE
${data.message || 'N/A'}

Submitted At: ${new Date(data.submittedAt || Date.now()).toLocaleString()}
    `.trim();
}

