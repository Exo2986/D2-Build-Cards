import React, { Component } from 'react'
import Main from './Main.js'
import './App.css'
import axios from 'axios'
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

import { createTheme, ThemeProvider } from '@mui/material/styles';

const env = 'dev'
const version = '0.9.2'

if (env == 'production')
    axios.defaults.baseURL = 'https://d2buildcards.com/api'
else
    axios.defaults.baseURL = 'https://localhost:8001/api'

Sentry.init({
    dsn: "https://d62b76f709b441db985aa991c3a3ff3b@o1384900.ingest.sentry.io/6703838",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.1,
    release: `d2-build-cards-client@${version}(${env})`
});

console.log(`d2-build-cards-client@${version}(${env})`)

const theme = createTheme({
    palette: {
        mode: 'dark'
    }
})

class App extends Component {
    render() {
        return (
            <div className='app'>
                <ThemeProvider theme={theme}>
                    <Main />
                </ThemeProvider>
            </div>
        )
    }
}

export default App