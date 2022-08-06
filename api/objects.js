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
Grenade plug category ends with grenade
*/

function icon(path) {
    return 'https://www.bungie.net/' + path
}

objects.character = function(characterData, characterEquipment, itemComponents) {
    return new Promise(async (fulfill, reject) => {
        var character = {};

        //character id
        character.id = characterData.characterId

        //character class
        var classHash = characterData.classHash
        var classJson = await manifest.getJSONFromHash(classHash, manifest.manifestTables.Class)
        classJson = JSON.parse(classJson.json)

        character.class = classJson.displayProperties.name

        //character stats
        character.stats = {}

        for (var key in characterData.stats) {
            var value = characterData.stats[key]

            var statJson = await manifest.getJSONFromHash(key, manifest.manifestTables.Stat)
            statJson = JSON.parse(statJson.json)
            var statName = statJson.displayProperties.name
            var statIcon = icon(statJson.displayProperties.icon)

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
            var itemJson = await manifest.getJSONFromHash(item.itemHash, manifest.manifestTables.InventoryItem)
            itemJson = JSON.parse(itemJson.json)

            var itemCategoryHashes = itemJson.itemCategoryHashes

            if (itemCategoryHashes.includes(manifest.itemCategoryHashes.weapon)) {
                var itemComponentsData = {
                    sockets: itemComponents.sockets.data[item.itemInstanceId].sockets
                }

                character.weapons.push(await objects.weapon(item, itemComponentsData))
            } else if (itemCategoryHashes.includes(manifest.itemCategoryHashes.armor)) {
                var itemComponentsData = {
                    stats: itemComponents.stats.data[item.itemInstanceId].stats,
                    sockets: itemComponents.sockets.data[item.itemInstanceId].sockets,
                }
                
                character.armor.push(await objects.armor(item, itemComponentsData))
            }
        }

        fulfill(character)
    })
}

objects.subclass = function(itemData, itemComponentsData) {
    return new Promise(async (fulfill, reject) => {
        var subclass = {}

        subclass.itemHash = itemData.itemHash
        subclass.itemInstanceId = itemData.itemInstanceId

        var json = await manifest.getJSONFromHash(subclass.itemHash, manifest.manifestTables.InventoryItem)

        subclass.json = JSON.parse(json.json)

        //
        subclass.screenshot = icon(subclass.json.screenshot)
    })
}

objects.weapon = function(itemData, itemComponentsData) {
    return new Promise(async (fulfill, reject) => {
        var weapon = {}

        weapon.itemHash = itemData.itemHash
        weapon.itemInstanceId = itemData.itemInstanceId

        var json = await manifest.getJSONFromHash(weapon.itemHash, manifest.manifestTables.InventoryItem)

        weapon.json = JSON.parse(json.json)

        //weapon display properties
        weapon.displayName = weapon.json.displayProperties.name
        weapon.icon = icon(weapon.json.displayProperties.icon)

        //weapon perks and mods
        weapon.sockets = []

        for (var socketKey in itemComponentsData.sockets) {
            var socket = itemComponentsData.sockets[socketKey]

            var weaponSocket = await objects.weaponSocket(socket, weapon.itemInstanceId)
            if (weaponSocket) 
                weapon.sockets.push(weaponSocket)
        }
        
        fulfill(weapon)
    })
}

objects.weaponSocket = function(socketData, socketedItemId) {
    return new Promise(async (fulfill, reject) => {
        if (!socketData.plugHash) fulfill(false)

        var weaponSocket = {}

        weaponSocket.plugHash = socketData.plugHash
        weaponSocket.isEnabled = socketData.isEnabled
        weaponSocket.isVisible = socketData.isVisible
        weaponSocket.socketedItemId = socketedItemId

        var json = await manifest.getJSONFromHash(weaponSocket.plugHash, manifest.manifestTables.InventoryItem)

        if (json) {
            weaponSocket.json = JSON.parse(json.json)

            weaponSocket.displayName = weaponSocket.json.displayProperties.name
            weaponSocket.icon = icon(weaponSocket.json.displayProperties.icon)

            fulfill(weaponSocket)
        } else {
            fulfill(false)
        }
    })
}

objects.armor = function(itemData, itemComponentsData) {
    return new Promise(async (fulfill, reject) => {
        var armor = {}

        armor.itemHash = itemData.itemHash
        armor.itemInstanceId = itemData.itemInstanceId

        var json = await manifest.getJSONFromHash(armor.itemHash, manifest.manifestTables.InventoryItem)

        armor.json = JSON.parse(json.json)

        //armor display properties
        armor.displayName = armor.json.displayProperties.name
        armor.icon = icon(armor.json.displayProperties.icon)

        //armor stats
        armor.stats = []
        armor.statIcons = []

        for (var key in itemComponentsData.stats) {
            var value = itemComponentsData.stats[key].value

            var statsJson = await manifest.getJSONFromHash(key, manifest.manifestTables.Stat)
            statsJson = JSON.parse(statsJson.json)

            armor.stats[statsJson.displayProperties.name] = value
            armor.statIcons[statsJson.displayProperties.name] = statsJson.displayProperties.icon
        }

        //armor mods and the like
        armor.sockets = []

        for (var socketKey in itemComponentsData.sockets) {
            var socket = itemComponentsData.sockets[socketKey]

            var armorMod = await objects.armorMod(socket, armor.itemInstanceId)
            if (armorMod)
                armor.sockets.push(armorMod)
        }

        fulfill(armor)
    })
}

objects.armorMod = function(socketData, socketedItemId) {
    return new Promise(async (fulfill, reject) => {
        var armorMod = {}

        armorMod.plugHash = socketData.plugHash
        armorMod.isEnabled = socketData.isEnabled
        armorMod.isVisible = socketData.isVisible
        armorMod.socketedItemId = socketedItemId

        var json = await manifest.getJSONFromHash(armorMod.plugHash, manifest.manifestTables.InventoryItem)
        
        if (json) {
            armorMod.json = JSON.parse(json.json)

            armorMod.displayName = armorMod.json.displayProperties.name
            armorMod.icon = icon(armorMod.json.displayProperties.icon)

            fulfill(armorMod)
        } else {
            fulfill(false)
        }
    })
}

module.exports = objects