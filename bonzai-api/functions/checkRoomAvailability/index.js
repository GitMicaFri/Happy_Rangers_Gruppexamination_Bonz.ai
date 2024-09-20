const { dynamoDb } = require('../../database/db')

module.exports.handler = async (event) => {
    try {

        const { roomId } = event.pathParameters

        if(!roomId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing room ID'})
            }
        }

        const roomParams = {
            TableName: 'BonzaiBookings',
            Key: { roomId }
        }

        const result = await dynamoDb.get(roomParams)
        const room = result.Item

        if(!room) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Could not find the room'})
            }
        }

        const roomIsAvailable = room.available === 'true'

        return {
            statusCode: 200,
            body: JSON.stringify({ available: roomIsAvailable})
        }

    } catch(error) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Room not found'})
        }
    }
}