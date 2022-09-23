import React, { useEffect, useState } from 'react'
import Loading from '../../common/Loading.js'
import './Characters.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import * as Sentry from "@sentry/react"
import { Box, CircularProgress, Stack } from '@mui/material'
import ImagesLoading from '../../common/ImagesLoading.js'

function CharacterButton(props) {
    if (props.character == null) return

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
    const [imagesLoaded, setImagesLoaded] = useState(0)

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

    var charBanners = <></>

    if (chars != null) {
        var sx = {display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', minWidth:'100vw'}

        charBanners = 
            <Stack gap={4} sx={sx}>
                {chars.map((char) => <CharacterButton character={char}/>)}
            </Stack>
    }

    return(
        
        <ImagesLoading imagesAreLoading={chars != null} imagesLoaded={imagesLoaded} setImagesLoaded={setImagesLoaded}>
            {charBanners}
        </ImagesLoading>
    )
}

export default Characters