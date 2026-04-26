import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  componentDidCatch(error) {
    console.error('Frontend runtime error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
          <h1>Frontend Runtime Error</h1>
          <p>{this.state.message}</p>
          <p>Open browser DevTools Console for full stack trace.</p>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
