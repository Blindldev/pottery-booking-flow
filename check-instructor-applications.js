// Script to check instructor/staff applications in DynamoDB
// This will help identify if applications were stored but emails weren't sent

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Common table names for instructor applications
const TABLE_NAMES = [
    'InstructorApplications',
    'StaffApplications',
    'InstructorApplicationsTable'
];

async function checkInstructorApplications() {
    console.log('Checking DynamoDB for instructor/staff applications...\n');
    
    for (const tableName of TABLE_NAMES) {
        try {
            const result = await docClient.send(new ScanCommand({
                TableName: tableName
            }));

            if (result.Items && result.Items.length > 0) {
                console.log(`✅ Found ${result.Items.length} application(s) in table: ${tableName}\n`);
                
                // Sort by timestamp (most recent first)
                const sortedApplications = result.Items.sort((a, b) => {
                    const timeA = new Date(a.timestamp || a.applicationId || a.submittedAt || 0).getTime();
                    const timeB = new Date(b.timestamp || b.applicationId || b.submittedAt || 0).getTime();
                    return timeB - timeA;
                });

                console.log('=== ALL INSTRUCTOR/STAFF APPLICATIONS ===\n');

                sortedApplications.forEach((app, index) => {
                    const name = app.name || app.fullName || 'N/A';
                    const email = app.email || 'N/A';
                    const phone = app.phone || app.phoneNumber || 'N/A';
                    const timestamp = app.timestamp || app.applicationId || app.submittedAt || 'Unknown';
                    const applicationId = app.applicationId || app.id || 'N/A';
                    
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
                    console.log(`   Phone: ${phone}`);
                    console.log(`   Application ID: ${applicationId}`);
                    console.log(`   Date: ${dateStr}`);
                    
                    // Show additional fields if available
                    if (app.experience) console.log(`   Experience: ${app.experience}`);
                    if (app.availability) console.log(`   Availability: ${app.availability}`);
                    if (app.background) console.log(`   Background: ${app.background.substring(0, 100)}...`);
                    if (app.whyInterested) console.log(`   Why Interested: ${app.whyInterested.substring(0, 100)}...`);
                    
                    console.log('');
                });

                // Check which ones likely missed emails (before Dec 20, 2025 fix)
                const fixDate = new Date('2025-12-20T07:30:00Z').getTime();
                console.log('\n=== POTENTIALLY MISSED EMAIL NOTIFICATIONS ===\n');
                console.log('Applications submitted before the email fix (Dec 20, 2025) likely missed email notifications:\n');

                const potentiallyMissed = sortedApplications.filter(app => {
                    const timestamp = new Date(app.timestamp || app.applicationId || app.submittedAt || 0).getTime();
                    return timestamp < fixDate;
                });

                if (potentiallyMissed.length === 0) {
                    console.log('No applications found that likely missed email notifications.');
                } else {
                    console.log(`Found ${potentiallyMissed.length} application(s) that may have missed email notifications:\n`);
                    potentiallyMissed.forEach((app, index) => {
                        const name = app.name || app.fullName || 'N/A';
                        const email = app.email || 'N/A';
                        const timestamp = app.timestamp || app.applicationId || app.submittedAt || 'Unknown';
                        const applicationId = app.applicationId || app.id || 'N/A';
                        
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
                        console.log(`   Application ID: ${applicationId}`);
                        console.log(`   Date: ${dateStr}`);
                        console.log('');
                    });
                }

                // Summary by email
                console.log('\n=== UNIQUE EMAIL ADDRESSES ===\n');
                const emailCounts = {};
                sortedApplications.forEach(app => {
                    const email = app.email || 'N/A';
                    if (email !== 'N/A') {
                        if (!emailCounts[email]) {
                            emailCounts[email] = [];
                        }
                        const timestamp = app.timestamp || app.applicationId || app.submittedAt || 'Unknown';
                        let appDateStr = 'Unknown';
                        try {
                            const date = new Date(timestamp);
                            appDateStr = date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        } catch (e) {
                            appDateStr = timestamp;
                        }
                        emailCounts[email].push({
                            name: app.name || app.fullName || 'N/A',
                            date: appDateStr,
                            applicationId: app.applicationId || app.id || 'N/A'
                        });
                    }
                });

                const uniqueEmails = Object.keys(emailCounts).sort();
                console.log(`Total unique email addresses: ${uniqueEmails.length}\n`);
                uniqueEmails.forEach((email, index) => {
                    const apps = emailCounts[email];
                    console.log(`${index + 1}. ${email}`);
                    console.log(`   Name: ${apps[0].name}`);
                    console.log(`   Total Applications: ${apps.length}`);
                    apps.forEach((app, idx) => {
                        console.log(`   ${idx + 1}. ${app.date} - ID: ${app.applicationId}`);
                    });
                    console.log('');
                });

                return; // Found the table, no need to check others
            }
        } catch (error) {
            if (error.name === 'ResourceNotFoundException') {
                // Table doesn't exist, try next one
                continue;
            } else {
                console.error(`Error checking table ${tableName}:`, error.message);
            }
        }
    }
    
    console.log('❌ No instructor application tables found.');
    console.log('Checked tables:', TABLE_NAMES.join(', '));
    console.log('\nIf applications are stored in a different table, please check the Lambda function configuration.');
}

checkInstructorApplications().catch(console.error);

