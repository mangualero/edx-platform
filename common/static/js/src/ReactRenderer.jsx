import React from 'react';
import ReactDOM from 'react-dom';

export class ReactRenderer {
  constructor(component, selector, props) {
    this.targetElement = this.getTargetElement(selector);
    this.props = props;
    this.component = component;
    this.renderComponent();
  }

  ReactRendererException(message) {
    this.toString = () => {
      return `ReactRendererException: ${message}`;
    }
  }

  getTargetElement(selector) {
    const elementList = document.querySelectorAll(selector);
    if (elementList.length !== 1) {
      throw new this.ReactRendererException(
        `Expected 1 element match for selector "${selector}" but
        received ${elementList.length} matches.`
      );
    } else {
      return elementList[0];
    }
  }

  renderComponent() {
    ReactDOM.render(
      React.createElement(this.component, this.props, null),
      this.targetElement,
    );
  }
}
