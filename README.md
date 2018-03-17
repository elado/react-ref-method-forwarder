# react-ref-method-forwarder

> Allows accessing methods of HOC-wrapped components through normal React `ref`s

[![NPM](https://img.shields.io/npm/v/react-ref-method-forwarder.svg)](https://www.npmjs.com/package/react-ref-method-forwarder) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-ref-method-forwarder
```
## The Problem

HTML elements and React components can have methods. `<input>` has `focus()`, overflown elements have `scrollTo` etc.
We can use `ref`s to grab the instance and call the method:

```jsx
class Field extends Component {
  focusInput() {
    this.input.focus()
  }

  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <input ref={i => (this.input = i)} />
      </div>
    )
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <Field label="Name" ref={i => (this.field = i)} />
        <button onClick={() => this.field.focusInput()}>Focus</button>
      </div>
    )
  }
}
```

There's a problem when wrapping components with HOCs, as the `ref` will now point the HOC's instance:

```jsx
class Field extends Component {
  focusInput() {
    this.input.focus()
  }

  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <input ref={i => (this.input = i)} />
      </div>
    )
  }
}

// this can be any HOC
const myHOC = WrappedComponent =>
  class Wrapper extends Component {
    render() {
      return <WrappedComponent {...this.props} />
    }
  }

const WrappedField = myHOC(Field)

class App extends Component {
  render() {
    return (
      <div>
        <WrappedField ref={i => (this.field = i)} />
        {/* this will fail */}
        <button onClick={() => this.field.focusInput()}>Focus</button>
      </div>
    )
  }
}
```

Clicking the button will throw an error, because `WrappedField`, is an instance of `Wrapper`, which does not expose `focusInput`.

React doesn't allow `ref` forwarding. When the `Wrapper` spreads the `this.props`, the original `ref` function that was passed in the `App` `render` method will not be forwarded to `WrappedComponent`.

If `myHOC` is under our control, we could add some ref forwarding mechanism:

```jsx
const myHOC = WrappedComponent =>
  class Wrapper extends Component {
    render() {
      const { innerRef, ...props } = this.props
      return <WrappedComponent ref={innerRef} {...props} />
    }
  }
```

and use it with

```jsx
<WrappedField innerRef={i => (this.field = i)} />
```

This is a bit tedious, and in case `myHOC` comes from a library that cannot be modified - this solution won't work.

If some component is wrapped with multiple HOCs, they all need to talk with the same API.

`react-redux`, for example, provides `withRef` option, and exposes the wrapped component with `getWrappedInstance()`. That may not be the case in other libraries.

So there's a need for a solution that won't require change of 3rd party packages.

## The Solution / Usage

This library provides 2 HOCs: `forwardMethodsInner` and `forwardMethodsOuter`. The `forwardMethodsInner` HOC wraps the component with the methods, and the `forwardMethodsOuter` wraps the top level component. All specified methods are exposed on the result of the outer HOC.

```jsx
// Field.js

// 1st step - a Component with a method
class Field extends Component {
  focusInput() {
    this.input.focus()
  }

  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <input ref={i => (this.input = i)} />
      </div>
    )
  }
}

// 2nd step - wrap it with forwardMethodsInner
const FieldWrappedWithInner = forwardMethodsInner()(Field)

// 3rd step - wrap it with any other HOCs, one or more
const FieldWrappedWithOtherHOCs = myHOC(FieldWrappedWithInner)

// 4th step - wrap FieldWrappedWithOtherHOCs with forwardMethodsOuter
// provide all the methods that need to be hoisted
const FieldWrappedWithOuter = forwardMethodsOuter({ methods: ['focusInput'] })(FieldWrappedWithOtherHOCs)

export default FieldWrappedWithOuter

// App.js

import Field from './Field'

// work with refs as if Field was never wrapped!
// focusInput is hoisted automatically

class App extends Component {
  render() {
    return (
      <div>
        <Field label="Name" ref={i => (this.field = i)} />
        <button onClick={() => this.field.focusInput()}>Focus</button>
      </div>
    )
  }
}
```

## License

MIT © [elado](https://github.com/elado)
