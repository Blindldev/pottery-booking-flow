// Script to list all bookings with their email addresses
// This helps identify which bookings may have missed email notifications

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.BOOKINGS_TABLE_NAME || 'PotteryBookings';

async function listAllBookingEmails() {
    try {
        console.log('Scanning DynamoDB for all bookings...\n');
        
        const result = await docClient.send(new ScanCommand({
            TableName: TABLE_NAME
        }));

        if (!result.Items || result.Items.length === 0) {
            console.log('No bookings found in the table.');
            return;
        }

        // Sort by timestamp (most recent first)
        const sortedBookings = result.Items.sort((a, b) => {
            const timeA = new Date(a.timestamp || a.bookingId || 0).getTime();
            const timeB = new Date(b.timestamp || b.bookingId || 0).getTime();
            return timeB - timeA;
        });

        console.log(`Found ${sortedBookings.length} total bookings\n`);
        console.log('=== ALL BOOKING EMAILS (Most Recent First) ===\n');

        const emailList = [];
        const emailCounts = {};

        sortedBookings.forEach((booking, index) => {
            const contact = booking.contact || {};
            const email = contact.email || 'N/A';
            const name = contact.name || 'N/A';
            const timestamp = booking.timestamp || booking.bookingId || 'Unknown';
            const bookingId = booking.bookingId || 'N/A';
            const eventTypes = booking.eventTypes || [];
            const groupSize = booking.groupSize || 'N/A';
            
            // Format date
            let dateStr = 'Unknown';
            try {
                const date = new Date(timestamp);
                dateStr = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                dateStr = timestamp;
            }

            console.log(`${index + 1}. ${name}`);
            console.log(`   Email: ${email}`);
            console.log(`   Booking ID: ${bookingId}`);
            console.log(`   Date: ${dateStr}`);
            console.log(`   Event: ${eventTypes.join(', ') || 'N/A'}`);
            console.log(`   Group Size: ${groupSize}`);
            console.log('');

            // Track unique emails
            if (email !== 'N/A') {
                if (!emailCounts[email]) {
                    emailCounts[email] = [];
                }
                emailCounts[email].push({
                    bookingId,
                    name,
                    date: dateStr,
                    eventTypes,
                    groupSize
                });
            }

            emailList.push({
                email,
                name,
                bookingId,
                date: dateStr,
                eventTypes,
                groupSize
            });
        });

        console.log('\n=== UNIQUE EMAIL ADDRESSES ===\n');
        const uniqueEmails = Object.keys(emailCounts).sort();
        console.log(`Total unique email addresses: ${uniqueEmails.length}\n`);

        uniqueEmails.forEach((email, index) => {
            const bookings = emailCounts[email];
            console.log(`${index + 1}. ${email}`);
            console.log(`   Name: ${bookings[0].name}`);
            console.log(`   Total Bookings: ${bookings.length}`);
            bookings.forEach((booking, idx) => {
                console.log(`   ${idx + 1}. ${booking.date} - ${booking.eventTypes.join(', ') || 'N/A'} (${booking.groupSize} people)`);
            });
            console.log('');
        });

        // Estimate which bookings likely missed emails
        // Based on the email fix date (Dec 20, 2025), bookings before that likely missed emails
        const fixDate = new Date('2025-12-20T07:30:00Z').getTime();
        console.log('\n=== POTENTIALLY MISSED EMAIL NOTIFICATIONS ===\n');
        console.log('Bookings submitted before the email fix (Dec 20, 2025) likely missed email notifications:\n');

        const potentiallyMissed = sortedBookings.filter(booking => {
            const timestamp = new Date(booking.timestamp || booking.bookingId || 0).getTime();
            return timestamp < fixDate;
        });

        if (potentiallyMissed.length === 0) {
            console.log('No bookings found that likely missed email notifications.');
        } else {
            console.log(`Found ${potentiallyMissed.length} booking(s) that may have missed email notifications:\n`);
            potentiallyMissed.forEach((booking, index) => {
                const contact = booking.contact || {};
                const email = contact.email || 'N/A';
                const name = contact.name || 'N/A';
                const timestamp = booking.timestamp || booking.bookingId || 'Unknown';
                const bookingId = booking.bookingId || 'N/A';
                
                let dateStr = 'Unknown';
                try {
                    const date = new Date(timestamp);
                    dateStr = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (e) {
                    dateStr = timestamp;
                }

                console.log(`${index + 1}. ${name} (${email})`);
                console.log(`   Booking ID: ${bookingId}`);
                console.log(`   Date: ${dateStr}`);
                console.log(`   Event: ${(booking.eventTypes || []).join(', ') || 'N/A'}`);
                console.log('');
            });
        }

        // Export to CSV format
        console.log('\n=== EMAIL LIST (CSV Format) ===\n');
        console.log('Email,Name,Booking ID,Date,Event Types,Group Size');
        emailList.forEach(item => {
            const csvRow = [
                item.email,
                `"${item.name}"`,
                item.bookingId,
                `"${item.date}"`,
                `"${item.eventTypes.join(', ')}"`,
                item.groupSize
            ].join(',');
            console.log(csvRow);
        });

    } catch (error) {
        console.error('Error checking bookings:', error);
        console.error('\nMake sure you have AWS credentials configured and the correct region.');
    }
}

listAllBookingEmails();


