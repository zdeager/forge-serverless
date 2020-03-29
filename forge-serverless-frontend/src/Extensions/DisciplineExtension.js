// import react panel
import DisciplinePanel from './DisciplinePanel/DisciplinePanel';

// import styles
import './DisciplineExtension.css';

class DisciplineExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._disciplines = [
      {
        name: "Mechanical",
        groups: ["HVAC", "Heating & Cooling"]
      },
      {
        name: "Electrical",
        groups: ["High & Medium Voltage", "Automatic Transfer System"]
      },
      {
        name: "Fire Protection",
        groups: ["Fire Fighting"]
      },
      {
        name: "Plumbing",
        groups: ["Wastewater", "Domestic Water"]
      },
      {
        name: "Special Airport Systems",
        groups: ["Baggage Handling System", "Baggage Screening",
          "Security Access Control", "Lift Elevator Escalator",
          "Passenger Boarding Bridge"]
      },
      {
        name: "Information Technology",
        groups: ["Information Communication"]
      },
      {
        name: "Architecture",
        groups: []
      },
      {
        name: "Structure",
        groups: []
      }
    ];
    this._buttons = this._disciplines.map(disp => null);
    this._panels = this._buttons.slice();
  }

  load() {
    console.log('DisciplineExtension has been loaded');
    return true;
  }

  unload() {
    // remove toolbar group and buttons
    if (this._group) {
      this._buttons.forEach((button, idx) => {
        this._group.removeControl(this._buttons[idx]);
      });
      if (this._group.getNumberOfControls() === 0) {
        this.viewer.toolbar.removeControl(this._group);
      }
    }

    // hide and clean up panels
    this._panels.forEach((panel, idx) => {
      if (this._panels[idx]) {
        this._panels[idx].setVisible(false);
        this._panels[idx] = null;
      }
    });

    console.log('DisciplineExtension has been unloaded');
    return true;
  }

  onToolbarCreated() {
    // create a new toolbar group if it doesn't exist
    this._group = this.viewer.toolbar.getControl('DisciplinesToolbar');
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup('DisciplinesToolbar');
      this._group.addClass('extension-toolbar'); // add css class from ExtensionToolbar.css
      this.viewer.toolbar.addControl(this._group);
    }

    this._disciplines.forEach((disc, idx) => {
      // add a new button to the toolbar group
      this._buttons[idx] = new Autodesk.Viewing.UI.Button(disc.name + 'ExtensionButton');
      this._buttons[idx].onClick = event => {
        // create panel if it doesn't exist
        if (this._panels[idx] == null)
          this._panels[idx] = new DisciplinePanel(this.viewer, 
            {id: disc.name, title: disc.name, groups: disc.groups}
          );
        // show/hide panel
        this._panels[idx].setVisible(!this._panels[idx].isVisible());

        // If panel is NOT visible, exit the function
        if (!this._panels[idx].isVisible())
          return;
      };
      this._buttons[idx].setToolTip(disc.name);
      this._buttons[idx].addClass('discipline-extension-btn'); 
      this._group.addControl(this._buttons[idx]);
    });
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('DisciplineExtension', DisciplineExtension);