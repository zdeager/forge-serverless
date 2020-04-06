// React stuff
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// API requests via amplify
import { API } from "aws-amplify";

// panel styles
import { 
  FormGroup, 
  FormControl, 
  ControlLabel, 
  Nav, 
  NavItem, 
  Row, 
  Col, 
  Button 
} from "react-bootstrap";
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
    this.document = options.document;
  }

  setVisible (show) {
    super.setVisible(show)

    if (show) { // show -> render react content
      // initial render
      this.reactNode = ReactDOM.render(
        <DisciplinePanelContent groups={this.groups} viewer={this.viewer} document={this.document} />, 
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
  const [showId, setShowId] = useState(false);
  const [notes, setNotes] = useState([
    {
      date: "13 May 2010",
      text: "Procured."
    },
    {
      date: "21 Feb 2018",
      text: "Sensor replaced."
    }
  ]);
  const [noteInput, setNoteInput] = useState("");

  function selectGroup(group) {
    // search model for elements in asset group
    props.viewer.search(`"`+group+`"`, async dbIds => {
      const assets = await Promise.all(dbIds.map(async dbId => {
        const res = await new Promise(resolve => {
          props.viewer.model.getProperties(dbId, props => resolve(props));
        })
        const name = res.name.replace(/\ \[\d+\]$/g, ''); // remove ElementID from name
        return {extId: res.externalId, name: name, dbId: dbId};
      }));
      setAssets(assets);
      setSelectedGroup(group);
    }, null, ['Asset Group']);
  }

  function selectAsset(asset_idx) {
    setSelectedAsset(assets[asset_idx]);
    props.viewer.fitToView([assets[asset_idx].dbId]);
    //props.viewer.isolate(asset);
  }

  function addNote() {
    if (!noteInput) return;
    const note = {
      date: "2 Apr 2020",
      text: noteInput
    };
    setNotes([...notes, note]);
    setNoteInput("");
  }

  function tabContent() {
    if (tab === 1) { // overview
      return (
        <Row style={{display: "flex"}}>
          <Col xs={4}>
            <div>
              <div className="data-block"><span className="data-label">UniqueID</span>
                { !showId ? <a onClick={()=>setShowId(true)}>Show</a> : selectedAsset.extId }
              </div>
              <div className="data-block"><span className="data-label">Criticality</span>3</div>
              <div className="data-block">
                <span className="data-label">Assignee(s)</span>
                <ul className="data-list">
                  <li>Bob Doss <a>Contact</a></li>
                  <li>Jane Novak <a>Contact</a></li>
                </ul>
              </div>
              <div className="data-block">
                <span className="data-label">Information System(s)</span>
                <ul className="data-list">
                  <li>CMMS</li>
                  <li>ERP</li>
                </ul>
              </div>
              <div className="data-block">
                <span className="data-label">Functional Location</span>
                <ul className="data-list">
                  <li><span className="data-label">Building</span> 08</li>
                  <li><span className="data-label">Floor</span> 1</li>
                  <li><span className="data-label">Room</span> 324</li>
                  <li><span className="data-label">Room Func.</span> Unknown</li>
                </ul>
              </div>
              <div className="data-block">
                <span className="data-label">Warranty</span>
                <ul className="data-list">
                    <li><span className="data-label">Procured</span> 13 May 2010</li>
                    <li><span className="data-label">Expires</span> 13 May 2020</li>
                    <li><span className="data-label">Spare Parts</span> None</li>
                </ul>
              </div>
              <div className="data-block">
                <span className="data-label">Sensor Status</span> 
                <span style={{fontWeight: 900, color: "springgreen"}}>OK</span><br/>
              </div>
            </div>
          </Col>
          <Col xs={8}>
            <span className="data-label">Notes</span>
              {
                notes.map((note, idx) => (
                  <div key={idx} className="note">
                    <div className="text-muted">{note.date}</div>
                    <div>{note.text}</div>
                  </div>
                ))
              }
              <FormGroup style={{marginBottom: "10px"}}>
                <FormControl 
                  className="textbox" 
                  componentClass="textarea" 
                  placeholder="Note..." 
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                />
              </FormGroup>
              <Button onClick={addNote}>Add note</Button>
          </Col>
        </Row>
      );
    } else if (tab === 2) { // cost data
      return <img height="400px" src={pic} alt="pic" />;
    } else if (tab === 4) {
      return <div id="viewer2D"/>
    }
  }

  // load 2D sheet
  useEffect(() => {
    if (tab === 4) {
      const viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('viewer2D'));
      viewer.start();
      const items = props.document.getRoot().search({'type':'geometry', 'role': '2d'});
      viewer.loadDocumentNode(props.document, items[0]);
    }

  }, [tab])

  const groupSelect = props.groups ? (
    <FormGroup className="panel-form-l">
      <ControlLabel>Asset Groups</ControlLabel>
      <FormControl 
        componentClass="select"
        value={selectedGroup}
        onChange={e => {
          selectGroup(e.target.value);
          setSelectedAsset("");
        }}
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
            return (<option key={idx} value={idx}>{asset.name}</option>)
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
        <NavItem eventKey={2} >
          Cost Data & Condition Index (CI)
        </NavItem>
        <NavItem eventKey={3} >
          Sensor Data
        </NavItem>
        <NavItem eventKey={4} >
          Floor Plan
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