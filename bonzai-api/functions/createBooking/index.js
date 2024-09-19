const { dynamoDb } = require('../../database/db')
const { v4: uuidv4 } = require('uuid')


module.exports.handler = async (event) => { 
    try {
        const { roomId, guestName, guestEmail, numberOfGuests, checkIn, checkOut } = JSON.parse(event.body)

        if(!roomId || !guestName || !guestEmail || !numberOfGuests || !checkIn || !checkOut) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields'})
            }
        }

        const roomParameters = {
            TableName: 'BonzaiBookings',
            Key: {
                roomId: roomId
            }
        }


        const roomResult = await dynamoDb.get(roomParameters)
        const room = roomResult.Item


        // Kontroll för om rummet finns i databasen
        if(!room) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Room not found!'})
            }
        }


        // Kontroll för om rummets status är available = true
        if(!room.available) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Room is not available.'})
            }
        }


        // Kontroll för om antalet besökare ligger inom ramen för rummets kapacitet
        const numGuests = parseInt(numberOfGuests)

        if(numGuests > room.maxGuests) {
            return {
                statusCode: 400,
                body: `This room can only take ${room.maxGuests} person(s), not ${numberOfGuests} person(s).`
            }
        }


        const bookingId = uuidv4()

        const bookingParams = {
            TableName: 'BonzaiBookings',
            Item: {
                bookingId,
                roomId,
                guestName,
                guestEmail,
                numberOfGuests,
                checkIn,
                checkOut,
                price: room.price,
                roomType: room.roomType,
                maxGuests: room.maxGusts,
                available: room.available,
                status: "pending"
            }
        }

        await dynamoDb.put(bookingParams)

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Booking created successfully', bookingId})
        }


    } catch(error) {
        const errorResponse = {
            statusCode: 500,
            body: JSON.stringify({ error: error.message})
        }

        return errorResponse
    }
}