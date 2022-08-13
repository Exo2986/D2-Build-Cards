import React, { Component } from 'react'
import Main from './Main.js'
import './App.css'
import axios from 'axios'
import log from 'loglevel'
import remote from 'loglevel-plugin-remote'

var env = 'dev'

if (env == 'production')
    axios.defaults.baseURL = 'https://d2buildcards.com/api'
else
    axios.defaults.baseURL = 'https://localhost:8001/api'


remote.apply(log, { format: remote.json, url:axios.defaults.baseURL + '/logger' })

log.enableAll()

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