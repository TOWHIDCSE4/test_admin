import ReactDOM from 'react-dom'
import 'grapesjs/dist/css/grapes.min.css'
import 'antd/dist/antd.css'
import './index.css'
import './composeAssets'
import App from 'pages'
import ErrorBoundary from 'core/Atoms/ErrorBoundary'
import reportWebVitals from './reportWebVitals'

ReactDOM.render(
    <>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </>,
    document.getElementById('dashboard-container')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
