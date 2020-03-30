// React stuff
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// API requests via amplify
import { API } from "aws-amplify";

// panel styles
import { FormGroup, FormControl, ControlLabel, Nav, NavItem } from "react-bootstrap";
import './DisciplinePanel.css';

import pic from './pic.png';

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
    this.groups = options.groups;
    this.viewer = viewer;
  }

  setVisible (show) {
    super.setVisible(show)

    if (show) { // show -> render react content
      // initial render
      this.reactNode = ReactDOM.render(
        <DisciplinePanelContent groups={this.groups} viewer={this.viewer} />, 
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
  const [isLoading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [assets, setAssets] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [tab, setTab] = useState(1);

  function selectGroup(group) {
    // search model for elements in asset group
    props.viewer.search(`"`+group+`"`, async dbIds => {
      const assets = await Promise.all(dbIds.map(async dbId => {
        const res = await new Promise(resolve => {
          props.viewer.model.getProperties(dbId, props => resolve(props));
        })
        return {extId: res.externalId, name: res.name, dbId: dbId};
      }));
      setAssets(assets);
      setSelectedGroup(group);
    }, null, ['Asset Group']);
  }

  function selectAsset(asset) {
    setSelectedAsset(asset);
    props.viewer.fitToView([asset]);
    //props.viewer.isolate(asset);
  }

  function tabContent() {
    if (tab === 1) { // overview
      return (
        <span>
          <strong>Criticality</strong> 3<br/>
          <strong>Assignee</strong> Bob Doss<br/>
          <strong>Data Sources</strong> ????<br/>
          <strong>Functional Location</strong> BLDG-FLOOR-ROOM<br/>
          <strong>More Fun Stuff</strong><br/>
        </span>
      );
    } else if (tab === 4) { // cost data
      return <img height="400px" src={pic} alt="pic" />;
    }
  }

  const groupSelect = props.groups ? (
    <FormGroup className="panel-form-l">
      <ControlLabel>Asset Groups</ControlLabel>
      <FormControl 
        componentClass="select"
        value={selectedGroup}
        onChange={e => selectGroup(e.target.value)}
      >
        <option value="" disabled>Select</option>
        {
          props.groups.map((group, idx) => {
            return (<option key={idx} value={group}>{group}</option>)
          })
        }
      </FormControl>
    </FormGroup>
  ): null;
  const assetSelect = assets ? (
    <FormGroup className="panel-form-r">
      <ControlLabel>Critical Assets</ControlLabel>
      <FormControl 
        componentClass="select"
        value={selectedAsset}
        onChange={e => selectAsset(e.target.value)}
      >
        <option value="" disabled>Select</option>
        {
          assets.map((asset, idx) => {
            return (<option key={idx} value={asset.dbId}>{asset.name}</option>)
          })
        }
      </FormControl>
    </FormGroup>
  ) : null;
  const assetData = selectedAsset ? (
    <div>
      <Nav bsStyle="tabs" activeKey={tab} onSelect={k => setTab(k)}>
        <NavItem eventKey={1}>
          Overview
        </NavItem>
        <NavItem eventKey={2}>
          Warranty & Spare Parts
        </NavItem>
        <NavItem eventKey={3} >
          Cost Data
        </NavItem>
        <NavItem eventKey={4} >
          Sensor Data
        </NavItem>
        <NavItem eventKey={5} >
          Condition Index
        </NavItem>
      </Nav>
      <div className="tab-content">
        { tabContent() }
      </div>
    </div>
  ) : null;

  return !isLoading ? (
    <div className='react-content'>
      <div className='panel-form-container'>
      { groupSelect }
      { assetSelect }
      </div>
      { assetData }
    </div>
  ) : (
    <div className='react-content'>
      Loading...
    </div>
  );
}

export default DisciplinePanel;