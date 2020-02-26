const {
  // BucketsApi, // FOR ACCESSING BUCKETS/OBJECTS
  // ObjectsApi, // FOR ACCESSING BUCKETS/OBJECTS
  HubsApi,
  ProjectsApi,
  FoldersApi,
  ItemsApi
} = require('forge-apis');

// import helper from oauth.js
import {
  getClientThreeLegged
} from "./oauth";

export const datamanagement = async (event, context) => {
  // The id query param contains what was selected on the UI tree, make sure it's valid
  const href = event.queryStringParameters.id;
  delete event.queryStringParameters.id; // remove id from query params
  if (href === '') {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({})
    };
  }

  // Get the access token
  const internalToken = event.queryStringParameters;
  let res = {};
  // THIS COMMENTED BLOCK IS CODE FOR ACCESSING BUCKETS/OBJECTS
  // if (href === '#') {
  //   // Retrieve buckets from Forge using the [BucketsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/BucketsApi.md#getBuckets)
  //   const buckets = await new BucketsApi().getBuckets({
  //     limit: 64
  //   }, getClientTwoLegged, internalToken);
  //   res = buckets.body.items.map((bucket) => {
  //     return {
  //       id: bucket.bucketKey,
  //       // Remove bucket key prefix that was added during bucket creation
  //       text: bucket.bucketKey.replace(config.credentials.client_id.toLowerCase() + '-', ''),
  //       type: 'bucket',
  //       children: true
  //     };
  //   });
  // } else {
  //   // Retrieve objects from Forge using the [ObjectsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/ObjectsApi.md#getObjects)
  //   const objects = await new ObjectsApi().getObjects(href, {}, getClientTwoLegged, internalToken);
  //   res = objects.body.items.map((object) => {
  //     return {
  //       id: Buffer.from(object.objectId).toString('base64'),
  //       text: object.objectKey,
  //       type: 'object',
  //       children: false
  //     };
  //   });
  // }

  if (href === '#') {
    // If href is '#', it's the root tree node
    res = await getHubs(getClientThreeLegged(), internalToken);
  } else {
    // Otherwise let's break it by '/'
    const params = href.split('/');
    const resourceName = params[params.length - 2];
    const resourceId = params[params.length - 1];
    switch (resourceName) {
      case 'hubs':
        res = await getProjects(resourceId, getClientThreeLegged(), internalToken);
        break;
      case 'projects':
        // For a project, first we need the top/root folder
        const hubId = params[params.length - 3];
        res = await getFolders(hubId, resourceId /*project_id*/ , getClientThreeLegged(), internalToken);
        break;
      case 'folders': {
        const projectId = params[params.length - 3];
        res = await getFolderContents(projectId, resourceId /*folder_id*/ , getClientThreeLegged(), internalToken);
        break;
      }
      case 'items': {
        const projectId = params[params.length - 3];
        res = await getVersions(projectId, resourceId /*item_id*/ , getClientThreeLegged(), internalToken);
        break;
      }
    }
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(res)
  };
};

async function getHubs(oauthClient, credentials) {
  const hubs = new HubsApi();
  const data = await hubs.getHubs({}, oauthClient, credentials);
  return data.body.data.map((hub) => {
    let hubType;
    switch (hub.attributes.extension.type) {
      case 'hubs:autodesk.core:Hub':
        hubType = 'hubs';
        break;
      case 'hubs:autodesk.a360:PersonalHub':
        hubType = 'personalHub';
        break;
      case 'hubs:autodesk.bim360:Account':
        hubType = 'bim360Hubs';
        break;
    }
    return createTreeNode(
      hub.links.self.href,
      hub.attributes.name,
      hubType,
      true
    );
  });
}

async function getProjects(hubId, oauthClient, credentials) {
  const projects = new ProjectsApi();
  const data = await projects.getHubProjects(hubId, {}, oauthClient, credentials);
  return data.body.data.map((project) => {
    let projectType = 'projects';
    switch (project.attributes.extension.type) {
      case 'projects:autodesk.core:Project':
        projectType = 'a360projects';
        break;
      case 'projects:autodesk.bim360:Project':
        projectType = 'bim360projects';
        break;
    }
    return createTreeNode(
      project.links.self.href,
      project.attributes.name,
      projectType,
      true
    );
  });
}

async function getFolders(hubId, projectId, oauthClient, credentials) {
  const projects = new ProjectsApi();
  const folders = await projects.getProjectTopFolders(hubId, projectId, oauthClient, credentials);
  return folders.body.data.map((item) => {
    return createTreeNode(
      item.links.self.href,
      item.attributes.displayName == null ? item.attributes.name : item.attributes.displayName,
      item.type,
      true
    );
  });
}

async function getFolderContents(projectId, folderId, oauthClient, credentials) {
  const folders = new FoldersApi();
  const contents = await folders.getFolderContents(projectId, folderId, {}, oauthClient, credentials);
  const treeNodes = contents.body.data.map((item) => {
    var name = (item.attributes.name == null ? item.attributes.displayName : item.attributes.name);
    if (name !== '') { // BIM 360 Items with no displayName also don't have storage, so not file to transfer
      return createTreeNode(
        item.links.self.href,
        name,
        item.type,
        true
      );
    } else {
      return null;
    }
  });
  return treeNodes.filter(node => node !== null);
}

async function getVersions(projectId, itemId, oauthClient, credentials) {
  const items = new ItemsApi();
  const versions = await items.getItemVersions(projectId, itemId, {}, oauthClient, credentials);
  return versions.body.data.map((version) => {
    const dateFormated = new Date(version.attributes.lastModifiedTime).toLocaleString();
    const versionst = version.id.match(/^(.*)\?version=(\d+)$/)[2];
    const viewerUrn = (version.relationships != null && version.relationships.derivatives != null ? version.relationships.derivatives.data.id : null);
    return createTreeNode(
      viewerUrn,
      decodeURI('v' + versionst + ': ' + dateFormated + ' by ' + version.attributes.lastModifiedUserName),
      (viewerUrn != null ? 'versions' : 'unsupported'),
      false
    );
  });
}

// Format data for tree
function createTreeNode(_id, _text, _type, _children) {
  return {
    id: _id,
    text: _text,
    type: _type,
    children: _children
  };
}