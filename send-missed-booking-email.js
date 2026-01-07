// Script to manually send email notification for missed bookings
// This will send emails for bookings that were stored but notifications weren't sent

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const sesClient = new SESClient({ region: 'us-east-2' });
const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.BOOKINGS_TABLE_NAME || 'PotteryBookings';
const FROM_EMAIL = 'Create@potterychicago.com'; // Verified sender email (case-sensitive)
const TO_EMAIL = 'PotteryChicago@gmail.com';

// Import the email formatting functions from the Lambda handler
function formatEmailBody(bookingData, bookingId) {
    const contact = bookingData.contact || {};
    const eventTypes = bookingData.eventTypes || [];
    const workshops = bookingData.workshops || [];
    const dates = bookingData.dates || [];
    const workshopEstimates = bookingData.workshopEstimates || [];
    const totalEstimate = bookingData.totalEstimate || 0;

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
                .notice { background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin-bottom: 20px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Booking Request</h1>
                    <p>Booking ID: ${bookingId}</p>
                </div>
                <div class="content">
                    <div class="notice">
                        <strong>⚠️ Delayed Notification:</strong> This booking was submitted but the initial email notification failed. 
                        This is a manually sent notification.
                    </div>
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
                        <p><span class="label">Total Estimate:</span> $${totalEstimate.toLocaleString()}</p>
                    </div>
                    
                    <div class="section">
                        <p><span class="label">Submitted At:</span> ${new Date(bookingData.submittedAt || bookingData.timestamp || Date.now()).toLocaleString()}</p>
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
    const workshopEstimates = bookingData.workshopEstimates || [];
    const totalEstimate = bookingData.totalEstimate || 0;

    let text = `⚠️ DELAYED NOTIFICATION: This booking was submitted but the initial email notification failed.\n\n`;
    text += `New Booking Request\n`;
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
    text += `  Total Estimate: $${totalEstimate.toLocaleString()}\n`;
    text += `\nSubmitted At: ${new Date(bookingData.submittedAt || bookingData.timestamp || Date.now()).toLocaleString()}\n`;
    
    return text;
}

async function sendBookingEmail(booking) {
    try {
        const bookingId = booking.bookingId;
        const emailSubject = `[DELAYED] New Booking Request: ${booking.contact?.name || 'Unknown'} - ${booking.eventTypes?.join(', ') || 'Event'}`;
        
        const emailBody = formatEmailBody(booking, bookingId);
        const emailBodyText = formatEmailBodyText(booking, bookingId);

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
                        Data: emailBodyText,
                        Charset: 'UTF-8'
                    }
                }
            }
        }));

        console.log(`✅ Email sent successfully for booking ${bookingId}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send email for booking ${booking.bookingId}:`, error.message);
        return false;
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length > 0 && args[0] === '--all') {
        // Send emails for all recent bookings (last 7 days)
        console.log('Checking all recent bookings...\n');
        
        const result = await docClient.send(new ScanCommand({
            TableName: TABLE_NAME
        }));

        if (!result.Items || result.Items.length === 0) {
            console.log('No bookings found.');
            return;
        }

        // Filter bookings from last 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentBookings = result.Items.filter(booking => {
            const timestamp = new Date(booking.timestamp || booking.bookingId || 0).getTime();
            return timestamp >= sevenDaysAgo;
        }).sort((a, b) => {
            const timeA = new Date(a.timestamp || a.bookingId || 0).getTime();
            const timeB = new Date(b.timestamp || b.bookingId || 0).getTime();
            return timeB - timeA;
        });

        console.log(`Found ${recentBookings.length} bookings from the last 7 days.\n`);
        console.log('⚠️  WARNING: This will send emails for ALL recent bookings.');
        console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
        
        await new Promise(resolve => setTimeout(resolve, 5000));

        let successCount = 0;
        let failCount = 0;

        for (const booking of recentBookings) {
            const success = await sendBookingEmail(booking);
            if (success) successCount++;
            else failCount++;
            
            // Small delay between emails
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`\n📊 Summary: ${successCount} sent, ${failCount} failed`);
    } else {
        // Send email for specific booking (mmcalisteryoung@gmail.com)
        console.log('Looking for booking from mmcalisteryoung@gmail.com...\n');
        
        const result = await docClient.send(new ScanCommand({
            TableName: TABLE_NAME
        }));

        const targetBooking = result.Items.find(b => {
            const email = (b.contact || {}).email || '';
            return email.toLowerCase().includes('mmcalisteryoung');
        });

        if (!targetBooking) {
            console.log('❌ Booking not found for mmcalisteryoung@gmail.com');
            return;
        }

        console.log(`Found booking: ${targetBooking.bookingId}`);
        console.log(`Name: ${targetBooking.contact?.name || 'N/A'}`);
        console.log(`Email: ${targetBooking.contact?.email || 'N/A'}`);
        console.log(`Date: ${targetBooking.timestamp}\n`);

        const success = await sendBookingEmail(targetBooking);
        if (success) {
            console.log('\n✅ Email notification sent successfully!');
        } else {
            console.log('\n❌ Failed to send email. Check AWS SES configuration.');
        }
    }
}

main().catch(console.error);

