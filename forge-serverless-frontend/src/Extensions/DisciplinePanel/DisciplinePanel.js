// React stuff
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// API requests via amplify
import { API } from "aws-amplify";

// panel styles
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import './DisciplinePanel.css';

class DisciplinePanel extends Autodesk.Viewing.UI.DockingPanel {
  constructor (viewer, options) {
    super(viewer.container, options.id, options.title, options);

    // create element to hold react content
    this.DOMContent = document.createElement('div');
    this.DOMContent.className = 'content';
    this.container.classList.add('react-docking-panel');
    // add element to panel
    this.container.appendChild(this.DOMContent);
    // props for panel content
    this.discipline_id = options.discipline_id;
    this.viewer = viewer;
  }

  setVisible (show) {
    super.setVisible(show)

    if (show) { // show -> render react content
      // initial render
      this.reactNode = ReactDOM.render(
        <DisciplinePanelContent discipline_id={this.discipline_id} viewer={this.viewer} />, 
        this.DOMContent
      );
    } else if (this.DOMContent) { // hide -> destroy react content and panel data
      ReactDOM.unmountComponentAtNode(this.DOMContent);
      this.reactNode = null;
    }
  }
}

// Panel content (React)
function DisciplinePanelContent(props) {
  const [isLoading, setLoading] = useState(true);
  const [groups, setGroups] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [assets, setAssets] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState("");

  useEffect(() => {
    API.get("forge-serverless-api", "/disciplines/" + props.discipline_id).then(resp => {
      setGroups(resp.critical_asset_groups);
      setLoading(false);
    });
  }, [])

  function selectGroup(group) {
    API.get("forge-serverless-api", "/groups/" + group).then(resp => {
      setAssets(resp.assets);
      setSelectedGroup(group);
    });
  }

  function selectAsset(asset) {
    setSelectedAsset(asset);
    props.viewer.fitToView([40487]);
    props.viewer.isolate(40487);
  }

  const groupSelect = groups ? (
    <FormGroup className="panel_form">
      <ControlLabel>Critical Asset Groups</ControlLabel>
      <FormControl 
        componentClass="select"
        value={selectedGroup}
        onChange={e => selectGroup(e.target.value)}
      >
        <option value="" disabled>Select</option>
        {
          groups.map((group, idx) => {
            return (<option key={idx} value={group}>{group}</option>)
          })
        }
      </FormControl>
    </FormGroup>
  ): null;
  const assetSelect = assets ? (
    <FormGroup className="panel_form">
      <ControlLabel>Critical Assets</ControlLabel>
      <FormControl 
        componentClass="select"
        value={selectedAsset}
        onChange={e => selectAsset(e.target.value)}
      >
        <option value="" disabled>Select</option>
        {
          assets.map((asset, idx) => {
            return (<option key={idx} value={asset}>{asset}</option>)
          })
        }
      </FormControl>
    </FormGroup>
  ) : null;
  const assetData = selectedAsset ? (
    <div>
      FUN DATA HERE!!!
    </div>
  ) : null;

  return !isLoading ? (
    <div className='react-content'>
      { groupSelect }
      { assetSelect }
      { assetData }
    </div>
  ) : (
    <div className='react-content'>
      Loading...
    </div>
  );
}

export default DisciplinePanel;