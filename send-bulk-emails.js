// Script to send thank you emails to multiple recipients with discount offers
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({ region: 'us-east-2' });

const FROM_EMAIL = 'The Pottery Loop <create@potterychicago.com>';

// Recipients list
const recipients = [
  { firstName: 'Gwyneth', email: 'gdixon98@comcast.net' },
  { firstName: 'Amanda', email: 'amandawillingham76@gmail.com' },
  { firstName: 'Regina', email: 'yp052702@gmail.com' },
  { firstName: 'Riya', email: 'randhawa.riya.97@gmail.com' },
  { firstName: 'Leeshah', email: 'leeshahkim@gmail.com' },
  { firstName: 'Keerthi', email: 'keerko2218@gmail.com' },
  { firstName: 'Jyontika', email: 'jyontikakapoor@gmail.com' },
  { firstName: 'Ruth', email: 'ruthevelasquez23@gmail.com' },
  { firstName: 'Carolina', email: 'auspicio.mandioca.0n@icloud.com' },
  { firstName: 'Jacob', email: 'jakeloss123@gmail.com' },
  { firstName: 'Key', email: 'kiaron1996@gmail.com' },
  { firstName: 'Ashley', email: 'ashamidei@gmail.com' },
  { firstName: 'Shrina', email: 'shrinapatel16@gmail.com' },
  { firstName: 'Robert', email: 'rchin10.7@gmail.com' },
  { firstName: 'Alexa', email: 'alexacarlos2@gmail.com' },
  { firstName: 'Hui', email: 'yunhui.wang1@gmail.com' },
  { firstName: 'amun', email: 'amunmajeed@gmail.com' },
  { firstName: 'Tina', email: 'yingtina1@gmail.com' },
  { firstName: 'Temara', email: 'temara0125@gmail.com' },
  { firstName: 'Dannee', email: 'emmadruth@outlook.com' },
  { firstName: 'Holly', email: 'habieber1108@gmail.com' },
  { firstName: 'Erika', email: 'erika.exton1@gmail.com' },
  { firstName: 'Amy', email: 'amyqin@gmail.com' },
  { firstName: 'Riley', email: 'wilson.riley88@gmail.com' },
  { firstName: 'Hanna', email: 'nicolls.hanna@gmail.com' },
  { firstName: 'Courtney', email: 'court.hamp7@gmail.com' },
  { firstName: 'Madeline', email: 'nevismadeline@gmail.com' },
  { firstName: 'Nina', email: 'nambid3@gmail.com' },
  { firstName: 'Nini', email: 'nitzia.hazlewood@icloud.com' },
  { firstName: 'Nina', email: 'nchangx3@gmail.com' },
  { firstName: 'Liz', email: 'elizboger@gmail.com' },
  { firstName: 'Hannah', email: 'aratahannah@gmail.com' },
  { firstName: 'Olivia', email: 'oliviabakken@hotmail.com' },
  { firstName: 'McKenzi', email: 'mckenzi.raines@gmail.com' },
  { firstName: 'Pauline', email: 'paulinegaffney2@gmail.com' },
  { firstName: 'Hailey', email: 'hyebin88@gmail.com' },
  { firstName: 'Autumn', email: 'adevereaux@centralvault.org' },
  { firstName: 'preethi', email: 'gopal.preethi1998@gmail.com' },
  { firstName: 'Esther', email: 'esther.h.jun@gmail.com' },
  { firstName: 'Tasia', email: 'gabrieltrose@gmail.com' },
  { firstName: 'Erin', email: 'erinzhan0205@gmail.com' },
  { firstName: 'Vrunda', email: 'hinguvrunda@gmail.com' },
  { firstName: 'Angel', email: 'babylovestar0@gmail.com' },
  { firstName: 'Anushka', email: 'anushka.gole@gmail.com' },
  { firstName: 'Monique', email: 'monique.gardner.92@gmail.com' },
  { firstName: 'Isabella', email: '08yasmin03@gmail.com' },
  { firstName: 'Hannah', email: 'hgkopach@gmail.com' },
  { firstName: 'Lauren', email: 'lwuerth92@gmail.com' },
  { firstName: 'Ana', email: 'anaphernandez2000@yahoo.com' },
  { firstName: 'Kayla', email: 'kaylaradosa@gmail.com' },
  { firstName: 'Katherine', email: 'nina.katarini@gmail.com' },
  { firstName: 'Sara', email: 'saraosoba@gmail.com' },
  { firstName: 'Brittany', email: 'b.tucciar@gmail.com' },
  { firstName: 'Keerthi', email: 'mkeerthi10@gmail.com' },
  { firstName: 'Anisa', email: 'belize.anisa@hotmail.com' },
  { firstName: 'Stephani', email: 'stephani6309@gmail.com' },
  { firstName: 'Gianna', email: 'haygianna@yahoo.com' },
  { firstName: 'Anna', email: 'annarosalina@icloud.com' },
  { firstName: 'Tegan', email: 'tlochner14021@gmail.com' },
  { firstName: 'Nia', email: 'burrelln97@gmail.com' },
  { firstName: 'Zoie', email: 'zgmatthews@outlook.com' },
  { firstName: 'Robbie', email: 'rjwhite1315@gmail.com' },
  { firstName: 'Marcus', email: 'm.hoange@gmail.com' },
  { firstName: 'Shriya', email: 'shriyachennuru21@gmail.com' },
  { firstName: 'Michelle', email: 'michellefu015@gmail.com' },
  { firstName: 'Amber', email: 'ajack117@depaul.edu' },
  { firstName: 'Claire', email: 'cmsilcox21@gmail.com' },
  { firstName: 'Holly', email: 'hedswenson@gmail.com' },
  { firstName: 'Megan', email: 'meganmcintyre97@gmail.com' },
  { firstName: 'Jennifer', email: 'jennifer.j.lee88@gmail.com' },
  { firstName: 'Megan', email: 'meganlin74@gmail.com' },
  { firstName: 'Lina', email: 'cepeda.pauline@yahoo.com' },
  { firstName: 'Claire', email: 'cmhuang2004@gmail.com' },
  { firstName: 'Brazhal', email: 'msbdanceinfo@gmail.com' },
  { firstName: 'Jessica', email: 'cecemeimei17@gmail.com' },
  { firstName: 'Gloria', email: 'gloria.martinez8@yahoo.com' },
  { firstName: 'Jennifer', email: 'jennifervfowler@gmail.com' },
  { firstName: 'Jamie', email: 'jamierohlfing@gmail.com' },
  { firstName: 'Mary Rose', email: 'maryrose.zoeckler@gmail.com' },
  { firstName: 'Alexis', email: 'alexis.d.castillo.19@gmail.com' },
  { firstName: 'Sameeksha', email: 'sameeksha.amin@gmail.com' },
  { firstName: 'Ashley', email: 'mclain.ashley@gmail.com' },
  { firstName: 'Cat', email: 'catherineludwig1@gmail.com' },
  { firstName: 'Liz', email: 'elizabeth.cobacho@gmail.com' },
  { firstName: 'Lana', email: 'lanaletters123@gmail.com' },
  { firstName: 'CHANEL', email: 'cncastan@yahoo.com' },
  { firstName: 'Rena', email: 'petren5178@yahoo.com' },
  { firstName: 'Yukiko', email: 'ycnakano08@gmail.com' },
  { firstName: 'Kathleen', email: 'kathleenmorro@gmail.com' },
  { firstName: 'Triniti', email: 'triniluvsjc@yahoo.com' },
  { firstName: 'Madeline', email: 'maddy.johnson13@gmail.com' },
  { firstName: 'KRIS', email: 'krismisk1@yahoo.com' },
  { firstName: 'Symone', email: 'symone.vanessa96@gmail.com' },
  { firstName: 'Shreena', email: 'shreenashah05@gmail.com' },
  { firstName: 'Leila', email: 'lively.leila.music@gmail.com' },
  { firstName: 'Belinda', email: 'belinda.mascia@gmail.com' },
  { firstName: 'Justin', email: 'justindeffenbacher2018@u.northwestern.edu' },
  { firstName: 'christal', email: '1974358394@qq.com' },
  { firstName: 'Vaishnavi', email: 'vaish412@gmail.com' },
  { firstName: 'Isabella', email: 'salernoisabella99@gmail.com' },
  { firstName: 'Tara', email: 'taraanncollins@gmail.com' },
  { firstName: 'Micah', email: 'micah1105@gmail.com' },
  { firstName: 'Chad', email: 'cgelinas17@gmail.com' },
  { firstName: 'Natasha', email: 'chambersnatasha21@gmail.com' },
  { firstName: 'Claudia', email: 'aleclaupr@gmail.com' },
  { firstName: 'Kiki', email: 'kikipichini@gmail.com' },
  { firstName: 'Joanna', email: 'joanna.mrtinez@gmail.com' },
  { firstName: 'Jennifer', email: 'jepuppy12@gmail.com' },
  { firstName: 'Rachel', email: 'rachelmenhart01@gmail.com' },
  { firstName: 'Cindy', email: 'clawando@gmail.com' },
  { firstName: 'Kerilyn', email: 'stawicki.kerilyn@gmail.com' },
  { firstName: 'LaShawn', email: 'lashawnronnae@gmail.com' },
  { firstName: 'Grace', email: 'glmautz@gmail.com' },
  { firstName: 'Sydney', email: 'sydneysprau@gmail.com' },
  { firstName: 'Maggie', email: 'maggieart23@gmail.com' },
  { firstName: 'Lindsey', email: 'lschock22@gmail.com' },
  { firstName: 'Jericho', email: 'jvgomz3@gmail.com' },
  { firstName: 'Jasmine', email: 'jswinea2@gmail.com' },
  { firstName: 'Cassie', email: 'cassandra.dohrman@gmail.com' },
  { firstName: 'Frida', email: 'frida.banueloss@gmail.com' },
  { firstName: 'Ricardo', email: 'ricardodaniel00@hotmail.com' },
  { firstName: 'Erica', email: 'ericadoan101@gmail.com' },
  { firstName: 'Daisy', email: 'espinozadaisy08@gmail.com' },
  { firstName: 'Emma', email: 'eherndon0583@gmail.com' },
  { firstName: 'Jacqueline', email: 'jrsachs16@aol.com' },
  { firstName: 'Jonelle', email: 'zelekj09@gmail.com' },
  { firstName: 'Misbah', email: 'misbahvahora98@gmail.com' },
  { firstName: 'Emily', email: 'erutherford417@gmail.com' },
  { firstName: 'Brenda', email: 'bbenitz995@gmail.com' },
  { firstName: 'Annie', email: 'arbillings1@gmail.com' },
  { firstName: 'Megan', email: 'steltzmegan@gmail.com' },
  { firstName: 'Jennifer', email: 'jlugones1@icloud.com' },
  { firstName: 'Sophia', email: 'sophialj22@gmail.com' },
  { firstName: 'zahra', email: 'zsajwani5@gmail.com' },
  { firstName: 'Jayden', email: 'jayden.messner@gmail.com' },
  { firstName: 'Marlena', email: 'reimer.marlena@gmail.com' },
  { firstName: 'Ersta', email: 'eferryanto@gmail.com' },
  { firstName: 'Brie', email: 'brieglass77@gmail.com' },
  { firstName: 'Tessa', email: 'tlsobieski@gmail.com' },
  { firstName: 'Akhila', email: 'akhilak021@gmail.com' },
  { firstName: 'Denise', email: 'davis2851@sbcglobal.net' },
  { firstName: 'Sarah', email: 'smashburn14@gmail.com' },
  { firstName: 'Carol', email: 'mscarollin@gmail.com' },
  { firstName: 'Uma', email: 'umasubbiah19@gmail.com' },
  { firstName: 'Carrie', email: 'carrie.corbin89@gmail.com' },
  { firstName: 'Catherine', email: 'casteegmueller@gmail.com' },
  { firstName: 'Cindy', email: 'chencindy161@gmail.com' },
  { firstName: 'Julia', email: 'juliapmerryman@gmail.com' },
  { firstName: 'Meghan', email: 'mlmileski0409@gmail.com' },
  { firstName: 'Marina', email: 'marina.chan0719@gmail.com' },
  { firstName: 'Kelly', email: 'kflaherty6@gmail.com' },
  { firstName: 'Emily', email: 'emvandam13@gmail.com' },
  { firstName: 'Tiana', email: 'tiananicol12@gmail.com' },
  { firstName: 'Luke', email: 'lsaphner2051@gmail.com' },
  { firstName: 'Alexa', email: 'alexa.lindsley@gmail.com' },
  { firstName: 'Angela', email: 'emmaexpress10@hotmail.com' },
  { firstName: 'Ryan', email: 'ryghaz@yahoo.com' },
  { firstName: 'Katie', email: 'katierenaud5@gmail.com' },
  { firstName: 'Barbara', email: 'chicagokantrows@aol.com' },
  { firstName: 'Conner', email: 'cagilbert17@gmail.com' },
  { firstName: 'Maggie', email: 'maggiem.hays@gmail.com' },
  { firstName: 'Sora', email: 'sorachoipr@gmail.com' },
  { firstName: 'Elena', email: 'elenacruz2563@gmail.com' },
  { firstName: 'Elana', email: 'ecollins1916@gmail.com' },
  { firstName: 'Rachel', email: 'villafuerte.rachel17@gmail.com' },
  { firstName: 'Imani', email: 'imani_english@hotmail.com' },
  { firstName: 'Aditi', email: 'add398@gmail.com' },
  { firstName: 'Sam', email: 'sjmartini97@gmail.com' },
  { firstName: 'Carley', email: 'carleyliebst@gmail.com' },
  { firstName: 'Gladys', email: 'pantojag23@yahoo.com' },
  { firstName: 'Marco', email: 'castillomarco409@gmail.com' },
  { firstName: 'Chauncey', email: 'chaunceythegreat30@gmail.com' },
  { firstName: 'Destinie', email: 'destinie.gonzalez@yahoo.com' },
  { firstName: 'Emma', email: 'emma.worrell@icloud.com' },
  { firstName: 'Elise', email: 'acevedoelise93@gmail.com' },
  { firstName: 'Kailey', email: 'kaileyh1422@gmail.com' },
  { firstName: 'Amy', email: 'amychristenson7@gmail.com' },
  { firstName: 'Tiamara', email: 'tiamara.casey@outlook.com' },
  { firstName: 'Autumn', email: 'ajanelle24@live.com' },
  { firstName: 'SALINA', email: 'tsegaisalina@gmail.com' },
  { firstName: 'Sam', email: 'samantha.kitchen001@gmail.com' },
  { firstName: 'abby', email: 'abbyhdowns@gmail.com' },
  { firstName: 'Catalina', email: 'catalinacastro2024@gmail.com' },
  { firstName: 'Ryan', email: 'ryanphilemon@gmail.com' },
  { firstName: 'Faith', email: 'faithbrawner@gmail.com' },
  { firstName: 'Amy', email: 'amy.ruvalcaba15@icloud.com' },
  { firstName: 'Juan', email: 'juanzyquanzy@yahoo.com' },
  { firstName: 'Ian', email: 'ihafley13@gmail.com' },
  { firstName: 'Anthony', email: 'anthonyrescan@gmail.com' },
  { firstName: 'Marisol', email: 'soto.marisol96@gmail.com' },
  { firstName: 'Miku', email: 'mikum0802@gmail.com' },
  { firstName: 'Kaycee', email: 'kayjordan93@gmail.com' },
  { firstName: 'Katori', email: 'katori.shepherd@gmail.com' },
  { firstName: 'Alex', email: 'gershwin12@gmail.com' },
  { firstName: 'Jaleise', email: 'jaleisedeshawn7@aol.com' },
  { firstName: 'Clara', email: 'clara.m.moller@gmail.com' },
  { firstName: 'Eunice', email: 'euniceobengadjekum@gmail.com' },
  { firstName: 'Laura', email: 'lelopez58@yahoo.com' },
  { firstName: 'Courtney', email: 'courtneyfornash@gmail.com' },
  { firstName: 'Elizabeth', email: 'emailbubba1@gmail.com' },
  { firstName: 'Anastasia', email: 'npetran582@mail.ru' },
  { firstName: 'Wendy', email: 'westws12@gmail.com' },
  { firstName: 'Andrew', email: 'andrew@monsonfamily.net' },
  { firstName: 'Adriana', email: 'adrianavavrincuk@gmail.com' },
  { firstName: 'Helen', email: 'helenchencxy@gmail.com' },
  { firstName: 'Angie', email: 'angmerz@gmail.com' },
  { firstName: 'Ashton', email: 'akasouf@gmail.com' }
];

// Available discount offers with links
const offers = [
  { code: 'CANDLE5', label: 'Get $5 off our Ceramic Candles class', link: 'https://www.thepotteryloop.com/event-details/winter-candle-workshop-2025-12-06-13-30' },
  { code: 'CANDLE10', label: 'Get $10 off our Ceramic Candles class when you bring a friend', link: 'https://www.thepotteryloop.com/event-details/winter-candle-workshop-2025-12-06-13-30' },
  { code: 'WHEEL10', label: 'Get $10 off a Wheel Throwing class', link: 'https://www.thepotteryloop.com/service-page/intro-pottery-wheel-class' },
  { code: 'JAN30', label: 'Get $30 off any multi-week Wheel course in January', link: 'https://potterychicago.com/january-courses' },
  { code: 'HAND10', label: 'Get $10 off a Handbuilding Workshop', link: 'https://www.thepotteryloop.com/service-page/handbuilding-workshop' },
  { code: '$20Mug', label: 'Glaze a mug for just $20!', link: 'https://www.thepotteryloop.com/booking-calendar/the-perfect-mug?referral=service_details_widget&timezone=America%2FChicago&location=' },
  { code: 'MYSTERY15', label: 'Mystery deal: Get 15% off any one pottery class of your choice', link: 'https://thepotteryloop.com' }
];

function formatEmailBody(firstName, offer) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000000; font-size: 14px; padding: 20px;">
  <p>Hi ${firstName},</p>
  
  <p>Thanks for taking a wheel class with us. We would love to have you in the studio again to check out our new space!</p>
  
  <p>Here's a discount code for your next visit:</p>
  
  <p>${offer.label}</p>
  
  <p>Code: ${offer.code}</p>
  
  <p>Valid for 24 hours.</p>
  
  <p>Check out more details at <a href="https://potterychicago.com/cybermonday">potterychicago.com/cybermonday</a></p>
  
  <p>Hope to see you in the studio soon!</p>
  
  <p>The Pottery Loop</p>
  
  <p style="font-size: 12px; color: #666666; margin-top: 30px;">1770 W Berteau Ave Chicago IL, suite 407</p>
</body>
</html>
  `.trim();
}

function formatEmailBodyText(firstName, offer) {
  return `Hi ${firstName},

Thanks for taking a wheel class with us. We would love to have you in the studio again to check out our new space!

Here's a discount code for your next visit:

${offer.label}

Code: ${offer.code}

Valid for 24 hours.

Check out more details at potterychicago.com/cybermonday

Hope to see you in the studio soon!

The Pottery Loop

1770 W Berteau Ave Chicago IL, suite 407`.trim();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendEmail(recipient) {
  try {
    // Pick a random offer for each recipient
    const randomOffer = offers[Math.floor(Math.random() * offers.length)];
    
    const emailBody = formatEmailBody(recipient.firstName, randomOffer);
    const emailSubject = `Pottery Discounts too! Studio Update`;

    await sesClient.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [recipient.email]
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
            Data: formatEmailBodyText(recipient.firstName, randomOffer),
            Charset: 'UTF-8'
          }
        }
      }
    }));

    return { success: true, recipient: recipient.email, offer: randomOffer.code };
  } catch (error) {
    console.error(`❌ Error sending to ${recipient.email}:`, error.message);
    return { success: false, recipient: recipient.email, error: error.message };
  }
}

async function sendAllEmails() {
  console.log(`📧 Starting to send ${recipients.length} emails...\n`);
  
  const results = [];
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    console.log(`[${i + 1}/${recipients.length}] Sending to ${recipient.firstName} (${recipient.email})...`);
    
    const result = await sendEmail(recipient);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Sent successfully!`);
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
    
    // Wait 1.5 seconds between emails to avoid rate limiting
    // AWS SES allows 1 email per second in sandbox, 14 per second in production
    if (i < recipients.length - 1) {
      await sleep(1500);
    }
    
    console.log('');
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed recipients:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.recipient}: ${r.error}`);
    });
  }
}

sendAllEmails();

