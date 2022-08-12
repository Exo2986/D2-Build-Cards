import React, { useEffect, useState } from 'react'
import { Stack, Button } from 'react-bootstrap'
import Loading from '../../common/Loading.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Characters.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function CharacterButton(props) {
    return (
        <div className='character-button'>
            <Link to={`/cards/card?character=${props.character.id}`} className='character-link'>
                <img src={props.character.emblemBackground}/>
                <p>{props.character.class.toUpperCase()}</p>
            </Link>
        </div>
    )
}

function Characters() {
    const navigate = useNavigate()
    const [chars, setChars] = useState()

    useEffect(() => {
        axios.get('/cards/characters')
        .then((res) => {
            if (res.data.refresh) {
                navigate(0)
            } else if ('authenticated' in res.data) {
                navigate('../../auth')
            }  else {
                console.log(res.data)
                setChars(res.data)
            }
        })
        .catch((err) => {
            console.log(err)
        })
    }, [])

    if (chars != null) {
        return (
            <Stack direction='vertical' gap={4} className='d-flex min-vh-100 justify-content-center align-items-center'>
                {chars.map((char) => <CharacterButton character={char}/>)}
            </Stack>
        )
    } else {
        return(
            <div className='d-flex align-items-center justify-content-center min-vh-100 min-vw-100'>
                <Loading/>
            </div>
        )
    }
}

export default Characters