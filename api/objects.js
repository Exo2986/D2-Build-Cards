const path = require('path')
const manifest = require('./manifest.js')

var objects = {}

/*
Subclasses are an inventory item, abilities, aspects, and fragments are all sockets in the item.
Abilities do not have a trait id.
Aspects have the trait id: "item_type.aspect"
Fragments have the trait id: "item_type.fragment"

Super plug category ends with supers
Class ability plug category ends with class_abilities
Melee plug category ends with melee
Grenade plug category ends with grenades
Jump plug category ends with movement
*/

function bungieResourcePath(resourcePath) {
    return 'https://www.bungie.net' + resourcePath
}

objects.character = function(characterData, characterEquipment, itemComponents, characterOnly=false) {
    return new Promise(async (fulfill, reject) => {
        try {
            var character = {};
    
            //character id
            character.id = characterData.characterId
    
            //character class
            var classHash = characterData.classHash
            var classJson = await manifest.getJSONFromHash(classHash, manifest.manifestTables.Class).catch((err) => reject(err))
            classJson = JSON.parse(classJson.json)
    
            character.class = classJson.displayProperties.name
            character.emblem = bungieResourcePath(characterData.emblemPath)
            character.emblemBackground = bungieResourcePath(characterData.emblemBackgroundPath)
    
            if (characterOnly) {
                fulfill(character)
                return
            }
    
            //character stats
            character.stats = {}
    
            for (var key in characterData.stats) {
                var value = characterData.stats[key]
                
                var statJson = await manifest.getJSONFromHash(key, manifest.manifestTables.Stat).catch((err) => reject(err))
    
                statJson = JSON.parse(statJson.json)
                var statName = statJson.displayProperties.name
                var statIcon = bungieResourcePath(statJson.displayProperties.icon)
    
                character.stats[statName] = {
                    icon: statIcon,
                    value: value
                }
            }
    
            character.weapons = []
            character.armor = []
    
            //character equipment
            for (var itemKey in characterEquipment.items) {
                var item = characterEquipment.items[itemKey]
    
                var itemJson = await manifest.getJSONFromHash(item.itemHash, manifest.manifestTables.InventoryItem).catch((err) => reject(err))
    
                itemJson = JSON.parse(itemJson.json)
    
                var itemCategoryHashes = itemJson.itemCategoryHashes
    
                if (itemCategoryHashes.includes(manifest.itemCategoryHashes.weapon)) {
                    var itemComponentsData = {
                        sockets: itemComponents.sockets.data[item.itemInstanceId].sockets
                    }
    
                    character.weapons.push(await objects.weapon(item, itemComponentsData).catch((err) => reject(err)))
    
                } else if (itemCategoryHashes.includes(manifest.itemCategoryHashes.armor)) {
                    var itemComponentsData = {
                        stats: itemComponents.stats.data[item.itemInstanceId].stats,
                        sockets: itemComponents.sockets.data[item.itemInstanceId].sockets,
                    }
    
                    character.armor.push(await objects.armor(item, itemComponentsData).catch((err) => reject(err)))
                } else if (itemJson.traitIds
                    && (itemJson.traitIds.includes('item_type.dark_subclass') 
                    || itemJson.traitIds.includes('item_type.light_subclass'))) { //it's a subclass
    
                    var itemComponentsData = {
                        sockets: itemComponents.sockets.data[item.itemInstanceId].sockets
                    }
    
                    character.subclass = await objects.subclass(item, itemComponentsData).catch((err) => reject(err))
                }
            }
    
            fulfill(character)
        } catch (error) {
            reject(error)
        }
    })
}

objects.subclass = function(itemData, itemComponentsData) {
    return new Promise(async (fulfill, reject) => {
        try {
            var subclass = {}
    
            subclass.itemHash = itemData.itemHash
            subclass.itemInstanceId = itemData.itemInstanceId
    
            var json = await manifest.getJSONFromHash(subclass.itemHash, manifest.manifestTables.InventoryItem).catch((err) => reject(err))
    
            subclass.json = JSON.parse(json.json)
    
            //subclass display properties
            subclass.screenshot = bungieResourcePath(subclass.json.screenshot)
            subclass.displayName = subclass.json.displayProperties.name
            subclass.icon = bungieResourcePath(subclass.json.displayProperties.icon)
    
            //abilities, aspects and fragments
            subclass.abilities = {}
            subclass.aspects = []
            subclass.fragments = []
    
            for (var socketKey in itemComponentsData.sockets) {
                var socket = itemComponentsData.sockets[socketKey]
    
                var subclassSocket = await objects.subclassSocket(socket, subclass.itemInstanceId).catch((err) => reject(err))
    
                if (subclassSocket) {
                    switch(subclassSocket.category) {
                        case 'fragments':
                            subclass.fragments.push(subclassSocket)
                            break
                        
                        case 'aspects':
                            subclass.aspects.push(subclassSocket)
                            break
    
                        case 'abilities':
                            subclass.abilities[subclassSocket.abilityCategory] = subclassSocket
                    }
                }
            }
    
            fulfill(subclass)
        } catch (error) {
            reject(error)
        }
    })
}

const abilityPlugCategoryMap = {
    'movement': 'jump',
    'supers': 'super',
    'melee': 'melee',
    'grenades': 'grenade',
    'class_abilities': 'class_ability',
}

objects.subclassSocket = function(socketData, socketedItemId) {
    return new Promise(async (fulfill, reject) => {
        try {
            var subclassSocket = {}
    
            subclassSocket.plugHash = socketData.plugHash
            subclassSocket.isEnabled = socketData.isEnabled
            subclassSocket.isVisible = socketData.isVisible
            subclassSocket.socketedItemId = socketedItemId
    
            var json = await manifest.getJSONFromHash(subclassSocket.plugHash, manifest.manifestTables.InventoryItem).catch((err) => reject(err))
    
            if (json) {
                subclassSocket.json = JSON.parse(json.json)
    
                //display properties
                subclassSocket.displayName = subclassSocket.json.displayProperties.name
                subclassSocket.icon = bungieResourcePath(subclassSocket.json.displayProperties.icon)
    
                if (subclassSocket.json.traitIds && subclassSocket.json.traitIds.includes('item_type.fragment')) { //fragment
                    subclassSocket.category = 'fragments'
                } else if (subclassSocket.json.traitIds && subclassSocket.json.traitIds.includes('item_type.aspect')) { //aspect
                    subclassSocket.category = 'aspects'
                } else { //it's an ability
                    var plugCategory = Object.keys(abilityPlugCategoryMap).find(el => subclassSocket.json.plug.plugCategoryIdentifier.endsWith(el))
    
                    if (plugCategory) {
                        subclassSocket.category = 'abilities'
                        subclassSocket.abilityCategory = abilityPlugCategoryMap[plugCategory]
                    } else { //it's an empty fragment slot
                        subclassSocket.category = 'fragments'
                    }
                }
            }
    
            fulfill(subclassSocket)
        } catch (error) {
            reject(error)
        }
    })
}

objects.weapon = function(itemData, itemComponentsData) {
    return new Promise(async (fulfill, reject) => {
        try {
            var weapon = {}
    
            weapon.itemHash = itemData.itemHash
            weapon.itemInstanceId = itemData.itemInstanceId
    
            var json = await manifest.getJSONFromHash(weapon.itemHash, manifest.manifestTables.InventoryItem).catch((err) => reject(err))
    
            weapon.json = JSON.parse(json.json)
    
            //weapon display properties
            weapon.displayName = weapon.json.displayProperties.name
            weapon.icon = bungieResourcePath(weapon.json.displayProperties.icon)
    
            //weapon perks and mods
            var sockets = []
    
            for (var socketKey in itemComponentsData.sockets) {
                var socket = itemComponentsData.sockets[socketKey]
    
                var weaponSocket = await objects.weaponSocket(socket, weapon.itemInstanceId).catch((err) => reject(err))
                if (weaponSocket) 
                    sockets.push(weaponSocket)
            }
    
            weapon.perks = []
    
            //this is a list of indexes of perk category hashes, we only want the perks matching this list
            var perkSocketIndexes = weapon.json.sockets.socketCategories[1].socketIndexes
    
            //this is the list that the indexes point to.
            var socketEntries = weapon.json.sockets.socketEntries
    
            //here we translate the indexes to their values by mapping the array
            var perkSocketTypeHashes = perkSocketIndexes.map(index => socketEntries[index].socketTypeHash)
    
            //now we want to query the manifest table for the json information associated with each of these socket type hashes
            var perkSocketTypes = perkSocketTypeHashes.map(hash => manifest.getJSONFromHash(hash, manifest.manifestTables.SocketType))
    
            var perkSocketTypes = await Promise.all(perkSocketTypes).catch((err) => reject(err))
    
            perkSocketTypes = perkSocketTypes.map(res => JSON.parse(res.json))
    
            //every socket has a plugCategoryHash under socket.json.plug. Every socket type definition has a whitelist of allowed plugCategoryHashes.
            //Here we just check if each plugCategoryHash is contained somewhere in perkSocketTypes. If it is, then we keep it.
            for (var socket of sockets) {
                var plugCategoryHash = socket.json.plug.plugCategoryHash
    
                for (var socketType of perkSocketTypes) {
                    var whitelist = socketType.plugWhitelist
                    var found = false
    
                    for (var item of whitelist) {
                        if (item.categoryHash == plugCategoryHash && plugCategoryHash != 2947756142) { //2947756142 is kill trackers, we don't need that
                            weapon.perks.push(socket)
                            found = true
                            break
                        }
                    }
    
                    if (found) break
                }
            }
            
            fulfill(weapon)
        } catch (error) {
            reject(error)
        }
    })
}

objects.weaponSocket = function(socketData, socketedItemId) {
    return new Promise(async (fulfill, reject) => {
        try {
            if (!socketData.plugHash) fulfill(false)
    
            var weaponSocket = {}
    
            weaponSocket.plugHash = socketData.plugHash
            weaponSocket.isEnabled = socketData.isEnabled
            weaponSocket.isVisible = socketData.isVisible
            weaponSocket.socketedItemId = socketedItemId
    
            var json = await manifest.getJSONFromHash(weaponSocket.plugHash, manifest.manifestTables.InventoryItem).catch((err) => reject(err))
    
            if (json) {
                weaponSocket.json = JSON.parse(json.json)
    
                weaponSocket.displayName = weaponSocket.json.displayProperties.name
                weaponSocket.icon = bungieResourcePath(weaponSocket.json.displayProperties.icon)
    
                fulfill(weaponSocket)
            } else {
                fulfill(false)
            }
        } catch (error) {
            reject(error)
        }
    })
}

objects.armor = function(itemData, itemComponentsData) {
    return new Promise(async (fulfill, reject) => {
        try {
            var armor = {}
    
            armor.itemHash = itemData.itemHash
            armor.itemInstanceId = itemData.itemInstanceId
    
            var json = await manifest.getJSONFromHash(armor.itemHash, manifest.manifestTables.InventoryItem).catch((err) => reject(err))
    
            armor.json = JSON.parse(json.json)
    
            //armor display properties
            armor.displayName = armor.json.displayProperties.name
            armor.icon = bungieResourcePath(armor.json.displayProperties.icon)
    
            //armor stats
            armor.stats = []
            armor.statIcons = []
    
            for (var key in itemComponentsData.stats) {
                var value = itemComponentsData.stats[key].value
    
                var statsJson = await manifest.getJSONFromHash(key, manifest.manifestTables.Stat).catch((err) => reject(err))
                statsJson = JSON.parse(statsJson.json)
    
                armor.stats[statsJson.displayProperties.name] = value
                armor.statIcons[statsJson.displayProperties.name] = statsJson.displayProperties.icon
            }
    
            //armor mods
            var sockets = []
    
            for (var socket of itemComponentsData.sockets) {
                var armorSocket = await objects.armorMod(socket, armor.itemInstanceId).catch((err) => reject(err))
                if (armorSocket) 
                    sockets.push(armorSocket)
            }
    
            armor.mods = []
    
            //this is a list of indexes of mod category hashes, we only want the sockets matching this list
            var modSocketIndexes = armor.json.sockets.socketCategories[0].socketIndexes
    
            //this is the list that the indexes point to.
            var socketEntries = armor.json.sockets.socketEntries
    
            //here we translate the indexes to their values by mapping the array
            var modSocketTypeHashes = modSocketIndexes.map(index => socketEntries[index].socketTypeHash)
    
            //now we want to query the manifest table for the json information associated with each of these socket type hashes
            var modSocketTypes = modSocketTypeHashes.map(hash => manifest.getJSONFromHash(hash, manifest.manifestTables.SocketType))
    
            modSocketTypes = await Promise.all(modSocketTypes).catch((err) => reject(err))
    
            modSocketTypes = modSocketTypes.map(res => JSON.parse(res.json))
    
            //every socket has a plugCategoryHash under socket.json.plug. Every socket type definition has a whitelist of allowed plugCategoryHashes.
            //Here we just check if each plugCategoryHash is contained somewhere in perkSocketTypes. If it is, then we keep it.
            for (var socket of sockets) {
                var plugCategoryHash = socket.json.plug.plugCategoryHash
    
                for (var socketType of modSocketTypes) {
                    var whitelist = socketType.plugWhitelist
                    var found = false
    
                    for (var item of whitelist) {
                        if (item.categoryHash == plugCategoryHash && socket.json.plug.plugCategoryIdentifier.includes('enhancements')) {
                            armor.mods.push(socket)
                            found = true
                            break
                        }
                    }
    
                    if (found) break
                }
            }
    
            fulfill(armor)
        } catch (error) {
            reject(error)
        }
    })
}

objects.armorMod = function(socketData, socketedItemId) {
    return new Promise(async (fulfill, reject) => {
        try {
            var armorMod = {}
    
            armorMod.plugHash = socketData.plugHash
            armorMod.isEnabled = socketData.isEnabled
            armorMod.isVisible = socketData.isVisible
            armorMod.socketedItemId = socketedItemId
    
            var json = await manifest.getJSONFromHash(armorMod.plugHash, manifest.manifestTables.InventoryItem).catch((err) => reject(err))
            
            if (json) {
                armorMod.json = JSON.parse(json.json)
    
                armorMod.displayName = armorMod.json.displayProperties.name
                armorMod.icon = bungieResourcePath(armorMod.json.displayProperties.icon)
    
                fulfill(armorMod)
            } else {
                fulfill(false)
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = objects