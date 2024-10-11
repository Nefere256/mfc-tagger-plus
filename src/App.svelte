<script >

    import {initCache, saveTagCounterCache, pushToTagCounterCache, getTagCounterFromTagCounterCache} from './modules/tagCache.js';
(async function () {
    'use strict';

    /**
     * Name of the class used for a tag counter container.
     * It should be not used on the page it's inserted to.
     **/
    var TAG_CLASSNAME = "us-tag";

    /**
     * Name of the class absent on the page.
     * Used to return empty collection of nodes from a function.
     **/
    var FAKE_CLASS_PLACEHOLDER = "fake-class-placeholder";

    /**
     * A time in miliseconds to wait between requests to MFC.
     * Too short time may results in "429 - Too many requests" error responses.
     * Can be increased with REQUEST_DELAY_MULTIPLIER.
     **/
    var REQUEST_DELAY = 1000;

    /**
     * A multipler that is used on REQUEST_DELAY when 429 response error is obtained.
     * Should be over 1 to work properly.
     **/
    var REQUEST_DELAY_MULTIPLIER = 1.1;


	/**
	 * Util method. It let the thread sleep for ms (miliseconds) between calls to MFC website.
	 **/
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

	/**
	* Add a style for tag counter container (with a TAG_CLASSNAME class).
	* It's done only once the page is loaded.
	**/
    function addStyles() {
		let style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = "\
            .item-icon ." + TAG_CLASSNAME + " {\
            position: absolute;\
            display: block;\
            right: -4px;\
            top: -4px;\
            padding: 4px;\
            border-radius: 3px;\
            text-align: center;\
            vertical-align: middle;\
            min-width: 12px;\
            font-weight: 700;\
            font-size: 11px;\
            color: gold;\
            background-color: darkgreen\
            }";
		document.getElementsByTagName('head')[0].appendChild(style);
    };
    function getEntryContainers() {
        var pathname = window.location.pathname;
        var search = window.location.search;
        var searchParams = new URLSearchParams(search);
        var tbParam = searchParams.get("_tb");
        if (pathname.includes("/entry/") /* encyclopedia entry */
            || pathname.includes("/browse.v4.php") /* search results with filters */
            || pathname.includes("/browse/calendar/") /* calendar page */
            || pathname.includes("/item/browse/calendar/") /* new calendar page */
            || pathname.includes("/item/browse/figure/") /* new figures page */
            || pathname.includes("/item/browse/goods/") /* new goods page */
            || pathname.includes("/item/browse/media/") /* new media page */
            || tbParam !== null) {
            var result = document.querySelectorAll("#wide .result:not(.hidden)");
            return result;
		}
        console.log("unsupported getEntryContainers");
        return document.querySelectorAll(FAKE_CLASS_PLACEHOLDER);
    };

	/**
	* Check if the current page (intended to be one with search results)
	* is detailed list.
	* The info is taken from GET/query params instead from the page contents.
	**/
    function isDetailedList() {
        var search = window.location.search;
        var searchParams = new URLSearchParams(search);
        var outputParam = searchParams.get("output"); /* 0 - detailedList, 1,2 - grid, 3 - diaporama */
        return outputParam == 0;
    };

    function getItemsFromContainer(entryContainer) {
		var icons = entryContainer.querySelectorAll(".item-icons .item-icon");
        if (icons.length > 0) {
            return icons;
        }
        var pathname = window.location.pathname;
        if (pathname.includes("/browse.v4.php") /* search page, detailed list view */
             && isDetailedList()) {
            return document.querySelectorAll(FAKE_CLASS_PLACEHOLDER);
        }
        console.log("unsupported getItemsFromContainer");
        return document.querySelectorAll(FAKE_CLASS_PLACEHOLDER);
    };
    function getTagCounterFromHtml(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var tagCounterNode = doc.querySelector("div.tbx-target-TAGS .actions > .meta");
        if (tagCounterNode == null)
            console.log("No tag counter element on downloaded html.");
        return tagCounterNode.textContent;
    };
    function addTagCounterToSearchResult(itemLinkElement, countOfTags) {
        var tagElement = document.createElement("span");
        tagElement.setAttribute("class", TAG_CLASSNAME);
        tagElement.textContent = countOfTags;
        itemLinkElement.appendChild(tagElement);
    };

    async function fetchAndHandle(queue) {
        var resultQueue = [];
        for (var itemElement of queue) {
            var itemLinkElement = itemElement.firstChild;
            var entryLink = itemLinkElement.getAttribute("href");

            fetch(entryLink, {
                headers: {
                    "User-Agent": GM.info.script.name + " " + GM.info.script.version
                }
            }).then(function (response) {
                if (response.ok) {
                    response.text().then(function (html) {
                        var countOfTags = getTagCounterFromHtml(html);
                        addTagCounterToSearchResult(itemLinkElement, countOfTags);
                        pushToTagCounterCache(entryLink, countOfTags);
                    });
                }
                return Promise.reject(response);
            }).catch(function (err) {
                if (err.status == 429) {
                    console.warn('Too many requests. Added the request to fetch later', err.url);
                    resultQueue.push(itemElement);
                    REQUEST_DELAY = REQUEST_DELAY * REQUEST_DELAY_MULTIPLIER;
                    console.info('Increased delay to ' + REQUEST_DELAY);
                }
            });
            await sleep(REQUEST_DELAY);

        }
        return resultQueue;
    };
    async function main() {
        var itemQueue = [];
        var entryContainers = getEntryContainers();
        entryContainers.forEach((entryContainer) => {
            var itemsElements = getItemsFromContainer(entryContainer);
            itemsElements.forEach((itemElement) => {
                itemQueue.push(itemElement);
            });
        });

        var queue = [];
        await initCache();
        for (var itemElement of itemQueue) {
            var itemLinkElement = itemElement.firstChild;
            var entryLink = itemLinkElement.getAttribute("href");
            var cachedNumber = getTagCounterFromTagCounterCache(entryLink);
            if (cachedNumber > 0) {
                addTagCounterToSearchResult(itemLinkElement, cachedNumber);
            } else {
                queue.push(itemElement);
            }
        }
        while (queue.length) {
            queue = await fetchAndHandle(queue);
        }
        saveTagCounterCache();

    };


	/**
	* All variables and methods are set.
	* Enjoy the show.
	**/
    addStyles();
    main();
})();

</script>
