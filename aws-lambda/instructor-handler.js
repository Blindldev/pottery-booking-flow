// AWS Lambda function to handle instructor application submissions
// Uses AWS SDK v3 (Node.js 20.x)

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: 'us-east-2' });

const TABLE_NAME = process.env.INSTRUCTOR_TABLE_NAME || 'InstructorApplications';
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
        const applicationData = body;
        
        const applicationId = `INST-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const timestamp = new Date().toISOString();

        const dbItem = {
            applicationId,
            timestamp,
            ...applicationData,
            status: 'pending'
        };

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: dbItem
        }));

        const emailBody = formatEmailBody(applicationData, applicationId);
        const emailSubject = `New Instructor Application: ${applicationData.name || 'Unknown'}`;

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
                        Data: formatEmailBodyText(applicationData, applicationId),
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
                message: 'Application submitted successfully',
                applicationId
            })
        };

    } catch (error) {
        console.error('Error processing application:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Failed to process application',
                error: error.message
            })
        };
    }
};

function formatEmailBody(data, applicationId) {
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
                    <h1>New Instructor Application</h1>
                    <p>Application ID: ${applicationId}</p>
                </div>
                <div class="content">
                    <div class="section">
                        <h2>Contact Information</h2>
                        <p><span class="label">Name:</span> ${data.name || 'N/A'}</p>
                        <p><span class="label">Email:</span> ${data.email || 'N/A'}</p>
                        <p><span class="label">Phone:</span> ${data.phoneCountry || '+1'} ${data.phone || 'N/A'}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Experience</h2>
                        <p><span class="label">Experience Level:</span> ${data.experience || 'N/A'}</p>
                        <p><span class="label">Description:</span></p>
                        <p>${data.experienceDescription || 'N/A'}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Additional Information</h2>
                        <p><span class="label">How Found Out:</span> ${data.howFoundOut || 'N/A'}</p>
                        <p><span class="label">Aware of Part-Time Status:</span> ${data.awarePartTime ? 'Yes' : 'No'}</p>
                        <p><span class="label">Available Start Date:</span> ${data.startDate || 'N/A'}</p>
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

function formatEmailBodyText(data, applicationId) {
    return `
New Instructor Application
Application ID: ${applicationId}

CONTACT INFORMATION
Name: ${data.name || 'N/A'}
Email: ${data.email || 'N/A'}
Phone: ${data.phoneCountry || '+1'} ${data.phone || 'N/A'}

EXPERIENCE
Experience Level: ${data.experience || 'N/A'}
Description: ${data.experienceDescription || 'N/A'}

ADDITIONAL INFORMATION
How Found Out: ${data.howFoundOut || 'N/A'}
Aware of Part-Time Status: ${data.awarePartTime ? 'Yes' : 'No'}
Available Start Date: ${data.startDate || 'N/A'}

Submitted At: ${new Date(data.submittedAt || Date.now()).toLocaleString()}
    `.trim();
}

