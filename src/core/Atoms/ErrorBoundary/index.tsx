import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert } from 'antd'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

class ErrorBoundary extends Component {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <Alert
                    message='Error'
                    description='Something went wrong'
                    type='error'
                    showIcon
                />
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
