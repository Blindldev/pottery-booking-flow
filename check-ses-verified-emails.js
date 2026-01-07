// Script to check which email addresses are verified in SES

const { SESClient, ListIdentitiesCommand, GetIdentityVerificationAttributesCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({ region: 'us-east-2' });

async function checkVerifiedEmails() {
    try {
        console.log('Checking verified email addresses in SES (us-east-2)...\n');
        
        // List all identities
        const identitiesResult = await sesClient.send(new ListIdentitiesCommand({}));
        
        if (!identitiesResult.Identities || identitiesResult.Identities.length === 0) {
            console.log('❌ No email identities found in SES.');
            console.log('\nYou need to verify at least one email address in SES:');
            console.log('1. Go to AWS Console → SES → Verified identities');
            console.log('2. Click "Create identity"');
            console.log('3. Select "Email address"');
            console.log('4. Enter: create@potterychicago.com');
            console.log('5. Check your email and click the verification link');
            return;
        }

        console.log(`Found ${identitiesResult.Identities.length} identity(ies):\n`);

        // Get verification status for each
        const verificationResult = await sesClient.send(new GetIdentityVerificationAttributesCommand({
            Identities: identitiesResult.Identities
        }));

        const verifiedEmails = [];
        const unverifiedEmails = [];

        for (const identity of identitiesResult.Identities) {
            const attributes = verificationResult.VerificationAttributes[identity];
            if (attributes && attributes.VerificationStatus === 'Success') {
                verifiedEmails.push(identity);
                console.log(`✅ ${identity} - VERIFIED`);
            } else {
                unverifiedEmails.push(identity);
                console.log(`❌ ${identity} - NOT VERIFIED`);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Verified: ${verifiedEmails.length}`);
        console.log(`   Unverified: ${unverifiedEmails.length}`);

        if (verifiedEmails.length === 0) {
            console.log('\n⚠️  WARNING: No verified email addresses found!');
            console.log('You need to verify at least one email address to send emails.');
        } else {
            console.log('\n✅ Verified email addresses that can be used as FROM_EMAIL:');
            verifiedEmails.forEach(email => console.log(`   - ${email}`));
        }

        // Check if create@potterychicago.com is verified
        if (verifiedEmails.includes('create@potterychicago.com')) {
            console.log('\n✅ create@potterychicago.com is verified - emails should work!');
        } else {
            console.log('\n❌ create@potterychicago.com is NOT verified!');
            console.log('This is why emails are failing.');
            console.log('\nTo fix this:');
            console.log('1. Go to AWS Console → SES → Verified identities');
            console.log('2. Click "Create identity"');
            console.log('3. Select "Email address"');
            console.log('4. Enter: create@potterychicago.com');
            console.log('5. Check your email and click the verification link');
        }

    } catch (error) {
        console.error('Error checking SES:', error);
    }
}

checkVerifiedEmails();


