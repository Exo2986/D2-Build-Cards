import React, { useEffect } from 'react'
import { Stack, Row, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import './Characters.css'

function CharacterButton(props) {
    return (
        <Button variant='outline-secondary' className='min-vh-100 w-25 rounded-0 btn-character'>{props.classType}</Button>
    )
}

function Characters() {
    return (
        <Stack direction='horizontal' className='d-flex min-vh-100 justify-content-center'>
            <CharacterButton classType='Hunter'/>
            <CharacterButton classType='Warlock'/>
            <CharacterButton classType='Titan'/>
        </Stack>
    )
}

export default Characters