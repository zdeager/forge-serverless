import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const add_note = (event, context, callback) => {
  const note_data = JSON.parse(event.body);
  const date = (new Date()).toISOString().split('T')[0];

  const params = {
    TableName: "CriticalAssets",
    Key: {asset_id: note_data.asset_id},
    UpdateExpression: "SET notes = list_append(notes, :note)",
    ExpressionAttributeValues: {
      ":note" : [{date: date, note: note_data.note}]
    }
  };

  dynamoDb.update(params, (error, data) => {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    };

    // Return status code 500 on error
    if (error) {
      const response = {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({ status: false })
      };
      callback(null, response);
      return;
    }

    // Return status code 200 and the newly created item
    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({date: date, note: note_data.note})
    };
    callback(null, response);
  });
};