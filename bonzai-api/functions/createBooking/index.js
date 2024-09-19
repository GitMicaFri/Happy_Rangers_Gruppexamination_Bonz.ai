const { dynamoDb } = require('../../database/db')
const { v4: uuidv4 } = require('uuid')
uuidv4()

module.exports.handler = async (event) => {
    try {
        const { roomId, guestName, guestEmail, numberOfGuests, roomType, checkInDate, checkOutDate, } = JSON.parse(event.body)

        if(!roomId || !guestName || !guestEmail || !numberOfGuests || !roomType || !checkInDate || !checkOutDate) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields'})
            }
        }


    } catch(error) {
        const errorResponse = {
            statusCode: 500,
            body: JSON.stringify({ error: error.message})
        }

        return errorResponse
    }
}