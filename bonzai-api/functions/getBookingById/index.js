const { dynamoDb } = require('../../database/db');

module.exports.handler = async (event) => {
  // Hämta bookingId från URL:en
  const bookingId = event.pathParameters.id; // Använder bookingId från URL:en, t.ex. bookings/{bookingId}

  // Konfigurera params för scan
  const params = {
    TableName: 'BonzaiBookings',
    FilterExpression: 'bookingId = :bookingId', // Sök efter alla poster med detta bookingId
    ExpressionAttributeValues: {
      ':bookingId': bookingId, // Definiera bookingId värdet att matcha mot
    },
  };

  try {
    const result = await new Promise((resolve, reject) => {
      dynamoDb.scan(params, (error, data) => {
        // Använd scan istället för query
        if (error) {
          console.error('Error scanning DynamoDB:', error);
          reject(error);
        } else {
          resolve(data);
        }
      });
    });

    if (result.Items && result.Items.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Items), // Returnera alla matchade rum för detta bookingId
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No bookings found for this bookingId',
        }),
      };
    }
  } catch (error) {
    console.error('Caught error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
