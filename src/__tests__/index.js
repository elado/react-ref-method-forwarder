import React, { Component } from 'react';
import { mount } from 'enzyme';

import { forwardMethodsOuter, forwardMethodsInner } from '../';

describe('forwardMethodsOuter/forwardMethodsInner', () => {
  let Input;
  let methodSpy;
  let wrapper;
  const opts = { methods: ['focus', 'getValue', 'calcSomething', 'accessProps'] };

  beforeEach(() => {
    methodSpy = jest.fn();

    Input = class extends Component {
      focus() {
        methodSpy('focus');
        this.input.focus();
      }

      getValue() {
        methodSpy('getValue');
        return this.input.value;
      }

      calcSomething(a, b) {
        methodSpy('calcSomething', a, b);
        return a + b;
      }

      accessProps(a, b) {
        methodSpy('accessProps', a, b);
        return this.props.someProp;
      }

      render() {
        return <input ref={i => (this.input = i)} />;
      }
    };
  });

  describe('calling methods', () => {
    let InnerWrappedInput;
    let OuterWrappedInput;

    beforeEach(() => {
      InnerWrappedInput = forwardMethodsInner()(Input);
      OuterWrappedInput = forwardMethodsOuter(opts)(InnerWrappedInput);

      wrapper = mount(<OuterWrappedInput />);
    });

    it("calls inner Input's focus when calling outer ref's focus", () => {
      wrapper.instance().focus();
      expect(methodSpy).toHaveBeenCalledWith('focus');
    });

    it('passes arguments to called methods', () => {
      wrapper.instance().calcSomething(4, 2);
      expect(methodSpy).toHaveBeenCalledWith('calcSomething', 4, 2);
    });

    it('returns value from methods', () => {
      const result = wrapper.instance().calcSomething(4, 2);
      expect(result).toEqual(6);
    });

    it('can access props passed to wrapper', () => {
      wrapper.setProps({ someProp: 'foo' });
      const result = wrapper.instance().accessProps();
      expect(result).toEqual('foo');
    });
  });

  describe('multiple HOCs between outer and inner', () => {
    let someHoc1;
    let someHoc2;
    let InnerWrappedInput;
    let OuterWrappedInput;

    beforeEach(() => {
      // assume we don't have control over these HOCs, so we can't forward refs
      someHoc1 = WrappedComponent => props => <WrappedComponent {...props} />;
      someHoc2 = WrappedComponent =>
        class Wrapper extends Component {
          render() {
            return <WrappedComponent {...this.props} />;
          }
        };

      InnerWrappedInput = forwardMethodsInner()(Input);
      const InnerWrappedInputWrappedWithHocs = someHoc1(someHoc2(InnerWrappedInput));
      OuterWrappedInput = forwardMethodsOuter(opts)(InnerWrappedInput);

      wrapper = mount(<OuterWrappedInput />);
    });

    it("calls deeply inner Input's focus when calling outer ref's focus", () => {
      wrapper.instance().focus();
      expect(methodSpy).toHaveBeenCalledWith('focus');
    });
  });
});
