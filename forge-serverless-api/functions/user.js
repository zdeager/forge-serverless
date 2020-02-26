const {
  UserProfileApi
} = require('forge-apis');

// import helper from oauth.js
import {
  getClientTwoLegged
} from "./oauth";

export const profile = async (event, context) => {
  // get token from query params
  const internalToken = event.queryStringParameters;
  // get user data via forge api
  const user = new UserProfileApi();
  const user_profile = await user.getUserProfile(getClientTwoLegged(), internalToken);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({
      name: user_profile.body.firstName + ' ' + user_profile.body.lastName,
      picture: user_profile.body.profileImages.sizeX40
    }),
  };
};