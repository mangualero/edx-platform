import React from 'react';
import ReactDOM from 'react-dom';

class ReactRendererException extends Error {
  constructor (...args) {
    super(...args);
    this.name = 'ReactRendererException';
    Error.captureStackTrace(this, ReactRendererException);
  }
  toString() {
    return `${this.name}: ${this.message}`;
  }
}

export class ReactRenderer {
  constructor({component, selector, componentName, props={}}) {
    Object.assign(this, {
      component,
      selector,
      componentName,
      props,
    });
    this.handleModuleErrors();
    this.targetElement = this.getTargetElement(selector);
    this.renderComponent();

  }

  handleModuleErrors() {
    if (this.component === null) {
      throw new ReactRendererException(
        `Component ${this.componentName} is not defined. Make sure you're
        using a non-default export statement for the ${this.componentName}
        class, that ${this.componentName} has an entry point defined
        within the 'entry' section of webpack.common.config.js, and that the
        entry point is pointing at the correct file path.`
      );
    }
  }

  getTargetElement(selector) {
    const elementList = document.querySelectorAll(selector);
    if (elementList.length !== 1) {
      throw new ReactRendererException(
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
