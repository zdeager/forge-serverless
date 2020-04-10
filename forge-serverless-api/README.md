
# forge-serverless-api

[![Node.js](https://img.shields.io/badge/Node.js-13.12.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-6.14.4-blue.svg)](https://www.npmjs.com/)
[![Python](https://img.shields.io/badge/Python-3.7-blue.svg)](https://www.python.org/)
[![pip](https://img.shields.io/badge/pip-9.0.1-blue.svg)](https://pip.pypa.io/en/stable/)

[![oAuth2](https://img.shields.io/badge/oAuth2-v1-green.svg)](http://developer.autodesk.com/)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](http://developer.autodesk.com/)
[![OSS](https://img.shields.io/badge/OSS-v2-green.svg)](http://developer.autodesk.com/)
[![Model-Derivative](https://img.shields.io/badge/Model%20Derivative-v2-green.svg)](http://developer.autodesk.com/)

# Description

This directory contains the server-side functionality of [our serverless forge project](https://github.com/zdeager/forge-serverless) in the form of easily deployable Node.js [AWS Lambda](https://aws.amazon.com/lambda/) functions (via the [serverless framework]([https://serverless.com/])). 

# Setup
For this part of the project you will need an [AWS account](https://aws.amazon.com/). (**Note**: unless otherwise stated, the services used in this project are part of the [AWS Free Tier](https://aws.amazon.com/free/) but you should always double-check...)

In order to use the AWS CLI you will also need [Python](https://www.python.org/downloads/) and [pip](https://pip.pypa.io/en/stable/installing/). We are using Python 3.7 and pip 9.0.1, but any version of Python2.7+ or Python3+ should work (you will need to intall the appropriate pip).

## Configure AWS CLI
If you haven't done so already, you will need to create an IAM user on AWS. An fantastic guide on what this is and how to do this, created by Anomaly Innovations, can be found [here](https://serverless-stack.com/chapters/create-an-iam-user.html). Take note of the **Access key ID** and **Secret access key** for the IAM user.

Install AWS CLI using the following command:
`sudo pip3 install awscli` (or `sudo pip install awscli` for Python2)

Now configure AWS CLI:
`aws configure`

Enter your Secret Key ID and your Access Key (the rest of the options can be left as default).

## Set up the Serverless Framework
Install Serverless:
`npm install serverless -g`

Then navigate to the the directory of this project (the directory containing **serverless.yml**) in a terminal and run:
`npm install`

## Configure your environment variables
In this directory create a file called `.env`.

Add the following text to `.env`:
```
CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLIENT_SECRET=xxxxxxxxxxxxxxxx
CALLBACK_URL=http://localhost:8080/
```
Entering the Client ID, Client Secret, and Callback URL of your Forge application where appropriate.

## Deploy the backend
Deploy the APIs with the following command:
`serverless deploy`

Observe the **Service Information**, it should look like
```
Service Information
service: forge-serverless-api
stage: dev
region: us-east-2
stack: forge-serverless-api-dev
resources: 25
api keys:
  None
endpoints:
  GET - https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev/oauth/create_session
  GET - https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev/user/profile
  GET - https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev/datamanagement
  ...
functions:
  create_session: forge-serverless-api-dev-create_session
  get_user_profile: forge-serverless-api-dev-get_user_profile
  get_docs: forge-serverless-api-dev-get_docs
  ...
```
Take note of the API Gateway **region** and **URL** (the API Gateway URL is the base URL of the endpoints, e.g. `https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev`). These will be needed when configuring the [client](https://github.com/zdeager/forge-serverless/tree/master/forge-serverless-frontend).