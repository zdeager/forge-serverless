# forge-serverless-frontend

[![Node.js](https://img.shields.io/badge/Node.js-13.12.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-6.14.4-blue.svg)](https://www.npmjs.com/)
[![webpack](https://img.shields.io/badge/webpack-4.42.1-blue.svg)](https://webpack.js.org/)

# Description

This directory contains a React-based client application which leverages the serverless backend of [our serverless forge project](https://github.com/zdeager/forge-serverless).

# Setup

## Set up the React app
Navigate to this directory (containing of the frontend) in a terminal and run:
`npm install`

## Configure the application
In the `src/` directory there is a file called `config.js` which looks like:
```
export default {
  client_id: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  callback_url: "http://localhost:8080",
  scopes: ['bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'],
  apiGateway: {
    REGION: "us-east-2",
    URL: "https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev"
  },
  extensions: ['SampleExtension']
};
```
Enter the **Client ID** and **Callback URL** of your Forge application as well as the **region** and **URL** of [your API Gateway](https://github.com/zdeager/forge-serverless/tree/master/forge-serverless-api#deploy-the-backend), where appropriate.

Modify the `extensions` array to contain the extensions you would like to be available in the viewer. See the [Extensions](https://github.com/zdeager/forge-serverless/tree/master/forge-serverless-frontend#extensions) section for more details...

# Running locally
The application can be run locally using the following command (within the project directory): `npm run start`

This should open a browser to [http://localhost:8080](http://localhost:8080), and the app should be running. You can now log in to your Autodesk account and browse/load documents in the Viewer via (using your serverless backend).

# Deploying to S3
If you haven't done so already, create an S3 bucket on AWS and configure it to be able to host the assets of our application and also assign it a publicly accessible URL. An in-depth guide on how to do this can be found [here](https://serverless-stack.com/chapters/create-an-s3-bucket.html).

The application can be built using the following command (within the project directory): `npm run build`

The built application can be found in the `dist/` directory. It can be uploaded to your S3 bucket with `aws s3 sync dist/ s3://BUCKET_NAME` where `BUCKET_NAME` is the name of your previously created S3 bucket.

After the sync is complete, assuming your backend has been deployed, anyone will be able to run your application by visiting the public URL of your S3 bucket in their browser.

# Extensions
The extensions to the viewer are registered/loaded as specified in the `src/config.js` file. 

This project comes with a basic viewer extension, called "SampleExtension" (in the `src/Extensions/` directory). This extension can be modified, removed, or used as a template for other extensions. 

There are two key things to keep in mind:
 1. all extensions need to contain the following line `Autodesk.Viewing.theExtensionManager.registerExtension('ExtensionName', ExtensionClassName);` where `'ExtensionName'` is arbitrary (but unique) and `ExtensionClassName` is the name of the class that contains the extension (and `extends Autodesk.Viewing.Extension`)
 2. the name of the .js file containing the extension needs to match the 'ExtensionName' in 1., and should be at the root of the `src/Extensions` directory, i.e. `src/Extensions/ExtensionName.js`

If 1. and 2. are satisfied, insert `'ExtensionName'` into the `extensions` array in the `src/config.js` file. 

With your app loaded, you can check if your extension was registered correctly (and will be loaded when the viewer starts) using the following command in your browser's console: `Autodesk.Viewing.theExtensionManager.getRegisteredExtensions()`. Your extension(s) should be at the end of the array returned.