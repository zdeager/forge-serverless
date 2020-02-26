# forge-serverless-frontend

[![Node.js](https://img.shields.io/badge/Node.js-13.9.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-6.13.7-blue.svg)](https://www.npmjs.com/)

# Description

This directory contains a React-based client (via [create-react-app]([https://github.com/facebook/create-react-app](https://github.com/facebook/create-react-app))) application which leverages the serverless backend of [our serverless forge project](https://github.com/zdeager/forge-serverless).

# Setup

## Set up the React app
Navigate to the directory of this project (the directory containing the **public** and **src** directories) in a terminal and run:
`npm install`

## Configure the application
In the `src/` directory there is a file called `config.js` which looks like:
```
export default {
  client_id: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  callback_url: "http://localhost:3000",
  scopes: ['bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'],
  apiGateway: {
    REGION: "us-east-2",
    URL: "https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev"
  }
};
```
Enter the Client ID and Callback URL of your Forge application as well as the region and URL of [your API Gateway](https://github.com/zdeager/forge-serverless/tree/master/forge-serverless-api#deploy-the-backend), where appropriate.

# Running locally
The application can be run locally using the following command (within the project directory): `npm run start`

This should open a browser to [http://localhost:3000](http://localhost:3000), and the app should be running. You can now log in to your Autodesk account and browse/load documents in the Viewer via (using your serverless backend).