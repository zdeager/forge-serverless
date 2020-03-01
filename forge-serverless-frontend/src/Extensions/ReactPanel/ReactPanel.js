// React stuff
import React from 'react';
import ReactDOM from 'react-dom';

// panel styles
import './ReactPanel.css';

class ReactPanel extends Autodesk.Viewing.UI.DockingPanel {
  constructor (viewer, options) {
    super(viewer.container, options.id, options.title, options);

    // create element to hold react content
    this.DOMContent = document.createElement('div');
    this.DOMContent.className = 'content';
    this.container.classList.add('react-docking-panel'); // add css class from ReactPanel.css
    // add element to panel
    this.container.appendChild(this.DOMContent);
  }

  setVisible (show) {
    super.setVisible(show)

    if (show) { // show -> render react content
      this.reactNode = ReactDOM.render(
        <ReactPanelContent />, this.DOMContent);
    } else if (this.reactNode) { // hide -> destroy react content
      ReactDOM.unmountComponentAtNode(this.DOMContent);
      this.reactNode = null;
    }
  }
}

// Panel content (React)
function ReactPanelContent(props){
  return (
    <div className='react-content'>
      This is React...
    </div>
  );
}

export default ReactPanel;