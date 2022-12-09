function shorten_url(url) {
    return new Promise((resolve, reject) => {
        fetch("https://redr.me/api/link/", {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({target_url: url})
        }).then(res => res.json()).then(
            res => resolve(`https://redr.me/${res.code}`)
        ).catch(err => {
            chrome.notifications.create('redr-me-copied', {
                type: 'basic',
                title: "Redr.me",
                message: "Unable to shorten URL. Please try again!",
                iconUrl: 'icons/icon-128.png',
                requireInteraction: false,
                silent: false
            })
            reject()
        })
    })
}
function clickHandler(e) {
    let url = e.linkUrl
    
    if (!url) {
        if (!e.selectionText) {
            url = e.frameUrl || e.pageUrl
        } else {
            try {
                url = new URL(e.selectionText)
            } catch (e) {
                chrome.notifications.create('redr-me-copied', {
                    type: 'basic',
                    title: "Redr.Me",
                    message: "Selected Text is not a valid URL",
                    iconUrl: 'icons/icon-128.png',
                    requireInteraction: false,
                    silent: false
                })
                return
            }
        }
    }
    shorten_url(url).then(short_url => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(
                tabs[0].id,
                {message: 'copy_url', short_url}
            );
        });
    }).catch(err => {})

}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (/^http/.test(tab.url) && changeInfo.status === 'complete') {
        chrome.scripting.executeScript({target: {tabId: tabId}, files: ['foreground.js', ]})
    }
});

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create(
    {
        id: `redrme-chrome-page`,
        type: 'normal',
        title: "Shorten this Page URL",
        contexts: [
            'page'
        ],
    },
    () => null,
    )
    chrome.contextMenus.create(
    {
        id: `redrme-chrome-frame`,
        type: 'normal',
        title: "Shorten this Frame URL",
        contexts: [
            'frame'
        ],
    },
    () => null,
    )
    chrome.contextMenus.create(
    {
        id: `redrme-chrome-link`,
        type: 'normal',
        title: "Shorten this Link",
        contexts: [
            'link'
        ],
    },
    () => null,
    )
    chrome.contextMenus.create(
    {
        id: `redrme-chrome-selection`,
        type: 'normal',
        title: "Shorten this Selected URL",
        contexts: [
            'selection'
        ],
    },
    () => null,
    )
})

chrome.contextMenus.onClicked.addListener(clickHandler)

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({
        active: true,
        url: "https://redr.me",
        index: tab.index + 1
    })
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === 'show_notification') {
        chrome.notifications.create('redr-me-custom', message.options)
    }
})
