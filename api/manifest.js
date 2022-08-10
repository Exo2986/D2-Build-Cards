const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const { open } = require('sqlite')
const winston = require('winston')
const logger = winston.child({service: 'manifest'})

var manifest = {}

manifest.connected = () => manifest.db == null

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
    if (!manifest.connected()) throw new Error('Database not connected to manifest.db')
    
    var id = manifest.idFromHash(hash)
    var query = `SELECT json FROM ${table} WHERE id = ${id}`

    logger.info({
        message: 'Querying manifest.db',
        query: query
    })

    var result = manifest.db.get(query)

    return result
}

manifest.openDatabaseConnection = function() {
    const profiler = 'Establish connection to manifest.db'
    logger.profile(profiler)
    open({
        filename: './manifest/manifest.db',
        driver: sqlite3.Database
    })
    .then((db) => {
        logger.profile(profiler)
        manifest.db = db
    })
}

manifest.closeDatabaseConnection = function() {
    logger.info('Closing database connection')
    if (manifest.db) manifest.db.close()
}

module.exports = manifest