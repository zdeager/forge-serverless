# forge-serverless

[![Node.js](https://img.shields.io/badge/Node.js-13.12.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-6.14.4-blue.svg)](https://www.npmjs.com/)
[![webpack](https://img.shields.io/badge/webpack-4.42.1-blue.svg)](https://webpack.js.org/)

[![oAuth2](https://img.shields.io/badge/oAuth2-v1-green.svg)](http://developer.autodesk.com/)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](http://developer.autodesk.com/)
[![OSS](https://img.shields.io/badge/OSS-v2-green.svg)](http://developer.autodesk.com/)
[![Model-Derivative](https://img.shields.io/badge/Model%20Derivative-v2-green.svg)](http://developer.autodesk.com/)

<p align="center">
  <img src="https://forge-serverless-images.s3.us-east-2.amazonaws.com/forge-serverless-gif.gif" alt="forge-serverless-gif"/>
</p>

# Description

This an alternative implementation of this [Learn Forge](http://learnforge.autodesk.io) tutorial using Serverless and React on [Amazon Web Services](https://aws.amazon.com/). This project does not contain all aspects of the aforementioned tutorial but can hopefully serve as a good starting point. 

Note that there are two directories at the root level: **forge-serverless-api** and **forge-serverless-frontend**. The former contains the server-side functionality in the form of easily deployable Node.js [AWS Lambda](https://aws.amazon.com/lambda/) functions (via the [serverless framework]([https://serverless.com/])). The latter contains a React-based client application which leverages the serverless backend.

The key differences between this project and the [Learn Forge](http://learnforge.autodesk.io) project are:
 1. this project uses a serverless backend as opposed to Express.js, so the server is not "running" along-side the client application. Thus, session data needs to be communicated between the client and backend more carefully...
 2. this project uses React as opposed to vanilla Javascript (w/ jQuery)

# Setup
To use this project, you will need Autodesk developer credentials. Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account, then [create an app](https://developer.autodesk.com/myapps/create). To test your application locally, use **http://localhost:8080** as the Callback URL (when deploying elsewhere, ensure the URL in the config files of the serverless-api and client app are updated accordingly). Finally, take note of the **Client ID** and **Client Secret**.

You will also need [Node.js](https://nodejs.org/). For this project we are using Node.js 13.12.0. However, this will probably work fine with any recent version.

## serverless-api
Before you configure the client, you must set up the serverless-api backend. See the [README.md](https://github.com/zdeager/forge-serverless/tree/master/forge-serverless-api) in the **serverless-api** folder for details on how to set up and deploy the serverless backend functions via [AWS Lambda](https://aws.amazon.com/lambda/) and [Amazon API Gateway](https://aws.amazon.com/api-gateway/).

## client
Once your API Gateway is deployed, the client app can be configured and run. See the [README.md](https://github.com/zdeager/forge-serverless/tree/master/forge-serverless-frontend) in the **serverless-frontend** folder for details on how to configure, run, and deploy the React app.

# Future Work
We hope to incorporate more features from the Learn Forge tutorial into this project (e.g. Viewer Extensions, etc.). We also wish to add functionality which connects data from external sources and APIs (e.g. S3, DynamoDB, etc.) to our app -- similar to the [forge-rcdb](https://github.com/Autodesk-Forge/forge-rcdb.nodejs) project. Lastly, we may consider adding different langauge implementations of the backend.