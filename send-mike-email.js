// Script to send a thank you email to Mike with a discount offer
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({ region: 'us-east-2' });

const FROM_EMAIL = 'The Pottery Loop <create@potterychicago.com>';
const TO_EMAIL = 'Michaelvcodes@gmail.com';

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

// Pick a random offer
const randomOffer = offers[Math.floor(Math.random() * offers.length)];

function formatEmailBody(offer) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000000; font-size: 14px; padding: 20px;">
  <p>Hi Michael,</p>
  
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

function formatEmailBodyText(offer) {
  return `Hi Michael,

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

async function sendEmail() {
  try {
    const emailBody = formatEmailBody(randomOffer);
    const emailSubject = `Pottery Discounts too! Studio Update`;

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
            Data: formatEmailBodyText(randomOffer),
            Charset: 'UTF-8'
          }
        }
      }
    }));

    console.log('✅ Email sent successfully!');
    console.log(`📧 Sent to: ${TO_EMAIL}`);
    console.log(`🎁 Offer: ${randomOffer.label} (${randomOffer.code})`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    process.exit(1);
  }
}

sendEmail();

