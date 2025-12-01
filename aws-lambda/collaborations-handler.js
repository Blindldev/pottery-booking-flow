// AWS Lambda function to handle collaboration form submissions
// Uses AWS SDK v3 (Node.js 20.x)

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: 'us-east-2' });

const TABLE_NAME = process.env.COLLABORATIONS_TABLE_NAME || 'Collaborations';
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
        const collaborationData = body;
        
        const collaborationId = `COLLAB-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const timestamp = new Date().toISOString();

        const dbItem = {
            collaborationId,
            timestamp,
            ...collaborationData,
            status: 'pending'
        };

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: dbItem
        }));

        const emailBody = formatEmailBody(collaborationData, collaborationId);
        const emailSubject = `New Collaboration Inquiry: ${collaborationData.organization || collaborationData.name || 'Unknown'}`;

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
                        Data: formatEmailBodyText(collaborationData, collaborationId),
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
                message: 'Collaboration inquiry submitted successfully',
                collaborationId
            })
        };

    } catch (error) {
        console.error('Error processing collaboration:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Failed to process collaboration inquiry',
                error: error.message
            })
        };
    }
};

function formatEmailBody(data, collaborationId) {
    const socialMediaLinks = Object.entries(data.socialMedia || {})
        .filter(([_, value]) => value && value.trim())
        .map(([platform, value]) => `<p><span class="label">${platform.charAt(0).toUpperCase() + platform.slice(1)}:</span> ${value}</p>`)
        .join('');
    
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
                    <h1>New Collaboration Inquiry</h1>
                    <p>Inquiry ID: ${collaborationId}</p>
                </div>
                <div class="content">
                    <div class="section">
                        <h2>Contact Information</h2>
                        <p><span class="label">Name:</span> ${data.name || 'N/A'}</p>
                        <p><span class="label">Email:</span> ${data.email || 'N/A'}</p>
                        <p><span class="label">Phone:</span> ${data.phoneCountry || '+1'} ${data.phone || 'N/A'}</p>
                        <p><span class="label">Organization/Group:</span> ${data.organization || 'N/A'}</p>
                    </div>
                    
                    ${socialMediaLinks ? `
                    <div class="section">
                        <h2>Social Media & Online Presence</h2>
                        ${socialMediaLinks}
                    </div>
                    ` : ''}
                    
                    <div class="section">
                        <h2>Event Details</h2>
                        <p><span class="label">Community Goals:</span></p>
                        <p>${data.communityGoals || 'N/A'}</p>
                        <p><span class="label">Event Vision:</span></p>
                        <p>${data.eventVision || 'N/A'}</p>
                        <p><span class="label">Event Type:</span> ${data.eventType || 'N/A'}</p>
                        ${data.expectedAttendance ? `<p><span class="label">Expected Attendance:</span> ${data.expectedAttendance}</p>` : ''}
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

function formatEmailBodyText(data, collaborationId) {
    const socialMedia = Object.entries(data.socialMedia || {})
        .filter(([_, value]) => value && value.trim())
        .map(([platform, value]) => `  ${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${value}`)
        .join('\n');
    
    return `
New Collaboration Inquiry
Inquiry ID: ${collaborationId}

CONTACT INFORMATION
Name: ${data.name || 'N/A'}
Email: ${data.email || 'N/A'}
Phone: ${data.phoneCountry || '+1'} ${data.phone || 'N/A'}
Organization/Group: ${data.organization || 'N/A'}

${socialMedia ? `SOCIAL MEDIA & ONLINE PRESENCE\n${socialMedia}\n` : ''}
EVENT DETAILS
Community Goals: ${data.communityGoals || 'N/A'}
Event Vision: ${data.eventVision || 'N/A'}
Event Type: ${data.eventType || 'N/A'}
${data.expectedAttendance ? `Expected Attendance: ${data.expectedAttendance}` : ''}

Submitted At: ${new Date(data.submittedAt || Date.now()).toLocaleString()}
    `.trim();
}

