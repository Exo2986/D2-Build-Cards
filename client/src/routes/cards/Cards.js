import { Stack, Ratio, Row } from "react-bootstrap"
import './Cards.css'
import axios from 'axios'
import { useEffect, useState } from "react"
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

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
        <Stack direction='horizontal' gap={1} className='armor-item'>
            <ItemIcon icon_url={props.item.icon}/>
            <Stack gap={0}>
                <p className='item-name'>{props.item.displayName}</p>
                <Stack direction='horizontal' gap={1} className='mod-icon-stack'>
                    {slottedMods.map(mod => <ModIcon icon_url={mod.icon}/>)}
                </Stack>
            </Stack>
        </Stack>
    )
}

function WeaponItem(props) {
    //610365472 is for weapon perks and mods, 2237038328 is for intrinsic perks such as weapon frames
    const weaponPerks = props.item.sockets.filter(socket => {
        return socket.json.itemCategoryHashes.includes(610365472) && !socket.json.itemCategoryHashes.includes(2237038328)
    })

    return (
        <Stack direction='horizontal' gap={1} className='weapon-item'>
            <ItemIcon icon_url={props.item.icon}/>
            <Stack gap={0}>
                <p className='item-name'>{props.item.displayName}</p>
                <Stack direction='horizontal' gap={1} className='perk-icon-stack'>
                    {weaponPerks.map(perk => <WeaponPerkIcon icon_url={perk.icon}/>)}
                </Stack>
            </Stack>
        </Stack>
    )
}

function CardHeader() {
    return (
        <Stack direction='horizontal' gap={1} id='card-header'>
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
            <div id='card-weapons'>
                {props.character.weapons.map(item => <WeaponItem item={item}/>)}
            </div>
            <CharacterStats stats={props.character.stats}/>
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
            if (res.data.redirect) {
                navigate(res.data.redirect, {
                    state: state
                })
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

    useEffect(() => getCharacterInfo(), []) //run on mount

    if(character) {
        return (
            <Stack className='justify-content-center' id='main-stack'>
                <div id='card-parent'>
                    <CardHeader/>
                    <CardBody character={character}/>
                </div>
            </Stack>
        )
    } else {
        return (<h1>Loading</h1>)
    }
}

export default Cards