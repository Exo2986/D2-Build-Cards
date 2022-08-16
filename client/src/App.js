import React, { Component } from 'react'
import Main from './Main.js'
import './App.css'
import axios from 'axios'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'

var env = 'dev'

if (env == 'production')
    axios.defaults.baseURL = 'https://d2buildcards.com/api'
else
    axios.defaults.baseURL = 'https://localhost:8001/api'

Bugsnag.start({
    apiKey: process.env.BUGSNAG_API_KEY, //not securing the api key is technically okay but im not happy about it
    plugins: [new BugsnagPluginReact()]
})

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)

class App extends Component {
    render() {
        return (
            <ErrorBoundary>
                <div className='app'>
                    <Main />
                </div>
            </ErrorBoundary>
        )
    }
}

export default App