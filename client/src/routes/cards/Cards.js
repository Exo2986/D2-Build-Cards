import { Stack, Container, Row, Col, Button, Form, Modal } from "react-bootstrap"
import './Cards.css'
import Loading from '../../common/Loading.js'
import axios from 'axios'
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation } from 'react-router-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as htmlToImage from 'html-to-image';
import FileSaver, { saveAs } from "file-saver"
import useFitText from "use-fit-text"
import Bugsnag from '@bugsnag/js'

function ModIcon(props) {
    return (
        <img src={props.icon_url} className='mod-icon'/>
    )
}

function WeaponPerkIcon(props) {
    return (
        <img src={props.icon_url} className='weapon-perk-icon'/>
    )
}

function ItemIcon(props) {
    return (
        <img src={props.icon_url} className='item-icon'></img>
    )
}

function CharacterStat(props) {
    return (
        <Stack direction='horizontal' gap={1} className='stat-stack'>
            <p className='stat-number'>{props.stat.value}</p>
            <img src={props.stat.icon} className='stat-icon'/>
        </Stack>
    )
}
 
function CharacterStats(props) {
    return (
        <Stack gap={1} id='card-stats'>
            <CharacterStat stat={props.stats.Mobility}/>
            <CharacterStat stat={props.stats.Resilience}/>
            <CharacterStat stat={props.stats.Recovery}/>
            <CharacterStat stat={props.stats.Discipline}/>
            <CharacterStat stat={props.stats.Intellect}/>
            <CharacterStat stat={props.stats.Strength}/>
        </Stack>
    )
}

function ArmorItem(props) {
    return (
        <Stack direction='horizontal' gap={1} className='armor-item translucent-background'>
            <ItemIcon icon_url={props.item.icon}/>
            <Stack gap={0}>
                <p className='item-name'>{props.item.displayName}</p>
                <Stack direction='horizontal' gap={1} className='mod-icon-stack'>
                    {props.item.mods.map(mod => <ModIcon icon_url={mod.icon}/>)}
                </Stack>
            </Stack>
            <Stack className='item-mods'>
                {props.item.mods.slice(1).map(mod => <p className='text-truncate'>{mod.displayName}</p>)}    
            </Stack>
        </Stack>
    )
}

function WeaponItem(props) {
    return (
        <Stack direction='horizontal' gap={1} className='weapon-item translucent-background'>
            <ItemIcon icon_url={props.item.icon}/>
            <Stack gap={0}>
                <p className='item-name text-truncate'>{props.item.displayName}</p>
                <Stack direction='horizontal' gap={1} className='perk-icon-stack'>
                    {props.item.perks.map(perk => <WeaponPerkIcon icon_url={perk.icon}/>)}
                </Stack>
            </Stack>
        </Stack>
    )
}

function SubclassIcon(props) {
    return (
        <img src={props.icon_url} className='subclass-icon'/>
    )
}

function AbilityIcon(props) {
    return (
        <img src={props.icon_url} className='ability-icon'/>
    )
}

function lastWord(str) {
    return str.split(' ').pop()
}

function AspectIcon(props) {
    return (
        <img src={props.icon_url} className='aspect-icon'/>
    )
}

function FragmentIcon(props) {
    return (
        <Stack gap={1}  className='fragment-icon'>
            <img src={props.icon_url}/>
            <p className='text-truncate'>{props.name}</p>
        </Stack>
    )
}

function Subclass(props) {
    return (
        <Stack direction='horizontal' gap={1} id='card-subclass' className='translucent-background'>
            <SubclassIcon icon_url={props.subclass.abilities.super.icon}/>
            <Stack direction='vertical' gap={1} id='aspect-fragment-stack'>
                <Stack direction='horizontal' gap={1} id='aspects-stack'>
                    <AbilityIcon icon_url={props.subclass.abilities.class_ability.icon}/>
                    <AbilityIcon icon_url={props.subclass.abilities.jump.icon}/>
                    <AbilityIcon icon_url={props.subclass.abilities.melee.icon}/>
                    <AbilityIcon icon_url={props.subclass.abilities.grenade.icon}/>
                    {props.subclass.aspects.map(aspect => <AspectIcon icon_url={aspect.icon}/>)}
                </Stack>
                <Stack direction='horizontal' gap={1} id='fragments-stack'>
                    {props.subclass.fragments.map(fragment => {
                        if (fragment.isEnabled && fragment.isVisible) {
                            return (<FragmentIcon icon_url={fragment.icon} name={lastWord(fragment.displayName)}/>)
                        }
                    })}
                </Stack>
            </Stack>
        </Stack>
    )
}

function CardHeader(props) {
    const titleFitText = useFitText({maxFontSize:1500})
    const titleFontSize = titleFitText.fontSize
    const authorFitText = useFitText({maxFontSize:1000})
    const authorFontSize = authorFitText.fontSize

    return (
        <Stack direction='horizontal' gap={1} id='card-header' className='translucent-background'>
            <p id='card-title' style={{fontSize: titleFontSize}} ref={titleFitText.ref}>{props.title}</p>
            <p id='card-author' style={{fontSize: authorFontSize}} ref={authorFitText.ref}>by {props.author}</p>
            <p id='card-credit'>d2buildcards.com</p>
        </Stack>
    )
}

function CardBody(props) {
    return (
        <Stack direction='horizontal' id='card-body'>
            <div id='card-armor'>
                {props.character.armor.map(item => <ArmorItem item={item}/>)}
            </div>
            <Stack direction='vertical' id='card-body-vertical'>
                <Stack direction='horizontal' id='card-body-weapons-stats'>
                    <div id='card-weapons'>
                        {props.character.weapons.map(item => <WeaponItem item={item}/>)}
                    </div>
                    <CharacterStats stats={props.character.stats}/>
                </Stack>
                <Subclass subclass={props.character.subclass}/>
            </Stack>
        </Stack>
    )
}

function DownloadImageModal({ show, handleClose, imageURL, downloadName, isFileSaverSupported }) {
    if (imageURL == null) {
        return (
            <Modal show={show} onHide={handleClose} size='lg' centered>
                <Modal.Header closeButton>
                    <Modal.Title>Loading build card</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='loading'>
                        <Loading/>
                    </div>
                </Modal.Body>
            </Modal>
        )
    } else if (!isFileSaverSupported) {
        return(
            <Modal show={show} onHide={handleClose} size='lg' centered>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>File saving is not supported on this browser.</p>
                </Modal.Body>
            </Modal>
        )
    } else {
        return(
            <Modal show={show} onHide={handleClose} size='lg' centered>
                <Modal.Header closeButton>
                    <Modal.Title>Download build card</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <img src={imageURL} className='download-image'></img>
                    <hr/>
                    <p>Your image should be downloading. If not, click <a href={imageURL} download={downloadName}>here</a>.</p>
                </Modal.Body>
            </Modal>
        )
    }
}

function SaveAsModal(props) {
    const resolutionRef = useRef()
    const fileTypeRef = useRef()

    const saveFuncMap = {
        'png': htmlToImage.toPng,
        'jpg': htmlToImage.toJpeg
    }

    const resolutionMap = {
        '4k': {
            width: 3840,
            height: 2160
        },
        '1440p': {
            width: 2560,
            height: 1440
        },
        '1080p': {
            width: 1920,
            height: 1080
        },
        '720p': {
            width: 1280,
            height: 720
        },
        '360p': {
            width: 640,
            height: 360
        }
    }

    const saveAsImage = () => {
        try {
            var isFileSaverSupported = !!new Blob
        } catch (e) {
            props.setIsFileSaverSupported(false)
        }

        props.setImageDownloadURL(null)
        props.handleClose()
        props.setShowDownloadModal(true)

        const fileType = fileTypeRef.current.value
        const resolution = resolutionMap[resolutionRef.current.value]

        const saveFunc = saveFuncMap[fileType]

        saveFunc(props.cardParent.current, {cacheBust:true, canvasWidth: resolution.width, canvasHeight: resolution.height, pixelRatio: 1})
        .then(dataUrl => {  
            props.setImageDownloadURL(dataUrl)
            
            var fileName = props.cardTitle.toLowerCase().replaceAll(' ', '-')
            fileName = fileName.replace(/[^a-zA-Z0-9\-_]/g, '') //only allow alphanumeric characters mostly
            fileName += '.' + fileType

            props.setDownloadName(fileName)

            FileSaver.saveAs(dataUrl, fileName)
        })
        .catch(err => {
            console.log(err)
            Bugsnag.notify(err)
        }) 
    }

    return(
        <Modal show={props.show} onHide={props.handleClose} size='lg' centered>
            <Modal.Header closeButton>
                <Modal.Title>Save as...</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className='mb-3' controlId='formFileType'>
                        <Form.Label>File type</Form.Label>
                        <Form.Select aria-label='Select a file type' ref={fileTypeRef}>
                            <option value='png' selected>.png</option>
                            <option value='jpg'>.jpg</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className='mb-3' controlId='formResolution'>
                        <Form.Label>Resolution</Form.Label>
                        <Form.Select aria-label='Select a resolution' ref={resolutionRef}>
                            {Object.keys(resolutionMap).map((key) => <option value={key} selected={key == '1080p'}>{key}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Button variant='primary' onClick={saveAsImage}>
                        Save
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    )
}

function SettingsBox(props) {
    return (
        <div id='settings-box' className='col-10 col-lg-6 col-centered'>
            <Button onClick={() => {props.setShowSaveAsModal(true)}}>Save as...</Button>
            <Form.Group>
                <Form.Label>Build Name</Form.Label>
                <Form.Control value={props.cardTitle} onChange={(e) => props.setCardTitle(e.target.value)}></Form.Control>
            </Form.Group>
            <Form.Group>
                <Form.Label>Author</Form.Label>
                <Form.Control value={props.cardAuthor} onChange={(e) => props.setCardAuthor(e.target.value)}></Form.Control>
            </Form.Group>
        </div>
    )
}

function Cards() {

    const cardColumn = useRef(null)

    const [cardColumnWidth, setCardColumnWidth] = useState(0);
    const [cardTitle, setCardTitle] = useState('My Build');
    const [cardAuthor, setCardAuthor] = useState('Example');
    const [character, setCharacter] = useState(false)
    const [showDownloadModal, setShowDownloadModal] = useState(false)
    const [showSaveAsModal, setShowSaveAsModal] = useState(false)
    const [imageDownloadURL, setImageDownloadURL] = useState()
    const [downloadName, setDownloadName] = useState()
    const [isFileSaverSupported, setIsFileSaverSupported] = useState(true)

    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const bugsnagErrorMetadata = (event) => {
        event.addMetadata('character', character)
    }

    useLayoutEffect(() => {
        if (character) {
            setCardColumnWidth(cardColumn.current.clientWidth)

            function handleWindowResize() {
                setCardColumnWidth(cardColumn.current.clientWidth)
            }

            window.addEventListener('resize', handleWindowResize);

            return () => {
                window.removeEventListener('resize', handleWindowResize);
            };
        }
    }, [character]);

    const getCharacterInfo = () => {
        if (character) return

        axios.get(`/cards?character=${searchParams.get('character')}`)
        .then(res => {
            console.log(res)
            if (res.data.refresh) {
                navigate(0)
            } else if ('authenticated' in res.data) {
                navigate('../../auth')
            } else {
                if (res.data.character){
                    setCharacter(res.data.character)
                }
            }
        })
        .catch(err => {
            console.log(err)
            Bugsnag.notify(err)
        })
    }

    const cardParent = useRef(null)

    const updateCardTitle = (event) => {
        setCardTitle(event.target.value)
    }

    const updateCardAuthor = (event) => {
        setCardAuthor(event.target.value)
    }

    useEffect(() => {
        getCharacterInfo()

        //append character info to bugsnag report
        Bugsnag.addOnError(bugsnagErrorMetadata)
        return () => { //run on unmount
            Bugsnag.removeOnError(bugsnagErrorMetadata)
        }
    }, []) //run on mount

    if(character) {
        return (
            <>
                <Container fluid id='main'>
                    <Row className='w-100 mt-5 mb-3'>
                        <SettingsBox {...{cardTitle, setCardTitle, cardAuthor, setCardAuthor, setShowSaveAsModal }}
                        />
                    </Row>
                    <Row className='w-100 p-0'>
                        <Col className='col-lg-6 col-10 col-centered p-0' ref={cardColumn}>
                            <div id='card-scalar' style={{'transform': `scale(${cardColumnWidth/3840})`}}>
                                <div id='card-parent' style={{backgroundImage: `url(\'${character.subclass.screenshot}\')`}} ref={cardParent}>
                                    <CardHeader author={cardAuthor} title={cardTitle}/>
                                    <CardBody character={character}/>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
                <DownloadImageModal 
                    show={showDownloadModal} 
                    handleClose={() => setShowDownloadModal(false)} 
                    imageURL={imageDownloadURL} 
                    downloadName={downloadName}
                    isFileSaverSupported={isFileSaverSupported}
                />
                <SaveAsModal
                    show={showSaveAsModal}
                    handleClose={() => setShowSaveAsModal(false)}
                    {...{ setImageDownloadURL, setShowDownloadModal, setDownloadName, setIsFileSaverSupported, cardParent, cardTitle }}
                />
            </>
        )
    } else {
        return (    
                <div className='d-flex align-items-center justify-content-center' id='main'>
                    <Loading/>
                </div>
            )
    }
}

export default Cards