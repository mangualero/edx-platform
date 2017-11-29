import React from 'react';
import ReactDOM from 'react-dom';

import entryPoints from '../../../../entryPoints';
console.log(entryPoints);

export class ReactRenderer {
  constructor(component, selector, props) {
    // ComponentToRender = import(path);
    this.targetElement = this.getTargetElement(selector);
    this.props = props;
    // console.log(entryPoints[component]);
    const entryPoints = {
      HelloWorld: './common/static/js/src/HelloWorld.jsx'
    };
    import(/* webpackMode: "lazy-once" */ `../../../.${entryPoints[component]}`)
      .then(ComponentToImport => {
        console.log('foofoo');
        console.log(ComponentToImport);
      });
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
      <MyComponent
        {...this.props}
      />,
      this.targetElement,
    );
  }
}
