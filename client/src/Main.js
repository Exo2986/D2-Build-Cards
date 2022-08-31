import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './routes/auth/Auth.js'
import Characters from './routes/cards/Characters.js'
import React from 'react'
import Callback from './routes/auth/Callback.js'
import Cards from './routes/cards/Cards.js'
import IsAuthenticated from './common/IsAuthenticated.js'
import * as Sentry from "@sentry/react"

class Main extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidCatch(error, errorInfo) {
        console.log(error)
        Sentry.captureException(error + " " + errorInfo)
    }

    render() {
        return (
            <Routes>
                <Route path='auth' element={<Auth/>}/>
                <Route path='auth/callback' element={<Callback/>}/>
                <Route path='cards/' element={<Characters/>}/>
                <Route path='cards/card' element={<Cards/>}/>
                <Route path='' element={<IsAuthenticated ifTrue={<Navigate to='cards'/>} ifFalse={<Navigate to='auth'/>}/>}/>
            </Routes>
        )
    }
}

export default Main