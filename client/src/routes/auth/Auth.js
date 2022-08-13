import { Container } from 'react-bootstrap'
import React, { Component } from 'react'
import './Auth.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'
import log from 'loglevel'

function Auth() {
    const submitForAuth = () => {
        axios.get('/auth')
        .then((res) => {
            console.log(res)

            window.location.replace(res.data.url)
        })
        .catch((err) => {
            log.error(err)
        })
    }

    return (
        <Container fluid>
            <form className='d-flex align-items-center min-vh-100 justify-content-center'>
                <input type='button' value='Authorize with Bungie.net' className='btn-auth' onClick={submitForAuth}/>
            </form>
        </Container>
    )
}

export default Auth