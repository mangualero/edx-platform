import React from 'react';
import ReactDOM from 'react-dom';

import('./HelloWorld')
  .then(ComponentToImport => {
    console.log(ComponentToImport);
  });

export class ReactRenderer {
  constructor(component, selector, props) {
    // ComponentToRender = import(path);
    this.elementList = document.querySelector(selector);
    this.props = props;
    // import(path)
    //   .then(ComponentToImport => {
    //     console.log(ComponentToImport);
    //     // this.renderComponent();
    //   });
    // const path = 'react';
    // import(path)
    //   .then(ComponentToImport => {
    //     console.log(ComponentToImport);
    //   });
  }

  ReactRendererException(message) {
    this.toString = () => {
      return `ReactRendererException: ${message}`;
    }
  }

  renderComponent() {
    ReactDOM.render(
      <MyComponent
        {...this.props}
      />,
      elementList[0],
    );
  }
}
