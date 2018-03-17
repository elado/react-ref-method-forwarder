/**
 * @class ExampleComponent
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

const CONTEXT_TYPES = {
  subscribeToForwardMethods: PropTypes.func.isRequired,
}

export const forwardMethodsOuter = ({ methods }) => WrappedComponent => {
  class WithForwardedMethodsOuter extends React.Component {
    callbacksByMethod = {}

    static childContextTypes = CONTEXT_TYPES

    getChildContext() {
      return {
        subscribeToForwardMethods: this.subscribe,
      }
    }

    subscribe = innerRef => {
      methods.forEach(method => {
        this.callbacksByMethod[method] = (...args) => {
          return innerRef[method](...args)
        }
      })
      return () => {
        this.callbacksByMethod = {}
      }
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }

  methods.forEach(method => {
    WithForwardedMethodsOuter.prototype[method] = function(...args) {
      return this.callbacksByMethod[method](...args)
    }
  })

  return WithForwardedMethodsOuter
}

export const forwardMethodsInner = () => WrappedComponent => {
  class WithForwardedMethodsInner extends React.Component {
    static contextTypes = CONTEXT_TYPES

    componentDidMount() {
      this.unsubscribe = this.context.subscribeToForwardMethods(this.ref)
    }

    componentWillUnmount() {
      this.unsubscribe()
    }

    render() {
      return <WrappedComponent ref={ref => (this.ref = ref)} {...this.props} />
    }
  }

  return WithForwardedMethodsInner
}
