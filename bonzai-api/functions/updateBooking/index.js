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

        // Hämta rummet för controllers
        const getRoomParams = {
            TableName: 'BonzaiBookings',
            Key: { roomId }
        }

        const roomResult = await dynamoDb.get(getRoomParams)
        const room = roomResult.Item

        if(!room) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Room not found'})
            }
        }

        if (room.available === 'false') {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Room is not available'})
            }
        }

        if (numGuests > room.maxGuests) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: `This room can only take ${room.maxGuests}, not ${numGuests}.`})
            }
        }

        // Om alla kontroller passar, uppdaterar vi databasen:
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