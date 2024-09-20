const { dynamoDb } = require('../../database/db')

module.exports.handler = async (event) => {
    try {

        console.log('Path parameters: ', event.pathParameters)

        const { roomId } = event.pathParameters
        const { checkIn, checkOut, numGuests, roomType} = JSON.parse(event.body)

        if(!checkIn || !checkOut || !numGuests || !roomType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Please fill in the required fields'})
            }
        }

        if(!roomId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Fill in the required room ID'})
            }
        }

        const params = {
            TableName: 'BonzaiBookings',
            Key: { roomId },
            UpdateExpression: 'SET checkIn = :checkIn, checkOut = :checkOut, numGuests = :numGuests, roomType = :roomType',
            ExpressionAttributeValues: {
                ':checkIn': checkIn,
                ':checkOut': checkOut,
                ':numGuests': numGuests,
                ':roomType': roomType,
            },
            ReturnValues: 'ALL_NEW'
        }

        const updateResult = await dynamoDb.update(params)

        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: 'Updated your booking', booking: updateResult.Attributes})
        }

        return response

    } catch(error) {
        const errorResponse = {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to update booking'})
        }

        return errorResponse
    }
}