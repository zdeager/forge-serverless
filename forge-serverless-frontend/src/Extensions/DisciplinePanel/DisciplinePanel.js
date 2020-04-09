// React stuff
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// helper packages
import { API } from "aws-amplify";
import Chart from 'react-apexcharts'
import moment from 'moment'
import { CIVizData, CostVizData, SensorVizData } from './DisciplineCharts'

// panel styles
import { 
  FormGroup, 
  FormControl, 
  ControlLabel, 
  Row, 
  Col, 
  Button,
  Tabs,
  Tab
} from "react-bootstrap";
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
  const [selectedGroup, setSelectedGroup] = useState("");
  const [assets, setAssets] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [assetData, setAssetData] = useState(null);
  const [tab, setTab] = useState(1);
  const [showId, setShowId] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [chartData, setChartData] = useState(null);
  const [chartDataCI, setChartDataCI] = useState(null);
  const [chartDataCost, setChartDataCost] = useState(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setChartData(chartData => {
        const yrange = {min: 10, max: 90 };
        if (!chartData) {
          const x = new Date().getTime();
          const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
          const data = [{ x, y }];
          const baseline = [{ x, y: 54 }];
          return SensorVizData(data, baseline);
        } else {
          let data = chartData.series[0].data;
          const date = new Date().getTime();
          data = [...data, {
            x: date,
            y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min
          }];
          let baseline = chartData.series[1].data;
          baseline = [...baseline, {
            x: date,
            y: 54
          }];
          return SensorVizData(data, baseline);
        }});
      }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

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
    const asset = assets[asset_idx];
    API.get("forge-serverless-api", "/assets/" + asset.extId).then(resp => {
      setSelectedAsset(asset);
      setAssetData(resp);
      props.viewer.fitToView([asset.dbId]);
      props.viewer.isolate([asset.dbId]);
      setChartDataCI(CIVizData(resp.CIdata));
      setChartDataCost(CostVizData(resp.costs));
    });
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

  // load 2D sheet
  useEffect(() => {
    if (tab === 5) {
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
  const assetContent = selectedAsset && chartData && assetData && chartDataCI && chartDataCost ? (
    <div>
      <Tabs 
        activeKey={tab}
        onSelect={(k)=>setTab(k)}
        id="controlled-tab-example"
        animation={false} 
      >
        <Tab eventKey={1} title="Overview">
          <Row style={{display: "flex"}}>
            <Col xs={4}>
              <div>
                <div className="data-block"><span className="data-label">UniqueID</span>
                  { !showId ? <a onClick={()=>setShowId(true)}>Show</a> : selectedAsset.extId }
                </div>
                <div className="data-block">
                  <span className="data-label">Criticality</span>{ assetData.criticality }
                </div>
                <div className="data-block">
                  <span className="data-label">Assignee(s)</span>
                  <ul className="data-list">
                    {
                      assetData.contacts.map((contact, idx) => (
                        <li key={idx}>{contact.name} <a>Contact</a></li>
                      ))
                    }
                  </ul>
                </div>
                <div className="data-block">
                  <span className="data-label">Information System(s)</span>
                  <ul className="data-list">
                    {
                      assetData.sources.map((source, idx) => (
                        <li key={idx}>{ source.name }</li>
                      ))
                    }
                  </ul>
                </div>
                <div className="data-block">
                  <span className="data-label">Functional Location</span>
                  <ul className="data-list">
                    <li><span className="data-label">Building</span>{ assetData.location.building }</li>
                    <li><span className="data-label">Floor</span>{ assetData.location.floor }</li>
                    <li><span className="data-label">Room</span>{ assetData.location.room }</li>
                    <li><span className="data-label">Room Func.</span>{ assetData.location.func }</li>
                  </ul>
                </div>
                <div className="data-block">
                  <span className="data-label">Warranty</span>
                  <ul className="data-list">
                      <li><span className="data-label">Procured</span> 
                        { moment(new Date(assetData.warranty.procure_date)).format("ll") }
                      </li>
                      <li><span className="data-label">Expires</span>
                        { moment(new Date(assetData.warranty.expir_date)).format("ll") }
                      </li>
                      <li><span className="data-label">Spare Parts</span>
                        { assetData.warranty.spare_parts }
                      </li>
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
                  assetData.notes.map((note, idx) => (
                    <div key={idx} className="note">
                      <div className="text-muted">
                      { moment(new Date(note.date)).format("ll") } 
                      </div>
                      <div>{ note.note }</div>
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
        </Tab>
        <Tab eventKey={2} title="Condition Index (CI)">
          <div>
            <Chart options={chartDataCI.options} series={chartDataCI.series} type="line" />
          </div>
        </Tab>
        <Tab eventKey={3} title="Cost Data">
          <div>
            <Chart options={chartDataCost.options} series={chartDataCost.series} type="bar" />
          </div>
        </Tab>
        <Tab eventKey={4} title="Sensor Data">
          <div>
            <Chart options={chartData.options} series={chartData.series} type="line" />
          </div>
        </Tab>
        <Tab eventKey={5} title="Floor Plan">
          <div id="viewer2D"/>
        </Tab>
      </Tabs>
    </div>
  ) : null;

  return (
    <div className='react-content'>
      <div className='panel-form-container'>
      { groupSelect }
      { assetSelect }
      </div>
      { assetContent }
    </div>
  );
}

export default DisciplinePanel;