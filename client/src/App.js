import React, { Component } from 'react'
import Main from './Main.js'
import './App.css'
import axios from 'axios'
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

var env = 'dev'

if (env == 'production')
    axios.defaults.baseURL = 'https://d2buildcards.com/api'
else
    axios.defaults.baseURL = 'https://localhost:8001/api'

Sentry.init({
    dsn: "https://d62b76f709b441db985aa991c3a3ff3b@o1384900.ingest.sentry.io/6703838",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.1,
});

class App extends Component {
    render() {
        return (
            <div className='app'>
                <Main />
            </div>
        )
    }
}

export default App