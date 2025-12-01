// AWS Lambda function to handle booking submissions
// This function stores booking data and sends confirmation email

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES({ region: 'us-east-2' }); // Updated to match API Gateway region

const TABLE_NAME = process.env.BOOKINGS_TABLE_NAME || 'PotteryBookings';
const FROM_EMAIL = 'PotteryChicago@gmail.com';
const TO_EMAIL = 'PotteryChicago@gmail.com';

exports.handler = async (event) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'OK' })
        };
    }

    try {
        // Parse request body
        const bookingData = JSON.parse(event.body);
        
        // Generate unique booking ID
        const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const timestamp = new Date().toISOString();

        // Prepare data for DynamoDB
        const dbItem = {
            bookingId,
            timestamp,
            ...bookingData,
            status: 'pending'
        };

        // Store in DynamoDB
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: dbItem
        }).promise();

        // Format email content
        const emailBody = formatEmailBody(bookingData, bookingId);
        const emailSubject = `New Booking Request: ${bookingData.contact?.name || 'Unknown'} - ${bookingData.eventTypes?.join(', ') || 'Event'}`;

        // Send email via SES
        await ses.sendEmail({
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
                        Data: formatEmailBodyText(bookingData, bookingId),
                        Charset: 'UTF-8'
                    }
                }
            }
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Booking submitted successfully',
                bookingId
            })
        };

    } catch (error) {
        console.error('Error processing booking:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Failed to process booking',
                error: error.message
            })
        };
    }
};

function formatEmailBody(bookingData, bookingId) {
    const effectiveGroupSize = bookingData.exactGroupSize || bookingData.groupSize;
    
    let html = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #C56A46; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .section { margin-bottom: 20px; padding: 15px; background-color: white; border-radius: 4px; }
            .label { font-weight: bold; color: #C56A46; }
            .value { margin-left: 10px; }
            .workshop { background-color: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎨 New Pottery Booking Request</h1>
                <p>Booking ID: ${bookingId}</p>
            </div>
            <div class="content">
                <div class="section">
                    <h2>Contact Information</h2>
                    <p><span class="label">Name:</span><span class="value">${bookingData.contact?.name || 'N/A'}</span></p>
                    <p><span class="label">Email:</span><span class="value">${bookingData.contact?.email || 'N/A'}</span></p>
                    <p><span class="label">Phone:</span><span class="value">${bookingData.contact?.phone || 'N/A'}</span></p>
                    ${bookingData.contact?.notes ? `<p><span class="label">Notes:</span><span class="value">${bookingData.contact.notes}</span></p>` : ''}
                </div>

                <div class="section">
                    <h2>Event Details</h2>
                    <p><span class="label">Event Type(s):</span><span class="value">${bookingData.eventTypes?.join(', ') || 'N/A'}</span></p>
                    <p><span class="label">Group Size:</span><span class="value">${effectiveGroupSize} guests</span></p>
                    <p><span class="label">Venue:</span><span class="value">${bookingData.venue || 'N/A'}</span></p>
                </div>

                <div class="section">
                    <h2>Workshops Selected</h2>
                    ${bookingData.workshops?.map(workshop => `
                        <div class="workshop">
                            <strong>${workshop}</strong>
                            ${bookingData.workshopEstimates?.find(e => e.workshop === workshop) ? `
                                <p>Per Person: $${bookingData.workshopEstimates.find(e => e.workshop === workshop).perPerson}</p>
                                <p>Total: $${bookingData.workshopEstimates.find(e => e.workshop === workshop).total.toLocaleString()}</p>
                            ` : ''}
                        </div>
                    `).join('') || '<p>No workshops selected</p>'}
                </div>

                <div class="section">
                    <h2>Dates</h2>
                    ${bookingData.flexibleDates?.start ? `
                        <p><span class="label">Flexible Date:</span><span class="value">${bookingData.flexibleDates.start} (±${bookingData.flexibleDates.flexibility || 0} days)</span></p>
                    ` : ''}
                    ${bookingData.dates?.length > 0 ? `
                        <p><span class="label">Preferred Dates:</span></p>
                        <ul>
                            ${bookingData.dates.map(date => `<li>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>`).join('')}
                        </ul>
                    ` : '<p>No specific dates provided</p>'}
                </div>

                ${bookingData.totalEstimate ? `
                <div class="section">
                    <h2>Estimated Total</h2>
                    <p style="font-size: 24px; font-weight: bold; color: #C56A46;">$${bookingData.totalEstimate.toLocaleString()}</p>
                    <p style="font-size: 12px; color: #666;"><em>This is an estimate and will be finalized upon confirmation.</em></p>
                </div>
                ` : ''}
            </div>
            <div class="footer">
                <p>Submitted: ${new Date().toLocaleString()}</p>
                <p>Please contact the customer within 24 hours to confirm availability.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    return html;
}

function formatEmailBodyText(bookingData, bookingId) {
    const effectiveGroupSize = bookingData.exactGroupSize || bookingData.groupSize;
    
    let text = `
NEW POTTERY BOOKING REQUEST
Booking ID: ${bookingId}

CONTACT INFORMATION
Name: ${bookingData.contact?.name || 'N/A'}
Email: ${bookingData.contact?.email || 'N/A'}
Phone: ${bookingData.contact?.phone || 'N/A'}
${bookingData.contact?.notes ? `Notes: ${bookingData.contact.notes}` : ''}

EVENT DETAILS
Event Type(s): ${bookingData.eventTypes?.join(', ') || 'N/A'}
Group Size: ${effectiveGroupSize} guests
Venue: ${bookingData.venue || 'N/A'}

WORKSHOPS SELECTED
${bookingData.workshops?.map(workshop => {
    const estimate = bookingData.workshopEstimates?.find(e => e.workshop === workshop);
    return `- ${workshop}${estimate ? ` ($${estimate.perPerson}/person, Total: $${estimate.total.toLocaleString()})` : ''}`;
}).join('\n') || 'No workshops selected'}

DATES
${bookingData.flexibleDates?.start ? `Flexible Date: ${bookingData.flexibleDates.start} (±${bookingData.flexibleDates.flexibility || 0} days)` : ''}
${bookingData.dates?.length > 0 ? `Preferred Dates:\n${bookingData.dates.map(date => `- ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`).join('\n')}` : 'No specific dates provided'}

${bookingData.totalEstimate ? `ESTIMATED TOTAL: $${bookingData.totalEstimate.toLocaleString()}\n(This is an estimate and will be finalized upon confirmation.)` : ''}

Submitted: ${new Date().toLocaleString()}
Please contact the customer within 24 hours to confirm availability.
    `;
    
    return text.trim();
}

