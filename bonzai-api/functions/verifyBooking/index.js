const { dynamoDb } = require('../../database/db')

module.exports.handler = async (event) => {
    try {
        const { roomId, bookingId } = JSON.parse(event.body)

        if(!roomId || !bookingId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing room id or booking id'})
            }
        }

        const roomParams = {
            TableName: 'BonzaiBookings',
            Key: { roomId }
        }

        const roomResult = await dynamoDb.get(roomParams)
        const room = roomResult.Item

        if(!room) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Room not found'})
            }
        }

        if (room.bookingId !== bookingId) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Booking not found'})
            }
        }

        if (room.status === 'confirmed') {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'The booking is already confirmed'})
            }
        }

        const updateBookingParams = {
            TableName: 'BonzaiBookings',
            Key: { roomId },
            UpdateExpression: 'SET #bookingStatus = :status',
            ExpressionAttributeNames: {
                '#bookingStatus': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'confirmed'
            },
            ReturnValues: 'ALL_NEW'
        }

        const updatedStatus = await dynamoDb.update(updateBookingParams)

        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Booking verified',
                booking: updatedStatus.Attributes
            })
        }

        return response


    } catch(error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to verify booking, ', message: error.message})
        }
    }
}