import { Routes, Route } from 'react-router-dom'
import Auth from './routes/auth/Auth.js'
import Characters from './routes/cards/Characters.js'
import React, { Component } from 'react'
import Callback from './routes/auth/Callback.js'
import Cards from './routes/cards/Cards.js'

function Main() {
    return (
        <Routes>
            <Route path='auth' element={<Auth/>}/>
            <Route path='auth/callback' element={<Callback/>}/>
            <Route path='cards/' element={<Characters/>}/>
            <Route path='cards/card' element={<Cards/>}/>
        </Routes>
    )
}

export default Main