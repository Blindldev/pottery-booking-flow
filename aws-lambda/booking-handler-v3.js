// AWS Lambda function to handle booking submissions
// This function stores booking data and sends confirmation email
// Updated for AWS SDK v3 (Node.js 20.x)

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: 'us-east-2' });

const TABLE_NAME = process.env.BOOKINGS_TABLE_NAME || 'PotteryBookings';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Create@potterychicago.com'; // Verified sender (SES)
const TO_EMAIL = process.env.TO_EMAIL || 'potteryupdates@gmail.com'; // Always notify this address

exports.handler = async (event) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'OK' })
        };
    }

    try {
        // Parse request body (API Gateway v1/v2, optional base64)
        let bookingData;
        try {
            let rawBody = event.body;
            if (event.isBase64Encoded && typeof rawBody === 'string') {
                rawBody = Buffer.from(rawBody, 'base64').toString('utf8');
            }
            if (typeof rawBody === 'string') {
                bookingData = rawBody ? JSON.parse(rawBody) : {};
            } else if (rawBody && typeof rawBody === 'object') {
                bookingData = rawBody;
            } else {
                bookingData = {};
            }
        } catch (parseErr) {
            console.error('Body parse error:', parseErr);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'Invalid request body' })
            };
        }

        const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const timestamp = new Date().toISOString();

        // Build DynamoDB item (strip undefined so DynamoDB is happy)
        const dbItem = sanitizeForDynamoDB({
            bookingId,
            timestamp,
            ...bookingData,
            status: 'pending'
        });

        // Store in DynamoDB first (source of truth)
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: dbItem
        }));

        // Send email (best-effort: don't fail the request if email fails)
        let emailSent = false;
        try {
            const emailBody = formatEmailBody(bookingData, bookingId);
            const emailSubject = `New Booking Request: ${bookingData.contact?.name || 'Unknown'} - ${(bookingData.eventTypes || []).join(', ') || 'Event'}`;
            const toAddresses = [TO_EMAIL];
            if (process.env.TO_EMAIL_EXTRA) toAddresses.push(process.env.TO_EMAIL_EXTRA);
            await sesClient.send(new SendEmailCommand({
                Source: FROM_EMAIL,
                Destination: { ToAddresses: toAddresses },
                Message: {
                    Subject: { Data: emailSubject, Charset: 'UTF-8' },
                    Body: {
                        Html: { Data: emailBody, Charset: 'UTF-8' },
                        Text: { Data: formatEmailBodyText(bookingData, bookingId), Charset: 'UTF-8' }
                    }
                }
            }));
            emailSent = true;
        } catch (emailErr) {
            console.error('Email send failed (booking saved):', emailErr);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Booking submitted successfully',
                bookingId,
                emailSent
            })
        };
    } catch (error) {
        console.error('Error processing booking:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'We couldn’t save your booking. Please try again or email potteryupdates@gmail.com with your event details.'
            })
        };
    }
};

function sanitizeForDynamoDB(obj) {
    if (obj === null || obj === undefined) return undefined;
    if (Array.isArray(obj)) return obj.map(sanitizeForDynamoDB).filter(v => v !== undefined);
    if (typeof obj === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(obj)) {
            if (v === undefined) continue;
            const s = sanitizeForDynamoDB(v);
            if (s !== undefined) out[k] = s;
        }
        return out;
    }
    return obj;
}

function formatEmailBody(bookingData, bookingId) {
    const contact = bookingData.contact || {};
    const eventTypes = bookingData.eventTypes || [];
    const dates = bookingData.dates || [];
    const workshopEstimates = Array.isArray(bookingData.workshopEstimates) ? bookingData.workshopEstimates : [];
    const totalEstimate = Number(bookingData.totalEstimate) || 0;

    let workshopsHtml = '';
    workshopEstimates.forEach(est => {
        workshopsHtml += `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${est.workshop || 'N/A'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${est.perPerson || 0}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${est.total || 0}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${est.readinessNote || 'N/A'}</td>
            </tr>
        `;
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #C56A46; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .section { margin-bottom: 20px; }
                .label { font-weight: bold; color: #C56A46; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { background-color: #C56A46; color: white; padding: 10px; text-align: left; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Booking Request</h1>
                    <p>Booking ID: ${bookingId}</p>
                </div>
                <div class="content">
                    <div class="section">
                        <h2>Contact Information</h2>
                        <p><span class="label">Name:</span> ${contact.name || 'N/A'}</p>
                        <p><span class="label">Email:</span> ${contact.email || 'N/A'}</p>
                        <p><span class="label">Phone:</span> ${contact.phone || 'N/A'}</p>
                        ${contact.notes ? `<p><span class="label">Notes:</span> ${contact.notes}</p>` : ''}
                    </div>
                    
                    <div class="section">
                        <h2>Event Details</h2>
                        <p><span class="label">Event Type(s):</span> ${eventTypes.join(', ') || 'N/A'}</p>
                        <p><span class="label">Group Size:</span> ${bookingData.groupSize || 'N/A'}</p>
                        ${bookingData.exactGroupSize ? `<p><span class="label">Exact Group Size:</span> ${bookingData.exactGroupSize}</p>` : ''}
                        <p><span class="label">Venue:</span> ${bookingData.venue || 'N/A'}</p>
                        <p><span class="label">Preferred Dates:</span> ${dates.join(', ') || 'N/A'}</p>
                        ${bookingData.flexibleDates ? `<p><span class="label">Flexible Dates:</span> Yes</p>` : ''}
                        ${bookingData.timeslots && bookingData.timeslots.length > 0 ? `<p><span class="label">Preferred Timeslots:</span> ${bookingData.timeslots.join(', ')}</p>` : ''}
                        ${bookingData.specificTime ? `<p><span class="label">Specific Time:</span> ${bookingData.specificTime}</p>` : ''}
                    </div>
                    
                    <div class="section">
                        <h2>Workshop Selections</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Workshop</th>
                                    <th>Per Person</th>
                                    <th>Total</th>
                                    <th>Readiness</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${workshopsHtml}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="section">
                        <h2>Pricing Summary</h2>
                        <p><span class="label">Total Estimate:</span> $${(totalEstimate || 0).toLocaleString()}</p>
                    </div>
                    
                    <div class="section">
                        <p><span class="label">Submitted At:</span> ${new Date(bookingData.submittedAt || Date.now()).toLocaleString()}</p>
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated email from Pottery Chicago Booking System</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function formatEmailBodyText(bookingData, bookingId) {
    const contact = bookingData.contact || {};
    const eventTypes = bookingData.eventTypes || [];
    const dates = bookingData.dates || [];
    const workshopEstimates = Array.isArray(bookingData.workshopEstimates) ? bookingData.workshopEstimates : [];
    const totalEstimate = Number(bookingData.totalEstimate) || 0;

    let text = `New Booking Request\n`;
    text += `Booking ID: ${bookingId}\n\n`;
    text += `Contact Information:\n`;
    text += `  Name: ${contact.name || 'N/A'}\n`;
    text += `  Email: ${contact.email || 'N/A'}\n`;
    text += `  Phone: ${contact.phone || 'N/A'}\n`;
    if (contact.notes) text += `  Notes: ${contact.notes}\n`;
    text += `\nEvent Details:\n`;
    text += `  Event Type(s): ${eventTypes.join(', ') || 'N/A'}\n`;
    text += `  Group Size: ${bookingData.groupSize || 'N/A'}\n`;
    if (bookingData.exactGroupSize) text += `  Exact Group Size: ${bookingData.exactGroupSize}\n`;
    text += `  Venue: ${bookingData.venue || 'N/A'}\n`;
    text += `  Preferred Dates: ${dates.join(', ') || 'N/A'}\n`;
    if (bookingData.flexibleDates) text += `  Flexible Dates: Yes\n`;
    if (bookingData.timeslots && bookingData.timeslots.length > 0) {
        text += `  Preferred Timeslots: ${bookingData.timeslots.join(', ')}\n`;
    }
    if (bookingData.specificTime) {
        text += `  Specific Time: ${bookingData.specificTime}\n`;
    }
    text += `\nWorkshop Selections:\n`;
    workshopEstimates.forEach(est => {
        text += `  - ${est.workshop || 'N/A'}: $${est.perPerson || 0} per person, Total: $${est.total || 0}\n`;
        if (est.readinessNote) text += `    Readiness: ${est.readinessNote}\n`;
    });
    text += `\nPricing Summary:\n`;
    text += `  Total Estimate: $${(totalEstimate || 0).toLocaleString()}\n`;
    text += `\nSubmitted At: ${new Date(bookingData.submittedAt || Date.now()).toLocaleString()}\n`;
    
    return text;
}

