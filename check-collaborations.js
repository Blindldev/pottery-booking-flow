// Script to check collaboration applications in DynamoDB
// This will help identify if applications were stored but emails weren't sent

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Common table names for collaborations
const TABLE_NAMES = [
    'Collaborations',
    'CollaborationApplications',
    'CollaborationsTable'
];

async function checkCollaborations() {
    console.log('Checking DynamoDB for collaboration applications...\n');
    
    for (const tableName of TABLE_NAMES) {
        try {
            const result = await docClient.send(new ScanCommand({
                TableName: tableName
            }));

            if (result.Items && result.Items.length > 0) {
                console.log(`✅ Found ${result.Items.length} collaboration(s) in table: ${tableName}\n`);
                
                // Sort by timestamp (most recent first)
                const sortedCollaborations = result.Items.sort((a, b) => {
                    const timeA = new Date(a.timestamp || a.collaborationId || a.submittedAt || 0).getTime();
                    const timeB = new Date(b.timestamp || b.collaborationId || b.submittedAt || 0).getTime();
                    return timeB - timeA;
                });

                console.log('=== ALL COLLABORATION APPLICATIONS ===\n');

                sortedCollaborations.forEach((collab, index) => {
                    const name = collab.name || collab.contactName || 'N/A';
                    const email = collab.email || collab.contactEmail || 'N/A';
                    const phone = collab.phone || collab.contactPhone || 'N/A';
                    const timestamp = collab.timestamp || collab.collaborationId || collab.submittedAt || 'Unknown';
                    const collaborationId = collab.collaborationId || collab.id || 'N/A';
                    
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
                    console.log(`   Collaboration ID: ${collaborationId}`);
                    console.log(`   Date: ${dateStr}`);
                    
                    // Show additional fields if available
                    if (collab.organization) console.log(`   Organization: ${collab.organization}`);
                    if (collab.eventType) console.log(`   Event Type: ${collab.eventType}`);
                    if (collab.expectedAttendance) console.log(`   Expected Attendance: ${collab.expectedAttendance}`);
                    
                    console.log('');
                });

                // Check which ones likely missed emails (before Dec 20, 2025 fix)
                const fixDate = new Date('2025-12-20T07:30:00Z').getTime();
                console.log('\n=== POTENTIALLY MISSED EMAIL NOTIFICATIONS ===\n');
                console.log('Collaborations submitted before the email fix (Dec 20, 2025) likely missed email notifications:\n');

                const potentiallyMissed = sortedCollaborations.filter(collab => {
                    const timestamp = new Date(collab.timestamp || collab.collaborationId || collab.submittedAt || 0).getTime();
                    return timestamp < fixDate;
                });

                if (potentiallyMissed.length === 0) {
                    console.log('No collaborations found that likely missed email notifications.');
                } else {
                    console.log(`Found ${potentiallyMissed.length} collaboration(s) that may have missed email notifications:\n`);
                    potentiallyMissed.forEach((collab, index) => {
                        const name = collab.name || collab.contactName || 'N/A';
                        const email = collab.email || collab.contactEmail || 'N/A';
                        const timestamp = collab.timestamp || collab.collaborationId || collab.submittedAt || 'Unknown';
                        const collaborationId = collab.collaborationId || collab.id || 'N/A';
                        
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
                        console.log(`   Collaboration ID: ${collaborationId}`);
                        console.log(`   Date: ${dateStr}`);
                        console.log('');
                    });
                }

                // Summary by email
                console.log('\n=== UNIQUE EMAIL ADDRESSES ===\n');
                const emailCounts = {};
                sortedCollaborations.forEach(collab => {
                    const email = collab.email || collab.contactEmail || 'N/A';
                    if (email !== 'N/A') {
                        if (!emailCounts[email]) {
                            emailCounts[email] = [];
                        }
                        const timestamp = collab.timestamp || collab.collaborationId || collab.submittedAt || 'Unknown';
                        let collabDateStr = 'Unknown';
                        try {
                            const date = new Date(timestamp);
                            collabDateStr = date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        } catch (e) {
                            collabDateStr = timestamp;
                        }
                        emailCounts[email].push({
                            name: collab.name || collab.contactName || 'N/A',
                            date: collabDateStr,
                            collaborationId: collab.collaborationId || collab.id || 'N/A'
                        });
                    }
                });

                const uniqueEmails = Object.keys(emailCounts).sort();
                console.log(`Total unique email addresses: ${uniqueEmails.length}\n`);
                uniqueEmails.forEach((email, index) => {
                    const collabs = emailCounts[email];
                    console.log(`${index + 1}. ${email}`);
                    console.log(`   Name: ${collabs[0].name}`);
                    console.log(`   Total Collaborations: ${collabs.length}`);
                    collabs.forEach((collab, idx) => {
                        console.log(`   ${idx + 1}. ${collab.date} - ID: ${collab.collaborationId}`);
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
    
    console.log('❌ No collaboration tables found.');
    console.log('Checked tables:', TABLE_NAMES.join(', '));
    console.log('\nIf collaborations are stored in a different table, please check the Lambda function configuration.');
}

checkCollaborations().catch(console.error);


