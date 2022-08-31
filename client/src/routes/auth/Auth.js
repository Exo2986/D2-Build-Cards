import { Container, Row, Col, Carousel } from 'react-bootstrap'
import React, { Component } from 'react'
import './Auth.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as Sentry from "@sentry/react"
import axios from 'axios'
import arcImg from './arc.png'
import solarImg from './solar.jpg'
import stasisImg from './stasis.png'
import voidImg from './void.png'
import bannerImg from './banner.png'

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
        <Container fluid>
            <Row>
                <Col xs='8' md='6' className='col-centered'>
                    <img
                        className='d-block w-100'
                        src={bannerImg}
                        alt='d2buildcards.com'
                    />
                </Col>
            </Row>
            <Row>
                <Col xs='10' md='8' className='col-centered'>
                    <h2>Create and share stylish cards for your favorite Destiny 2 builds.</h2>
                </Col>
            </Row>
            <Row>
                <Col xs='7' md='5' className='col-centered'>
                    <Carousel>
                        <Carousel.Item>
                            <img 
                                className='d-block w-100'
                                src={voidImg}
                                alt='Void Build Card'
                            />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                className='d-block w-100'
                                src={solarImg}
                                alt='Solar Build Card'
                            />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                className='d-block w-100'
                                src={arcImg}
                                alt='Arc Build Card'
                            />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                className='d-block w-100'
                                src={stasisImg}
                                alt='Stasis Build Card'
                            />
                        </Carousel.Item>
                    </Carousel>
                </Col>
            </Row>
            <Row>
                <Col xs='3' md='2' className='col-centered'>
                    <form className='d-flex align-items-center justify-content-center w-100'>
                        <input type='button' value='Get Started' className='btn-auth' onClick={submitForAuth}/>
                    </form>
                </Col>
            </Row>
        </Container>
    )
}

export default Auth