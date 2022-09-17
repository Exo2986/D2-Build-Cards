import React, { useEffect, useState } from 'react'
import Loading from '../../common/Loading.js'
import './Characters.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import * as Sentry from "@sentry/react"
import { Box, CircularProgress, Stack } from '@mui/material'

function CharacterButton(props) {
    if (props.character == null) return

    return (
        <div className='character-button'>
            <Link to={`/cards/card?character=${props.character.id}`} className='character-link'>
                <img src={props.character.emblemBackground} onLoad={props.counter}/>
                <p>{props.character.class.toUpperCase()}</p>
            </Link>
        </div>
    )
}

function Characters() {
    const navigate = useNavigate()
    const [chars, setChars] = useState()
    const [imagesLoaded, setImagesLoaded] = useState()

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

        if (imagesLoaded < 3) {
            sx.display = 'none'
        }
        charBanners = 
            <Stack gap={4} sx={sx}>
                {chars.map((char) => <CharacterButton character={char} counter={() => setImagesLoaded(imagesLoaded+1)}/>)}
            </Stack>
    }

    const progressDisplay = imagesLoaded >= 3 ? 'none' : 'flex'

    return(
        
        <Box sx={{display:progressDisplay, alignItems:'center', justifyContent:'center', minHeight:'100vh', minWidth:'100vw'}}>
            <CircularProgress/>
            {charBanners}
        </Box>
    )
}

export default Characters