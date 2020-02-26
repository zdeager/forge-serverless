const {
  AuthClientTwoLegged,
  AuthClientThreeLegged
} = require('forge-apis');

// get config from environment variables
const config = {
  credentials: {
    client_id: process.env.clientID,
    client_secret: process.env.clientSecret,
    callback_url: process.env.callbackURL
  },
  scopes: {
    // Required scopes for the server-side application
    internal: ['bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'],
    // Required scope for the client-side viewer
    public: ['viewables:read']
  }
};

const getClientTwoLegged = () => {
  const {
    client_id,
    client_secret
  } = config.credentials;
  const scopes = config.scopes.internal;
  return new AuthClientTwoLegged(client_id, client_secret, scopes);
};

const getClientThreeLegged = () => {
  const {
    client_id,
    client_secret,
    callback_url
  } = config.credentials;
  const scopes = config.scopes.internal;
  return new AuthClientThreeLegged(client_id, client_secret, callback_url, scopes);
};

export const create_session = async (event, context) => {
  // Two Legged session
  let internalTokenClient = getClientTwoLegged(config.scopes.internal);
  let publicTokenClient = getClientTwoLegged(config.scopes.public);
  const internalCredentialsTwoLegged = await internalTokenClient.authenticate();
  const publicCredentialsTwoLegged = await publicTokenClient.authenticate();

  // Three Legged session
  const code = event.queryStringParameters.code; // get callback code from query params
  internalTokenClient = getClientThreeLegged(config.scopes.internal);
  publicTokenClient = getClientThreeLegged(config.scopes.public);
  const internalCredentialsThreeLegged = await internalTokenClient.getToken(code);
  const publicCredentialsThreeLegged = await publicTokenClient.refreshToken(internalCredentialsThreeLegged);

  // construct and return two and three legged session data
  const now = new Date();
  const session = {
    two_legged: {
      internal_token: internalCredentialsTwoLegged.access_token,
      public_token: publicCredentialsTwoLegged.access_token,
      expires_at: (now.setSeconds(now.getSeconds() + publicCredentialsTwoLegged.expires_in))
    },
    three_legged: {
      internal_token: internalCredentialsThreeLegged.access_token,
      public_token: publicCredentialsThreeLegged.access_token,
      refresh_token: publicCredentialsThreeLegged.refresh_token,
      expires_at: (now.setSeconds(now.getSeconds() + publicCredentialsThreeLegged.expires_in))
    },
  };

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(session)
  };
};

// export the helpers for use in other serverless functions
export {
  config,
  getClientThreeLegged,
  getClientTwoLegged
};