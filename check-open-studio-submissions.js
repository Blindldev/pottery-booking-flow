// Script to check open studio form submissions in DynamoDB
// This will help identify if submissions were stored but emails weren't sent

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Common table names for open studio
const TABLE_NAMES = [
    'OpenStudioWaitlist',
    'OpenStudio',
    'OpenStudioSubmissions',
    'OpenStudioTable',
    'OpenStudioRegistrations'
];

async function checkOpenStudioSubmissions() {
    console.log('Checking DynamoDB for open studio form submissions...\n');
    
    for (const tableName of TABLE_NAMES) {
        try {
            const result = await docClient.send(new ScanCommand({
                TableName: tableName
            }));

            if (result.Items && result.Items.length > 0) {
                console.log(`✅ Found ${result.Items.length} submission(s) in table: ${tableName}\n`);
                
                // Sort by timestamp (most recent first)
                const sortedSubmissions = result.Items.sort((a, b) => {
                    const timeA = new Date(a.timestamp || a.submissionId || a.submittedAt || 0).getTime();
                    const timeB = new Date(b.timestamp || b.submissionId || b.submittedAt || 0).getTime();
                    return timeB - timeA;
                });

                console.log('=== ALL OPEN STUDIO SUBMISSIONS ===\n');

                sortedSubmissions.forEach((submission, index) => {
                    const name = submission.name || submission.fullName || 'N/A';
                    const email = submission.email || 'N/A';
                    const phone = submission.phone || submission.phoneNumber || 'N/A';
                    const timestamp = submission.timestamp || submission.submissionId || submission.submittedAt || 'Unknown';
                    const submissionId = submission.submissionId || submission.id || 'N/A';
                    
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
                    console.log(`   Submission ID: ${submissionId}`);
                    console.log(`   Date: ${dateStr}`);
                    
                    // Show additional fields if available
                    if (submission.date) console.log(`   Date: ${submission.date}`);
                    if (submission.time) console.log(`   Time: ${submission.time}`);
                    if (submission.notes) console.log(`   Notes: ${submission.notes.substring(0, 100)}...`);
                    if (submission.numberOfPeople) console.log(`   Number of People: ${submission.numberOfPeople}`);
                    
                    console.log('');
                });

                // Check which ones likely missed emails (before Dec 20, 2025 fix)
                const fixDate = new Date('2025-12-20T07:30:00Z').getTime();
                console.log('\n=== POTENTIALLY MISSED EMAIL NOTIFICATIONS ===\n');
                console.log('Submissions made before the email fix (Dec 20, 2025) likely missed email notifications:\n');

                const potentiallyMissed = sortedSubmissions.filter(sub => {
                    const timestamp = new Date(sub.timestamp || sub.submissionId || sub.submittedAt || 0).getTime();
                    return timestamp < fixDate;
                });

                if (potentiallyMissed.length === 0) {
                    console.log('No submissions found that likely missed email notifications.');
                } else {
                    console.log(`Found ${potentiallyMissed.length} submission(s) that may have missed email notifications:\n`);
                    potentiallyMissed.forEach((sub, index) => {
                        const name = sub.name || sub.fullName || 'N/A';
                        const email = sub.email || 'N/A';
                        const timestamp = sub.timestamp || sub.submissionId || sub.submittedAt || 'Unknown';
                        const submissionId = sub.submissionId || sub.id || 'N/A';
                        
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
                        console.log(`   Submission ID: ${submissionId}`);
                        console.log(`   Date: ${dateStr}`);
                        console.log('');
                    });
                }

                // Summary by email
                console.log('\n=== UNIQUE EMAIL ADDRESSES ===\n');
                const emailCounts = {};
                sortedSubmissions.forEach(sub => {
                    const email = sub.email || 'N/A';
                    if (email !== 'N/A') {
                        if (!emailCounts[email]) {
                            emailCounts[email] = [];
                        }
                        const timestamp = sub.timestamp || sub.submissionId || sub.submittedAt || 'Unknown';
                        let subDateStr = 'Unknown';
                        try {
                            const date = new Date(timestamp);
                            subDateStr = date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        } catch (e) {
                            subDateStr = timestamp;
                        }
                        emailCounts[email].push({
                            name: sub.name || sub.fullName || 'N/A',
                            date: subDateStr,
                            submissionId: sub.submissionId || sub.id || 'N/A'
                        });
                    }
                });

                const uniqueEmails = Object.keys(emailCounts).sort();
                console.log(`Total unique email addresses: ${uniqueEmails.length}\n`);
                uniqueEmails.forEach((email, index) => {
                    const subs = emailCounts[email];
                    console.log(`${index + 1}. ${email}`);
                    console.log(`   Name: ${subs[0].name}`);
                    console.log(`   Total Submissions: ${subs.length}`);
                    subs.forEach((sub, idx) => {
                        console.log(`   ${idx + 1}. ${sub.date} - ID: ${sub.submissionId}`);
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
    
    console.log('❌ No open studio submission tables found.');
    console.log('Checked tables:', TABLE_NAMES.join(', '));
    console.log('\nIf submissions are stored in a different table, please check the Lambda function configuration.');
    console.log('\nAlso check:');
    console.log('1. Is the form actually submitting? (Check browser console for errors)');
    console.log('2. Is the API endpoint configured correctly?');
    console.log('3. Are there any CORS issues?');
}

checkOpenStudioSubmissions().catch(console.error);

