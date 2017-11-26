// @flow
import React from 'react'

export default class Shut extends React.Component {
  constructor(props) {
    super(props)

    this.state = { x: props.rash ? 0 : innerWidth }

    this.rootAttr = {
      onTouchStart: this.touchStart.bind(this),
      onTouchMove: this.touchMove.bind(this),
      onTouchEnd: this.touchEnd.bind(this),
      style: rootStyle
    }

    this.mobileAttr = (() => {
      const onTransitionEnd = this.transitionEnd.bind(this)
      return () => ({
        onTransitionEnd,
        style: mobileStyle(
          this.state.x,
          this.props.mobile.transition,
          this.props.mobile.background
        )
      })
    })()

    this.scrollAttr = () => ({
      children: this.props.children,
      style: scrollStyle(this.state.x)
    })

    this.Quit = (() => {
      if (!props.Quit) {
        return false
      } else {
        const { Quit } = props,
          f = this.quitHandler.bind(this)
        return () => <Quit {...{ f }} />
      }
    })()
  }

  lifecycleHandle(key, props, arg) {
    const { lifecycles } = props
    const lifecycle = typeof lifecycles === 'object' && lifecycles[key]

    if (typeof lifecycle === 'function') {
      arg = arg || []
      lifecycle(...arg)
    }
  }

  componentWillMount() {
    return execLifeCycle('WillMount', this.props)
  }

  componentWillReceiveProps(nextProps) {
    return nextProps.quit
      ? this.quit()
      : execLifeCycle('WillReceiveProps', this.props, [nextProps])
  }

  render() {
    const { rootAttr, mobileAttr, scrollAttr, Quit } = this
    return (
      <div {...rootAttr}>
        <div {...mobileAttr()}>
          <div {...scrollAttr()} />
          {Quit && Quit()}
        </div>
      </div>
    )
  }

  componentDidMount() {
    if (!this.props.rash) {
      setTimeout(() => this.come(), 0)
      const { first } = this.props.callbacks
      if (first) first()
    }
    return execLifeCycle('DidMount', this.props)
  }

  componentDidUpdate(prevProps, prevState) {
    return execLifeCycle('DidUpdate', this.props, [prevProps, prevState])
  }

  componentWillUnmount() {
    return execLifeCycle('WillUnmount', this.props)
  }

  touchStart({ touches }) {
    if (cantStart(touches, this.props.widthRatio)) return false
    this.pre = new Pre(touches[0], { virgin: true })
  }

  touchMove(e) {
    if (!this.pre) return false

    const touch = e.touches[0]
    const { pre, state } = this

    if (pre.virgin) {
      const yDiff = touch.pageY - pre.y
      if (yDiff < -10 || yDiff > 10) {
        this.pre = null
        return false
      }
    }

    const xDiff = touch.pageX - pre.x
    const iai = xDiff < 0 ? 'come' : 'quit'
    const x = state.x + xDiff

    this.pre = new Pre(touch, { iai })

    return x <= 0 ? (state.x !== 0 ? this.come() : false) : this.setState({ x })
  }

  touchEnd(e) {
    const { pre } = this
    if (!pre) return false

    const now = Date.now()

    if (now - pre.now < 26) {
      const iai = this[pre.iai]
      if (typeof iai === 'function') {
        iai.call(this)
      }
    } else {
      const { quit, come } = this
      const qome = this.state.x > innerWidth * 0.6 ? quit : come

      qome.call(this)
    }

    this.pre = null
  }

  quitHandler(e) {
    e.stopPropagation()
    this.quit()
  }

  come() {
    this.setState({ x: 0 })
  }

  quit() {
    this.setState({ x: innerWidth })
  }

  transitionEnd(e) {
    const { target, currentTarget, propertyName } = e

    if (target !== currentTarget || propertyName !== 'transform') {
      return false
    } else {
      const { transform } = target.style
      const { come, quit } = this.props.callbacks

      const callback = transform === 'translateX(0px)' ? come : quit
      if (callback) {
        callback()
      }
    }
  }
}

const cantStart = (touches, widthRatio) => {
  if (touches.length > 1) {
    return true
  } else {
    widthRatio = widthRatio || 0.4
    return touches[0].pageX > innerWidth * widthRatio
  }
}

const Pre = function({ pageX, pageY }, { virgin, iai }) {
  this.x = pageX
  this.y = pageY
  this.now = Date.now()
  this.virgin = virgin
  this.iai = iai
}

const rootStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
}

const TRANSITION = '0.4s'
const BACKGROUND = 'rgb(251, 251, 251)'
const mobileStyle = (x, transition, background) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  transition: (x === 0 || x === innerWidth) && (transition || TRANSITION),
  transform: `translateX(${x}px)`,
  background: background || BACKGROUND
})

const scrollStyle = x => ({
  overflowY: x === 0 ? 'scroll' : 'hidden',
  height: '100%',
  WebkitOverflowScrolling: 'touch',
  overflowScrolling: 'touch'
})
