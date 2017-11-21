import React from 'react';
import ReactDOM from 'react-dom';

export class ReactRenderer {
  constructor(component, selector, props) {
    const path = component;
    // ComponentToRender = import(path);
    this.elementList = document.querySelector(selector);
    this.props = props;
    import(/* webpackChunkName: "dynamicBundle" */ path)
      .then(ComponentToImport => {
        console.log(ComponentToImport);
        this.renderComponent();
      });
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
