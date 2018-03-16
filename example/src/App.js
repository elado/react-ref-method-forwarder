import React, { Component } from 'react'

import ExampleComponent from 'react-ref-method-forwarder'

export default class App extends Component {
  render () {
    return (
      <div>
        <ExampleComponent text='Modern React component module' />
      </div>
    )
  }
}
