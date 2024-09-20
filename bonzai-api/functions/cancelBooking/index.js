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

        const deleteBookingParams = {
            TableName: 'BonzaiBookings',
            Key: { roomId },
            UpdateExpression: 'REMOVE bookingId, guestName, guestEmail, checkIn, checkOut, numGuests, #bookingStatus',
            ExpressionAttributeNames: {
                '#bookingStatus': 'status'
            },
            ReturnValues: 'ALL_NEW'
        }

        await dynamoDb.update(deleteBookingParams)


        const updateRoomParams = {
            TableName: 'BonzaiBookings',
            Key: { roomId },
            UpdateExpression: 'SET available = :available',
            ExpressionAttributeValues: {
                ':available': 'true'
            },
            ReturnValues: 'ALL_NEW'
        }

        const updateResults = await dynamoDb.update(updateRoomParams)

        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Booking canceled successfully',
                rooms: updateResults.Attributes
            })
        }

        return response


    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Could not remove booking', error: error.message})
        }
    }
}