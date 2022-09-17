import React, { Component } from 'react'
import './Auth.css'
import * as Sentry from "@sentry/react"
import axios from 'axios'
import arcImg from './arc.png'
import solarImg from './solar.jpg'
import stasisImg from './stasis.png'
import voidImg from './void.png'
import bannerImg from './banner.png'
import { ImageList, ImageListItem, Grid, Button, Box } from '@mui/material'

function Auth() {
    const submitForAuth = () => {
        axios.get('/auth')
        .then((res) => {
            console.log(res)

            window.location.replace(res.data.url)
        })
        .catch((err) => {
            console.log(err)
            Sentry.captureException(err)
        })
    }

    /**
     * <form className='d-flex align-items-center min-vh-100 justify-content-center'>
            <input type='button' value='Authorize with Bungie.net' className='btn-auth' onClick={submitForAuth}/>
        </form>
     */
    return (
        <Grid>
            <Grid xs='12' sx={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Box
                    component='img'
                    sx={{display:'block', width:{xs:'80%', md:'60%'}}}
                    src={bannerImg}
                    alt='d2buildcards.com'
                />
            </Grid>
            <Grid xs='12' sx={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <h2>Create and share stylish cards for your favorite Destiny 2 builds.</h2>
            </Grid>
            <Grid xs='12' sx={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <ImageList sx={{width:{xs:'80%', md:'70%'}, height:'100%'}}>
                    <ImageListItem key={voidImg}>
                        <img 
                            sx={{display:'block',width:'100%'}}
                            src={voidImg}
                            alt='Void Build Card'
                        />
                    </ImageListItem>
                    <ImageListItem key={solarImg}>
                        <img 
                            sx={{display:'block',width:'100%'}}
                            src={solarImg}
                            alt='Solar Build Card'
                        />
                    </ImageListItem>
                    <ImageListItem key={arcImg}>
                        <img 
                            sx={{display:'block',width:'100%'}}
                            src={arcImg}
                            alt='Arc Build Card'
                        />
                    </ImageListItem>
                    <ImageListItem key={stasisImg}>
                        <img 
                            sx={{display:'block',width:'100%'}}
                            src={stasisImg}
                            alt='Stasis Build Card'
                        />
                    </ImageListItem>
                </ImageList>
            </Grid>
            <Grid xs='12' sx={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Button sx={{width:'20%'}} variant='contained' className='btn-auth' onClick={submitForAuth}>
                    Get Started
                </Button>
            </Grid>
        </Grid>
    )
}

export default Auth