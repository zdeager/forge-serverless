export default {
  client_id: "qVZ3WVqkZEXgODXWUQxG8T4ba0Zy6vyM",
  //callback_url: "http://forge-serverless.s3-website.us-east-2.amazonaws.com",
  //client_id: "MpLwIFW6ZeJbigsM3EvjIGxYZ4b2gSeV",
  callback_url: "http://localhost:8080",
  scopes: ['bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'],
  apiGateway: {
    REGION: "us-east-2",
    URL: "https://i7u0plur4m.execute-api.us-east-2.amazonaws.com/dev"
  },
  extensions: ['DisciplineExtension']
};