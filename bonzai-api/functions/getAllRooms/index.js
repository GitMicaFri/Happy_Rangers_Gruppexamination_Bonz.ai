const { dynamoDb } = require('../../database/db')

module.exports.handler = async (event) => {

    const params = {
        TableName: 'BonzaiBookings'
    }

    try {
        const result = await dynamoDb.scan(params)

        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items)
        }

        return response

    } catch(error) {
        const errorResponse = {
            statusCode: 500,
            body: JSON.stringify({ error: error.message})
        }

        return errorResponse
    }
}