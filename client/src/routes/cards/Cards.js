import { Stack, Box, TextField, Button, Grid, Select, MenuItem, InputLabel, Dialog, DialogTitle, DialogContent, DialogContentText, CircularProgress, Typography } from "@mui/material"
import './Cards.css'
import axios from 'axios'
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as htmlToImage from 'html-to-image';
import FileSaver, { saveAs } from "file-saver"
import useFitText from "use-fit-text"
import * as Sentry from "@sentry/react"
import ImagesLoading from "../../common/ImagesLoading"
import AlertSnackbar from "../../common/AlertSnackbar"
import masterworkImg from "./masterwork.png"
import exoticMasterworkImg from './exotic-masterwork.png'

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
        <div className='item-icon-div'>
            <img src={props.icon_url} className='item-icon'/>
            {props.masterwork ? <img src={props.tierType == 'Exotic' ? exoticMasterworkImg : masterworkImg} className='masterwork'/> : <></>}
        </div>
    )
}

function CharacterStat(props) {
    return (
        <Stack direction='row' spacing={1} className='stat-stack'>
            <p className='stat-number'>{props.stat.value}</p>
            <img src={props.stat.icon} className='stat-icon'/>
        </Stack>
    )
}
 
function CharacterStats(props) {
    return (
        <Stack spacing={1} id='card-stats'>
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
        <Stack direction='row' spacing={1} className='armor-item translucent-background'>
            <ItemIcon icon_url={props.item.icon} masterwork={props.item.masterwork == 1} tierType={props.item.tierType}/>
            <Stack spacing={0}>
                <p className='item-name'><img src={props.item.energyIcon}/>{props.item.displayName}</p>
                <Stack direction='row' gap={1} className='mod-icon-stack'>
                    {props.item.mods.map(mod => <ModIcon icon_url={mod.icon}/>)}
                </Stack>
            </Stack>
            <Stack className='item-mods' sx={{width:'100%', display:'flex', justifyContent:'center'}}>
                {props.item.mods.slice(1).map(mod => <Typography variant='body' component='p' noWrap>{mod.displayName}</Typography>)}    
            </Stack>
        </Stack>
    )
}

function WeaponItem(props) {
    return (
        <Stack direction='row' spacing={1} className='weapon-item translucent-background'>
            <ItemIcon icon_url={props.item.icon} masterwork={props.item.masterwork == 1} tierType={props.item.tierType}/>
            <Stack spacing={0}>
                <Typography className='item-name' noWrap variant='body' component='p'>{props.item.displayName}</Typography>
                <Stack direction='row' spacing={1} className='perk-icon-stack'>
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
        <Stack spacing={1} className='fragment-icon'>
            <img src={props.icon_url}/>
            <Typography variant='body' component='p' noWrap>{props.name}</Typography>
        </Stack>
    )
}

function Subclass(props) {
    return (
        <Stack direction='row' spacing={1} id='card-subclass' className='translucent-background'>
            <SubclassIcon icon_url={props.subclass.abilities.super.icon}/>
            <Stack id='aspect-fragment-stack'>
                <Stack direction='row' id='aspects-stack'>
                    <AbilityIcon icon_url={props.subclass.abilities.class_ability.icon}/>
                    <AbilityIcon icon_url={props.subclass.abilities.jump.icon}/>
                    <AbilityIcon icon_url={props.subclass.abilities.melee.icon}/>
                    <AbilityIcon icon_url={props.subclass.abilities.grenade.icon}/>
                    {props.subclass.aspects.map(aspect => <AspectIcon icon_url={aspect.icon}/>)}
                </Stack>
                <Stack direction='row' id='fragments-stack'>
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

    const authorMarginBottom = Math.max(30-(1500-titleFontSize.replace('%', ''))/2, 10)
    console.log(`${authorMarginBottom}px`)
    return (
        <Stack direction='row' spacing={1} id='card-header' className='translucent-background'>
            <p id='card-title' style={{fontSize: titleFontSize}} ref={titleFitText.ref}>{props.title}</p>
            <p id='card-author' style={{fontSize: authorFontSize, marginBottom:`${authorMarginBottom}px`}} ref={authorFitText.ref}>by {props.author}</p>
            <p id='card-credit' style={{marginBottom:`${authorMarginBottom}px`}}>d2buildcards.com</p>
        </Stack>
    )
}

function CardBody(props) {
    return (
        <Stack direction='row' id='card-body'>
            <div id='card-armor'>
                {props.character.armor.map(item => <ArmorItem item={item}/>)}
            </div>
            <Stack id='card-body-vertical'>
                <Stack direction='row' id='card-body-weapons-stats'>
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
            <Dialog open={show} onClose={handleClose}>
                <DialogTitle>Loading build card</DialogTitle>
                <DialogContent sx={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <CircularProgress/>
                </DialogContent>
            </Dialog>
        )
    } else if (!isFileSaverSupported) {
        return(
            <Dialog open={show} onClose={handleClose}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <DialogContentText>File saving is not supported on this browser.</DialogContentText>
                </DialogContent>
            </Dialog>
        )
    } else {
        return(
            <Dialog open={show} onClose={handleClose}>
                <DialogTitle>Download build card</DialogTitle>
                <DialogContent>
                     <img src={imageURL} className='download-image'></img>
                     <hr/>
                    <DialogContentText>Your image should be downloading. If not, click <a href={imageURL} download={downloadName}>here</a>.</DialogContentText>
                </DialogContent>
            </Dialog>
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

        console.log(fileType)
        console.log(resolutionRef.current.value)
        console.log(resolution)

        const saveFunc = saveFuncMap[fileType]
        const imageSettings = {cacheBust:true, canvasWidth: resolution.width, canvasHeight: resolution.height, pixelRatio: 1}

        saveFunc(props.cardParent.current, imageSettings)
        .then(url => {  
            var img = document.createElement('img')
            img.src = url
            img.style.display = 'none'

            img.onload = () => {
                saveFunc(props.cardParent.current, imageSettings)
                .then(dataUrl => {
                    props.setImageDownloadURL(dataUrl)
            
                    var fileName = props.cardTitle.toLowerCase().replaceAll(' ', '-')
                    fileName = fileName.replace(/[^a-zA-Z0-9\-_]/g, '') //only allow alphanumeric characters mostly
                    fileName += '.' + fileType

                    props.setDownloadName(fileName)

                    FileSaver.saveAs(dataUrl, fileName)
                })
            }
        })
        .catch(err => {
            console.log(err)
            Sentry.captureException(err)
        }) 
    }

    return(
        <Dialog open={props.show} onClose={props.handleClose}>
            <DialogTitle>Save as...</DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    <InputLabel id='select-file-type-input-label' sx={{width:'50vw'}}>File Type</InputLabel>
                    <Select
                        labelId='select-file-type-input-label'
                        id='fileTypeInput'
                        label='File Type'
                        inputRef={fileTypeRef}
                        mb={3}
                    >
                        <MenuItem value='png' selected>.png</MenuItem>
                        <MenuItem value='jpg'>.jpg</MenuItem>
                    </Select>

                    <InputLabel id='select-resolution-input-label' sx={{width:'50vw'}}>Resolution</InputLabel>
                    <Select 
                        labelId='select-resolution-input-label'
                        id='resolutionInput'
                        label='Resolution'
                        inputRef={resolutionRef}
                        mb={3}
                    >
                        {Object.keys(resolutionMap).map((key) => <MenuItem value={key} selected={key == '1080p'}>{key}</MenuItem>)}
                    </Select>

                    <Button variant='contained' onClick={saveAsImage} sx={{marginTop:'3'}}>
                        Save
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}

function SettingsBox(props) {
    return (
        <Stack spacing={2} id='settings-box' sx={{width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
            <TextField variant='filled' sx={{width:'100%'}} value={props.cardTitle} onChange={(e) => props.setCardTitle(e.target.value)}/>
            <TextField variant='filled' sx={{width:'100%'}} value={props.cardAuthor} onChange={(e) => props.setCardAuthor(e.target.value)}/>
            <Button variant='contained' onClick={() => {props.setShowSaveAsModal(true)}}>Save as...</Button>
        </Stack>
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
    const [imagesLoaded, setImagesLoaded] = useState(0)

    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

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
                    console.log(character)
                }
            }
        })
        .catch(err => {
            console.log(err)
            Sentry.captureException(err)
        })
    }

    const cardParent = useRef(null)

    useEffect(() => {
        getCharacterInfo()
    }, []) //run on mount

    var body = <></>

    if(character) {
        body = 
        (
            <>
                <Grid container id='main' disableEqualOverflow sx={{display:'flex', justifyContent:'center', alignItems:'center', rowGap: 1}}>
                    <Grid xs={10} lg={7} sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                        <SettingsBox {...{cardTitle, setCardTitle, cardAuthor, setCardAuthor, setShowSaveAsModal }}
                        />
                    </Grid>
                    <Grid ref={cardColumn} xs={10} lg={7}>
                        <div id='card-scalar' style={{'transform': `scale(${cardColumnWidth/3840})`}}>
                            <div id='card-parent' style={{backgroundImage: `url(\'${character.subclass.screenshot}\')`}} ref={cardParent}>
                                <CardHeader author={cardAuthor} title={cardTitle}/>
                                <CardBody character={character}/>
                            </div>
                        </div>
                    </Grid>
                </Grid>
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
    }

    return (
        <div>
            <ImagesLoading imagesAreLoading={character != false} imagesLoaded={imagesLoaded} setImagesLoaded={setImagesLoaded}>
                {body}
            </ImagesLoading>
            <AlertSnackbar timeout={8000} message='Unable to reach Bungie.net' alertLevel='error' referenceValue={character}/>
        </div>
    )
}

export default Cards