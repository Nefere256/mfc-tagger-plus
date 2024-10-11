
/**
 * A time in seconds for how long the entry data saved in a cache is considered "fresh" and up to date.
 * After the entry data is "stale", it is removed from cache and may be replaced with new data.
 **/
var CACHE_FRESH_SECONDS = 10 * 60;

/**
    * Map entries for tagCounterCache that are yet to be persisted in the extension storage.
    * The contents: see tagCounterCache
    **/
var CACHE_SAVE_ENTRIES = [];



/**
* How many entries have to be added to the cache so the cache can be persisted in the extension storage.
* That way if the user gets into another page, some of the data gathered will not be lost.
* It requires using GM.getValue() and GM.setValue()
**/
var CACHE_SAVE_AFTER_SETTING_VALUES_ORDER = 5;

/**
 * A cache for tag count indicated in the entry page.
 * It's a Map() consisted of:
 * * keys: pathname of an entry page ("/entry/39")
 * * values: object with fields:
 * ** number: integer with number of tags on the entry page (39)
 * ** updatedTime: timestamp of when the map was updated.
 * Map entries may be deleted after time indicated in CACHE_FRESH_SECONDS.
 **/
var tagCounterCache;

/**
     * Get tagCounterCache from a persistent storage.
     **/
async function getCache() {
    tagCounterCache = new Map(Object.entries(
        JSON.parse(await GM.getValue('tagCounterCache', '{}'))));
    return tagCounterCache;
};

/**
 * Save tagCounterCache with new CACHE_SAVE_ENTRIES to a persistent storage.
 * CACHE_SAVE_ENTRIES will be cleared after succesful save.
 **/
async function save() {
    var newTagCounterCache = await getCache();
    for (var entry of CACHE_SAVE_ENTRIES) {
        newTagCounterCache.set(entry.key, entry.value);
    }
    GM.setValue('tagCounterCache', JSON.stringify(Object.fromEntries(newTagCounterCache)));
    tagCounterCache = newTagCounterCache;
    newTagCounterCache.length = 0; /* clear new data as they are persisted */
};

/**
* Save an url and count of tags to both tagCounterCache and CACHE_SAVE_ENTRIES.
* If CACHE_SAVE_ENTRIES will have CACHE_SAVE_AFTER_SETTING_VALUES_ORDER entries, 
* the persistent storage will be updated.
**/
async function push(url, tagCounter) {
    if (tagCounter) {
        var time = Date.now();
        var entry = {
            key: url,
            value: {
                'number': tagCounter,
                'updatedTime': time
            }
        };
        tagCounterCache.set(entry.key, entry.value);
        CACHE_SAVE_ENTRIES.push(entry);
        if (CACHE_SAVE_ENTRIES.length % CACHE_SAVE_AFTER_SETTING_VALUES_ORDER == 0) {
            save();
        }
    }
};

/**
* Get a number of tags for a specified url from cache.
* if the info is stale after CACHE_FRESH_SECONDS since last update of entry,
* the info would be deleted, and the functon will return 0.
* Otherwise, return number of tags.
**/
function getTagCounterFromTagCounterCache(url) {

    var tagCounterPair = tagCounterCache.get(url);
    if (tagCounterPair == null) {
        return 0;
    }
    var stalePairDate = new Date(tagCounterPair.updatedTime);
    stalePairDate.setSeconds(stalePairDate.getSeconds() + CACHE_FRESH_SECONDS);
    if (stalePairDate < Date.now()) {
        tagCounterCache.delete(url);
        return 0;
    }
    return tagCounterPair.number;
};

export { getCache as initCache, save as saveTagCounterCache, push as pushToTagCounterCache, getTagCounterFromTagCounterCache };