// AWS Lambda function to handle Cyber Monday pottery wheel game
// Uses AWS SDK v3 (Node.js 20.x)

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { randomUUID } = require('crypto');

const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: 'us-east-2' });

const TABLE_NAME = process.env.CYBERMONDAY_TABLE_NAME || 'CyberMondayGamePlays';
const FROM_EMAIL = 'The Pottery Loop <create@potterychicago.com>';
const TO_EMAIL = 'PotteryChicago@gmail.com';
const BOOKINGS_URL = process.env.BOOKINGS_URL || 'https://ThePotteryLoop.com';

// Cyber Monday offers
const CYBER_OFFERS = [
  { code: 'CANDLE5', label: 'Get $5 off our Ceramic Candles class', link: 'https://www.thepotteryloop.com/event-details/winter-candle-workshop-2025-12-06-13-30' },
  { code: 'CANDLE10', label: 'Get $10 off our Ceramic Candles class when you bring a friend', link: 'https://www.thepotteryloop.com/event-details/winter-candle-workshop-2025-12-06-13-30' },
  { code: 'WHEEL10', label: 'Get $10 off a Wheel Throwing class', link: 'https://www.thepotteryloop.com/service-page/intro-pottery-wheel-class' },
  { code: 'JAN30', label: 'Get $30 off any multi-week Wheel course in January', link: 'https://potterychicago.com/january-courses' },
  { code: 'HAND10', label: 'Get $10 off a Handbuilding Workshop', link: 'https://www.thepotteryloop.com/service-page/handbuilding-workshop' },
  { code: '$20Mug', label: 'Get $20 off a mug glazing class', link: 'https://www.thepotteryloop.com/booking-calendar/the-perfect-mug?referral=service_details_widget&timezone=America%2FChicago&location=' },
  { code: 'MYSTERY15', label: 'Mystery deal: Get 15% off any one pottery class of your choice', link: 'https://thepotteryloop.com' }
];

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'OK' })
    };
  }

  try {
    // Parse request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { name, email, consent } = body;

    // Input validation
    if (!name || !name.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Name is required'
        })
      };
    }

    if (!email || !email.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email is required'
        })
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid email address'
        })
      };
    }

    if (consent !== true) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Consent is required to participate'
        })
      };
    }

    // Check if email was already sent to this address
    // Try to query by email (if GSI exists), otherwise skip the check
    let existingItem = null;
    try {
      const emailCheck = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'email-index', // GSI on email field
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email.trim()
        },
        Limit: 1
      }));

      if (emailCheck.Items && emailCheck.Items.length > 0) {
        existingItem = emailCheck.Items[0];
      }
    } catch (error) {
      // If index doesn't exist, continue without duplicate check
      // This is acceptable for now - we'll still store the new entry
      console.log('Email index check skipped:', error.message);
    }

    // If email was already sent, return the existing result
    if (existingItem && existingItem.emailSent) {
      const existingOffer = CYBER_OFFERS.find(o => o.code === existingItem.code);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          offerLabel: existingItem.label,
          code: existingItem.code,
          link: existingOffer?.link || existingItem.link || BOOKINGS_URL,
          alreadySent: true
        })
      };
    }

    // Pick a random offer
    const offer = CYBER_OFFERS[Math.floor(Math.random() * CYBER_OFFERS.length)];

    // Generate unique ID
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    // Prepare data for DynamoDB
    const dbItem = {
      id,
      name: name.trim(),
      email: email.trim(),
      consent: true,
      label: offer.label,
      code: offer.code,
      link: offer.link,
      createdAt,
      emailSent: true
    };

    // Store in DynamoDB
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: dbItem
    }));

    // Format email content using the offer's specific link
    const emailBody = formatEmailBody(name, email, offer, offer.link || BOOKINGS_URL);
    const emailSubject = `Your Booking Code: ${offer.code}`;

    // Send email via SES
    await sesClient.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [email.trim()]
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
            Data: formatEmailBodyText(name, email, offer, offer.link || BOOKINGS_URL),
            Charset: 'UTF-8'
          }
        }
      }
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        offerLabel: offer.label,
        code: offer.code,
        link: offer.link || BOOKINGS_URL
      })
    };

  } catch (error) {
    console.error('Error processing Cyber Monday game:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Something went wrong.'
      })
    };
  }
};

function formatEmailBody(name, email, offer, bookingsUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #000000; font-size: 14px; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi ${name},</p>
  
  <p>Your discount code for your pottery class booking:</p>
  
  <p><strong>${offer.label}</strong></p>
  
  <p>Code: <strong>${offer.code}</strong></p>
  
  <p>Booking link: ${bookingsUrl}</p>
  
  <p>Valid for 24 hours.</p>
  
  <p>Happy holidays!</p>
  
  <p>The Pottery Loop</p>
</body>
</html>
  `.trim();
}

function formatEmailBodyText(name, email, offer, bookingsUrl) {
  return `Hi ${name},

Your discount code for your pottery class booking:

${offer.label}

Code: ${offer.code}

Booking link: ${bookingsUrl}

Valid for 24 hours.

Happy holidays!

The Pottery Loop`.trim();
}

