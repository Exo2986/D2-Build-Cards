import React from 'react'
import { Stack, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Characters.css'
import { useNavigate } from 'react-router-dom'

function CharacterButton(props) {
    const navigate = useNavigate()
    return (
        <Button variant='outline-secondary' className='min-vh-100 w-25 rounded-0 btn-character' onClick={() => navigate('/cards/card', {
            state: {
                charClass: props.classType
            }
        })}>{props.classType}</Button>
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