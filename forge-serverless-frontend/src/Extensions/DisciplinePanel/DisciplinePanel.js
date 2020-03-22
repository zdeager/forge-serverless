// React stuff
import React from 'react';
import ReactDOM from 'react-dom';

// API requests via amplify
import { API } from "aws-amplify";

// panel styles
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import './DisciplinePanel.css';

class DisciplinePanel extends Autodesk.Viewing.UI.DockingPanel {
  constructor (viewer, options) {
    super(viewer.container, options.id, options.title, options);

    // set init panel data
    this.panel_data = {
      discipline_id: options.discipline_id,
      critical_asset_groups: null,
      selected_group: "",
      critical_assets: null,
      selected_asset: ""
    }
    // functions for fetching/updating panel data
    this.panel_data.selectGroup = (group) => {
      console.log(group);
      this.panel_data.selected_group = group;
      API.get("forge-serverless-api", "/groups/" + group).then(resp => {
        this.panel_data.critical_assets = resp.assets;
        this.reactNode = ReactDOM.render(
          <DisciplinePanelContent panel_data={this.panel_data} />, 
          this.DOMContent
        );
      });
    }
    this.panel_data.selectAsset = (asset) => {
      console.log(asset);
      this.panel_data.selected_asset = asset;
      this.reactNode = ReactDOM.render(
        <DisciplinePanelContent panel_data={this.panel_data} />, 
        this.DOMContent
      );
      viewer.fitToView([40487]);
      viewer.isolate(40487);
    }

    // create element to hold react content
    this.DOMContent = document.createElement('div');
    this.DOMContent.className = 'content';
    this.container.classList.add('react-docking-panel');
    // add element to panel
    this.container.appendChild(this.DOMContent);
  }

  setVisible (show) {
    super.setVisible(show)

    if (show) { // show -> render react content
      // initial render
      this.reactNode = ReactDOM.render(
        <DisciplinePanelContent panel_data={this.panel_data} />, 
        this.DOMContent
      );
      // fetch data for discipline, update panel data
      API.get("forge-serverless-api", "/disciplines/" + this.panel_data.discipline_id).then(resp => {
        this.panel_data.critical_asset_groups = resp.critical_asset_groups;
        this.reactNode = ReactDOM.render(
          <DisciplinePanelContent panel_data={this.panel_data}/>, 
          this.DOMContent
        );
      });
    } else if (this.DOMContent) { // hide -> destroy react content and panel data
      ReactDOM.unmountComponentAtNode(this.DOMContent);
      this.reactNode = null;
      Object.assign(this.panel_data, {
        critical_asset_groups: null,
        selected_group: "",
        critical_assets: null,
        selected_asset: ""
      });
    }
  }
}

// Panel content (React)
function DisciplinePanelContent(props){
  console.log(props);
  const { critical_asset_groups, 
          selected_group, selectGroup,
          critical_assets,
          selected_asset, selectAsset } = props.panel_data;
  const group_select = critical_asset_groups ? (
    <FormGroup className="panel_form">
      <ControlLabel>Critical Asset Groups</ControlLabel>
      <FormControl 
        componentClass="select"
        value={selected_group}
        onChange={e => selectGroup(e.target.value)}
      >
        <option value="" disabled>Select</option>
        {
          critical_asset_groups.map((group, idx) => {
            return (<option key={idx} value={group}>{group}</option>)
          })
        }
      </FormControl>
    </FormGroup>
  ): null;
  const asset_select = critical_assets ? (
    <FormGroup className="panel_form">
      <ControlLabel>Critical Assets</ControlLabel>
      <FormControl 
        componentClass="select"
        value={selected_asset}
        onChange={e => selectAsset(e.target.value)}
      >
        <option value="" disabled>Select</option>
        {
          critical_assets.map((asset, idx) => {
            return (<option key={idx} value={asset}>{asset}</option>)
          })
        }
      </FormControl>
    </FormGroup>
  ) : null;
  const asset_data = selected_asset ? (
    <div>
      FUN DATA HERE!!!
    </div>
  ) : null;

  return critical_asset_groups ? (
    <div className='react-content'>
      { group_select }
      { asset_select }
      { asset_data }
    </div>
  ) : (
    "Loading..."
  );
}

export default DisciplinePanel;