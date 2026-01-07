// Script to check recent bookings in DynamoDB
// This will help identify if bookings were stored but emails weren't sent

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.BOOKINGS_TABLE_NAME || 'PotteryBookings';

async function checkRecentBookings() {
    try {
        console.log('Scanning DynamoDB table for recent bookings...\n');
        
        // Scan the table (for small tables, this is fine)
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
        console.log('=== RECENT BOOKINGS (Last 20) ===\n');

        // Show last 20 bookings
        const recentBookings = sortedBookings.slice(0, 20);
        
        recentBookings.forEach((booking, index) => {
            const contact = booking.contact || {};
            const email = contact.email || 'N/A';
            const name = contact.name || 'N/A';
            const timestamp = booking.timestamp || booking.bookingId || 'Unknown';
            const bookingId = booking.bookingId || 'N/A';
            
            console.log(`${index + 1}. Booking ID: ${bookingId}`);
            console.log(`   Name: ${name}`);
            console.log(`   Email: ${email}`);
            console.log(`   Timestamp: ${timestamp}`);
            console.log(`   Status: ${booking.status || 'N/A'}`);
            
            // Highlight the specific email we're looking for
            if (email.toLowerCase().includes('mmcalisteryoung')) {
                console.log(`   ⚠️  THIS IS THE BOOKING YOU'RE LOOKING FOR!`);
            }
            
            console.log('');
        });

        // Check specifically for the email
        const targetBooking = sortedBookings.find(b => {
            const email = (b.contact || {}).email || '';
            return email.toLowerCase().includes('mmcalisteryoung');
        });

        if (targetBooking) {
            console.log('\n=== FOUND BOOKING FOR mmcalisteryoung@gmail.com ===\n');
            console.log(JSON.stringify(targetBooking, null, 2));
        } else {
            console.log('\n⚠️  No booking found for mmcalisteryoung@gmail.com');
            console.log('This could mean:');
            console.log('1. The booking was never submitted');
            console.log('2. The booking failed before reaching DynamoDB');
            console.log('3. The email address is different');
        }

    } catch (error) {
        console.error('Error checking bookings:', error);
        console.error('\nMake sure you have AWS credentials configured and the correct region.');
    }
}

checkRecentBookings();


