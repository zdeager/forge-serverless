export default {
  client_id: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  callback_url: "http://localhost:3000",
  scopes: ['bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'],
  apiGateway: {
    REGION: "us-east-2",
    URL: "https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev"
  }
};