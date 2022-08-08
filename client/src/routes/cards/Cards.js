import { Stack, Container, Row, Col, Button } from "react-bootstrap"
import './Cards.css'
import axios from 'axios'
import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';

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
    const slottedMods = props.item.sockets.filter(socket => socket.json.itemCategoryHashes.includes(4104513227))

    return (
        <Stack direction='horizontal' gap={1} className='armor-item translucent-background'>
            <ItemIcon icon_url={props.item.icon}/>
            <Stack gap={0}>
                <p className='item-name'>{props.item.displayName}</p>
                <Stack direction='horizontal' gap={1} className='mod-icon-stack'>
                    {slottedMods.map(mod => <ModIcon icon_url={mod.icon}/>)}
                </Stack>
            </Stack>
            <p className='item-mods'>{slottedMods.map(mod => mod.displayName).join('\n')}</p>
        </Stack>
    )
}

function WeaponItem(props) {
    return (
        <Stack direction='horizontal' gap={1} className='weapon-item translucent-background'>
            <ItemIcon icon_url={props.item.icon}/>
            <Stack gap={0}>
                <p className='item-name'>{props.item.displayName}</p>
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

function AspectIcon(props) {
    return (
        <img src={props.icon_url} className='aspect-icon'/>
    )
}

function FragmentIcon(props) {
    return (
        <img src={props.icon_url} className='fragment-icon'/>
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
                            return (<FragmentIcon icon_url={fragment.icon}/>)
                        }
                    })}
                </Stack>
            </Stack>
        </Stack>
    )
}

function CardHeader(props) {
    return (
        <Stack direction='horizontal' gap={1} id='card-header' className='translucent-background'>
            <p id='card-title'>Test</p>
            <p id='card-author'>by Exo</p>
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

function Cards() {
    const [character, setCharacter] = useState(false)
    const {state} = useLocation()
    const navigate = useNavigate()

    const charClass = state.charClass

    const getCharacterInfo = () => {
        if (character) return

        axios.get('/cards')
        .then(res => {
            console.log(res)
            if (res.data.refresh) {
                navigate(0)
            } else if ('authenticated' in res.data) {
                navigate('../../auth')
            } else {
                var charResult = res.data.find(obj => {
                    return obj.class == charClass
                })
    
                if(charResult) {
                    setCharacter(charResult)
                    console.log('yay')
                } else {
                    console.log('uh oh')
                }
            }
        })
        .catch(err => {
            console.log(err)
        })
    }

    const cardParent = useRef(null)

    const saveAsImage = () => {
        console.log('clicked')
        htmlToImage.toPng(cardParent.current)
        .then(dataUrl => {
            console.log('downloading')
            download(dataUrl, 'my_build_card.png')
        })
        .catch(err => {
            console.log(err)
        }) 
    }

    useEffect(() => getCharacterInfo(), []) //run on mount

    if(character) {
        return (
            <>
                <Container className='justify-content-center' id='settings-container'>
                    <Row className='align-self-center'>
                        <Col xs={2}>
                            <Button onClick={saveAsImage}>Save as PNG</Button>
                        </Col>
                    </Row>
                </Container>
                <Stack className='justify-content-center' id='main-stack'>
                    <div id='card-scalar'>
                        <div id='card-parent' style={{backgroundImage: `url(\'${character.subclass.screenshot}\')`}} ref={cardParent}>
                            <CardHeader/>
                            <CardBody character={character}/>
                        </div>
                    </div>
                </Stack>
            </>
        )
    } else {
        return (<h1>Loading</h1>)
    }
}

export default Cards