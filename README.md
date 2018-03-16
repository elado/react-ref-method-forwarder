# react-ref-method-forwarder

> Allows method accessing through refs for components that are wrapped with HOCs

[![NPM](https://img.shields.io/npm/v/react-ref-method-forwarder.svg)](https://www.npmjs.com/package/react-ref-method-forwarder) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-ref-method-forwarder
```

## Usage

```jsx
import React, { Component } from 'react'

import MyComponent from 'react-ref-method-forwarder'

class Example extends Component {
  render () {
    return (
      <MyComponent />
    )
  }
}
```

## License

MIT © [elado](https://github.com/elado)
