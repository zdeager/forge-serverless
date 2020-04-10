// React stuff
import React, { useState, useEffect } from "react";
import { Navbar } from "react-bootstrap";
import { withRouter } from "react-router-dom";

// library for making calls to serverless backaend
import { API } from "aws-amplify";

// helper dependencies
import TreeView from 'react-simple-jstree';
import queryString from 'query-string';

// local configs, styles, etc.
import config from './config';
import "./App.css";
config.extensions.forEach(ext => {
  // import extensions specified in config.js (registers extension w/ viewer)
  import('./Extensions/'+ext); 
})
import './Extensions/ExtensionToolbars.css'; // extension toolbar(s) styles


function App(props) {
  // viewer variables
  const Autodesk = window.Autodesk;
  var viewer;
  // state variables
  const [session, setSession] = useState(null);
  const [isAuthenticating, setAuthenticating] = useState(true);
  const [user_profile, setProfile] = useState(null);
  const [iframe, setIframe] = useState(null);

  // "componentdidmount"
  useEffect(() => {
    authenticate();
  }, []);

  // listen for changes to session state variable
  useEffect(() => {
    if (session) // new session -> fetch user data
      fetchProfile();
    else // session ended -> clear user data
      setProfile(null);
  }, [session]);

  function authenticate() {
    const parsed = queryString.parse(location.search);
    // check for callback from login ("code" query param)
    if (parsed.code) {
      // get session data from serverless api
      API.get(
        "forge-serverless-api", 
        "/oauth/create_session",
        {queryStringParameters: {code: parsed.code}}
      ).then(resp => {
        // auth completed, add session to state
        setAuthenticating(false);
        setSession(resp);
        // remove code url param
        props.history.push("/");
      });
    } else {
      setAuthenticating(false);
    }
  }

  // session helper functions (type = 'two_legged' or 'three_legged')
  function sessionIsExpired(type) {
    return (new Date() > new Date(session[type].expires_at));
  }
  function sessionExpiresIn(type) {
    const now = new Date();
    const expiresAt = new Date(session[type].expires_at);
    return Math.round((expiresAt.getTime() - now.getTime()) / 1000);
  }

  function fetchProfile() {
    // get user profile from serverless api
    API.get(
      "forge-serverless-api", 
      "/user/profile",
      {
        queryStringParameters: {
          access_token: session.three_legged.internal_token,
          expires_in: sessionExpiresIn("three_legged")
        }
      }
    ).then(resp => {
      // add profile to state
      setProfile(resp);
    });
  }

  function handleLogin() {
    // construct login url
    const url =
      'https://developer.api.autodesk.com' +
      '/authentication/v1/authorize?response_type=code' +
      '&client_id=' + config.client_id +
      '&redirect_uri=' + config.callback_url +
      '&scope=' + config.scopes.join(' ');
    // navigate to url
    window.location = url;
  }

  function handleLogout() {
    // log out of autodesk via hidden iframe
    setIframe("https://accounts.autodesk.com/Authentication/LogOut");
    // reset session
    setSession(null);
    // tear down viewer (if active)
    if (viewer) {
      viewer.finish();
      viewer = null;
      Autodesk.Viewing.shutdown();
    }
  }

  // load documents from panel selection into viewer
  function handleChange(e, data) {
    if (sessionIsExpired("two_legged"))
      handleLogout(); // log out if session expired...
    if (data && data.node && (data.node.type === 'versions' || data.node.type === 'bim360documents')) {
      let urn;
      let viewableId = null;
      // in case the node.id contains a | then split into URN & viewableId
      if (data.node.id.indexOf('|') > -1) {
        urn = data.node.id.split('|')[1];
        viewableId = data.node.id.split('|')[2];
      } else {
        urn = data.node.id;
      }

      if (!viewer) { // if viewer not initialized
        const options = {
          env: 'AutodeskProduction',
          getAccessToken: (cb) => {
            cb(session.two_legged.public_token, sessionExpiresIn("two_legged"));
          },
          api: 'derivativeV2' + (atob(urn.replace('_', '/')).indexOf('emea') > -1 ? '_EU' : '') // handle BIM 360 US and EU regions
        };

        // initialize the viewer
        Autodesk.Viewing.Initializer(options, () => {
          // create new viewer and load extensions specified in config.js
          viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forgeViewer'));
          viewer.start();
        });
      }

      // load selected document
      const documentId = 'urn:' + urn;
      Autodesk.Viewing.Document.load(
        documentId, 
        (document) => {
          const viewables = (viewableId ? document.getRoot().findByGuid(viewableId) : document.getRoot().getDefaultGeometry());
          viewer.loadExtension(config.extensions[0], {document: document});
          viewer.loadDocumentNode(document, viewables);
        }, 
        (error) => {
          console.error('onDocumentLoadFailure() - errorCode:' + error);
        }
      );
    }
  }

  // data for document tree in panel
  let data = {
    'core': {
      'themes': { "icons": true },
      'multiple': false,
      'data': async function (node, cb) {
        if (sessionIsExpired("three_legged"))
          handleLogout(); // log out if session expired...
        // get document data from serverless api
        await API.get(
          "forge-serverless-api", 
          "/datamanagement",
          {
            queryStringParameters: {
              id: node.id,
              access_token: session.three_legged.internal_token,
              expires_in: sessionExpiresIn("three_legged")
            }
          }
        ).then(resp => {
          cb(resp);
        });
      }
    },
    'types': {
      'default': { 'icon': 'glyphicon glyphicon-question-sign' },
      '#': { 'icon': 'glyphicon glyphicon-user' },
      'hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
      'personalHub': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
      'bim360Hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360hub.png' },
      'bim360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360project.png' },
      'a360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360project.png' },      
      'folders': { 'icon': 'glyphicon glyphicon-folder-open' },
      'items': { 'icon': 'glyphicon glyphicon-file' },
      'bim360documents': { 'icon': 'glyphicon glyphicon-file' },
      'versions': { 'icon': 'glyphicon glyphicon-time' },
      'unsupported': { 'icon': 'glyphicon glyphicon-ban-circle' }
    },
    'sort': function (a, b) {
      var a1 = this.get_node(a);
      var b1 = this.get_node(b);
      var parent = this.get_node(a1.parent);
      if (parent.type === 'items') { // sort by version number
        var id1 = Number.parseInt(a1.text.substring(a1.text.indexOf('v') + 1, a1.text.indexOf(':')), 10)
        var id2 = Number.parseInt(b1.text.substring(b1.text.indexOf('v') + 1, b1.text.indexOf(':')), 10);
        return id1 > id2 ? 1 : -1;
      }
      else if (a1.type !== b1.type) return a1.icon < b1.icon ? 1 : -1; // types are different inside folder, so sort by icon (files/folders)
      else return a1.text > b1.text ? 1 : -1; // basic name/text sort
    },
    'plugins': ['types', 'sort']
  }

  return (
    <div className="App container">
      <Navbar fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <a target="_blank" href="http://developer.autodesk.com">
              <img 
                alt="Autodesk Forge" 
                src="https://developer.static.autodesk.com/images/logo_forge-2-line.png" 
                height="20"
              />
            </a>
          </Navbar.Brand>
        </Navbar.Header>
      </Navbar>
      <div className="row fill">
        <div className="col-sm-3 fill">
          <div className="panel panel-default fill">
            { 
              user_profile ? (
                <div 
                  className="panel-heading" 
                  data-toggle="tooltip" 
                  style={{padding: "3px"}}
                >
                  <span>
                    <img 
                      alt="avatar" 
                      src={user_profile.picture} 
                      height="20px"
                    />
                    <span style={{verticalAlign: "bottom", padding: "3px"}}>
                      {user_profile.name}
                    </span>
                  </span>
                  <span 
                    onClick={handleLogout} 
                    className="glyphicon glyphicon-log-out" 
                    style={{cursor: "pointer", float: "right"}} 
                    title="Sign out"> 
                  </span>
                </div>
              ) : null
            }
            <div className="user-hubs">
              { 
                !session ? (
                  !isAuthenticating ? (
                    <div className="panel-content">
                      <button className="btn btn-lg btn-default" onClick={handleLogin}>
                        <div>Sign in</div>
                        <img 
                          alt="Sign in" 
                          src="https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/autodesk_text.png"
                          height="20"
                        /> 
                      </button>
                      <div style={{paddingTop: "50px"}}>
                        You may also need to provision your BIM 360 Docs account for this app.
                        <a href="https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps"> Learn more</a>.
                      </div>
                    </div> 
                  ) : (
                    <div className="panel-content">
                      Loading...
                    </div> 
                  )
                ) : (
                  <TreeView 
                    treeData={data} 
                    onChange={(e, data) => handleChange(e, data)}
                  />
                )
              }
            </div>
          </div>
        </div>
        <div className="col-sm-9 fill">
            <div id="forgeViewer"/>
        </div>
      </div>
      <iframe 
        src={iframe} 
        style={{visibility: "hidden", display: "none"}} 
      />
    </div>
  );
}

export default withRouter(App);
