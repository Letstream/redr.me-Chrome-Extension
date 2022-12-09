chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)
    if (message.message === 'copy_url') {
        let short_url = message.short_url
        if (navigator && navigator.clipboard) {
            console.log("Copy Supported ", short_url)
            try {
                navigator.clipboard.writeText(short_url)
                chrome.runtime.sendMessage({
                    message: 'show_notification',
                    options: {
                        type: 'basic',
                        title: "URL Shortened",
                        message: "Shorterned URL (" + short_url + ") has been copied to clipboard",
                        contextMessage: short_url,
                        iconUrl: 'icons/icon-128.png',
                        requireInteraction: false,
                        silent: false
                    }
                })
            } catch(e) {
                alert("Copy is not supported, here's shortned URL: " + short_url)
                throw(e)
            }
        } else {
            alert("Native Copy is not supported, here's shortned URL: " + short_url)
        }
    }
})
