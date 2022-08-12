import React, { Component } from 'react'
import Main from './Main.js'
import './App.css'
import axios from 'axios'

var env = 'production'

if (env == 'production')
    axios.defaults.baseURL = 'https://d2buildcards.com/api'
else
    axios.defaults.baseURL = 'https://localhost:8001/api'

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