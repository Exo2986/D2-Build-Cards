const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const { open } = require('sqlite')

var manifest = {}

manifest.itemCategoryHashes = {
    weapon: 1,
    armor: 20
}

manifest.manifestTables = {
    Activity:                    'DestinyActivityDefinition',
    ActivityGraph:               'DestinyActivityGraphDefinition',
    ActivityMode:                'DestinyActivityModeDefinition',
    ActivityModifier:            'DestinyActivityModifierDefinition',
    ActivityType:                'DestinyActivityTypeDefinition',
    Bond:                        'DestinyBondDefinition',
    Class:                       'DestinyClassDefinition',
    DamageType:                  'DestinyDamageTypeDefinition',
    Destination:                 'DestinyDestinationDefinition',
    EnemyRace:                   'DestinyEnemyRaceDefinition',
    EquipmentSlot:               'DestinyEquipmentSlotDefinition',
    Faction:                     'DestinyFactionDefinition',
    Gender:                      'DestinyGenderDefinition',
    HistoricalStats:             'DestinyHistoricalStatsDefinition',
    InventoryBucket:             'DestinyInventoryBucketDefinition',
    InventoryItem:               'DestinyInventoryItemDefinition',
    ItemCategory:                'DestinyItemCategoryDefinition',
    ItemTierType:                'DestinyItemTierTypeDefinition',
    Location:                    'DestinyLocationDefinition',
    Lore:                        'DestinyLoreDefinition',
    MedalTier:                   'DestinyMedalTierDefinition',
    Milestone:                   'DestinyMilestoneDefinition',
    Objective:                   'DestinyObjectiveDefinition',
    Place:                       'DestinyPlaceDefinition',
    Progression:                 'DestinyProgressionDefinition',
    ProgressionLevelRequirement: 'DestinyProgressionLevelRequirementDefinition',
    Race:                        'DestinyRaceDefinition',
    ReportReasonCategory:        'DestinyReportReasonCategoryDefinition',
    RewardSource:                'DestinyRewardSourceDefinition',
    SackRewardItemList:          'DestinySackRewardItemListDefinition',
    SandboxPerk:                 'DestinySandboxPerkDefinition',
    SocketCategory:              'DestinySocketCategoryDefinition',
    SocketType:                  'DestinySocketTypeDefinition',
    Stat:                        'DestinyStatDefinition',
    StatGroup:                   'DestinyStatGroupDefinition',
    TalentGrid:                  'DestinyTalentGridDefinition',
    Unlock:                      'DestinyUnlockDefinition',
    VendorCategory:              'DestinyVendorCategoryDefinition',
    Vendor:                      'DestinyVendorDefinition',
}

manifest.idFromHash = function(hash) {
    return hash >> 32;
}

manifest.getJSONFromHash = function(hash, table) {
    if (!manifest.connected) throw new Error('Database not connected to manifest.db')

    var id = manifest.idFromHash(hash)
    var result = manifest.db.get(`SELECT json FROM ${table} WHERE id = ${id}`)

    return result
}

manifest.openDatabaseConnection = function() {
    open({
        filename: './manifest/manifest.db',
        driver: sqlite3.Database
    })
    .then((db) => {
        console.log('database connection established')
        manifest.db = db
        manifest.connected = true
    })
}

manifest.closeDatabaseConnection = function() {
    manifest.db.close()
    manifest.connected = false
}

module.exports = manifest