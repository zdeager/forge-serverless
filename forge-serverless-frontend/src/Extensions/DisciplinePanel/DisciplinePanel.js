// React stuff
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// API requests via amplify
import { API } from "aws-amplify";

// apexcharts
import Chart from 'react-apexcharts'

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
      let state = {
        series: [{
          name: 'Procurement',
          data: [80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }, {
          name: 'Maintenance (Labor)',
          data: [0, 2.50, 2.70, 2.91, 3.14, 3.40, 3.67, 3.96, 4.28, 4.62, 4.99]
        }, {
          name: 'Maintenance (Material)',
          data: [0, 5.00, 5.40, 5.83, 6.29, 6.80, 7.34, 7.93, 8.56, 9.25, 9.99]
        }, {
          name: 'Depreciation',
          data: [0, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5]
        }],
        options: {
          chart: {
            type: 'bar',
            height: 350,
            stacked: true,
            toolbar: {
              show: false
            },
          },
          plotOptions: {
            bar: {
              horizontal: false,
            },
          },
          stroke: {
            width: 1,
            colors: ['#fff']
          },
          title: {
            text: 'Cost Data',
            style: {
              color:  '#fff'
            },
          },
          xaxis: {
            categories: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            labels: {
              style: {
                  colors: ['#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff'],
              },
            },
            title: {
              text: 'Year',
              style: {
                color:  '#fff'
              },
            },
          },
          yaxis: {
            title: {
              text: 'Cost (USD)',
              style: {
                color:  '#fff'
              },
            },
            labels: {
              formatter: function (val) {
                return val + "K"
              },
              style: {
                  colors: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
              },
            }
          },
          tooltip: {
            x: {
              formatter: function (val) {
                return "Year " + val
              }
            }
          },
          fill: {
            opacity: 1
          },
          legend: {
            position: 'top',
            horizontalAlign: 'left',
            offsetX: 0,
            labels: {
                colors: '#fff'
            }
          }
        },
      };

      let state2 = {
        series: [{
            name: "CI",
            data: [null, 90.81, 90.27, 89.70, 89.09, 88.45, 87.77, 87.05, 86.29, 85.48, 84.63]
        }],
        options: {
          chart: {
            height: 350,
            type: 'line',
            zoom: {
              enabled: false
            },
            toolbar: {
              show: false
            },
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'smooth'
          },
          title: {
            text: 'Condition Index',
            align: 'left',
            style: {
              color:  '#fff'
            },
          },
          grid: {
            row: {
              colors: ['transparent'], // takes an array which will be repeated on columns
            },
          },
          xaxis: {
            categories: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            labels: {
              style: {
                  colors: ['#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff'],
              },
            },
            title: {
              text: "Year",
              style: {
                color:  '#fff'
              },
            },
          },
          yaxis: {
            title: {
              text: undefined
            },
            labels: {
              formatter: function (val) {
                return val + "%"
              },
              style: {
                  colors: ['#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff','#fff'],
              },
            }
          },
          tooltip: {
            x: {
              formatter: function (val) {
                return "Year " + (val-1)
              }
            }
          },
        },  
      };
        
      return (
        <React.Fragment>
        <Chart options={state2.options} series={state2.series} type="line" width={600} height={350} />
        <Chart options={state.options} series={state.series} type="bar" width={600} height={320} />
        </React.Fragment>
      )
      
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