import { Routes, Route } from 'react-router-dom'
import Auth from './routes/auth/Auth.js'
import Characters from './routes/cards/Characters.js'
import React, { Component } from 'react'
import Callback from './routes/auth/callback/Callback.js'

function Main() {
    return (
        <Routes>
            <Route path='auth' element={<Auth/>}/>
            <Route path='auth/callback' element={<Callback/>}/>
            <Route path='cards/' element={<Characters/>}/>
        </Routes>
    )
}

export default Main