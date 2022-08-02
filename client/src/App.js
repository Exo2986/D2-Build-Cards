import React, { Component } from 'react'
import Main from './Main.js'
import './App.css'
import axios from 'axios'

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