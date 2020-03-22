// import react panel
import DisciplinePanel from './DisciplinePanel/DisciplinePanel';

// import styles
import './DisciplineExtension.css';

class DisciplineExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  load() {
    console.log('DisciplineExtension has been loaded');
    return true;
  }

  unload() {
    // remove toolbar group and buttons
    if (this._group) {
      this._group.removeControl(this._button);
      if (this._group.getNumberOfControls() === 0) {
        this.viewer.toolbar.removeControl(this._group);
      }
    }

    // hide and clean up panel
    if (this._panel) {
      this._panel.setVisible(false);
      this._panel = null;
    }

    console.log('DisciplineExtension has been unloaded');
    return true;
  }

  onToolbarCreated() {
    // create a new toolbar group if it doesn't exist
    this._group = this.viewer.toolbar.getControl('ExtensionsToolbar');
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup('ExtensionsToolbar');
      this._group.addClass('extension-toolbar'); // add css class from ExtensionToolbar.css
      this.viewer.toolbar.addControl(this._group);
    }

    // add a new button to the toolbar group
    this._button = new Autodesk.Viewing.UI.Button('DisciplineExtensionButton');
    this._button.onClick = event => {
      // create panel if it doesn't exist
      if (this._panel == null)
        this._panel = new DisciplinePanel(this.viewer, {id: 'react-panel', title: 'Discipline 1',
                                                          discipline_id: 'disc_1'});
      // show/hide panel
      this._panel.setVisible(!this._panel.isVisible());

      // If panel is NOT visible, exit the function
      if (!this._panel.isVisible())
        return;
    };
    this._button.setToolTip('Discipline Extension');
    this._button.addClass('discipline-extension-btn'); 
    this._group.addControl(this._button);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('DisciplineExtension', DisciplineExtension);