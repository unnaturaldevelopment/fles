// ==UserScript==
// @name        FetLife Enhancement Suite
// @namespace   https://fetlife.com/users/8366100
// @match       https://fetlife.com/*
// @version     1
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest
// ==/UserScript==
function returnPageType( pageLocation ) {
    const homeRE = RegExp('^https://fetlife.com/home.*$');
    const groupRE = RegExp('^https://fetlife.com/groups$');
    const groupSubRE = RegExp('^https://fetlife.com/groups/[0-9]*.*$');
    const profileRE = RegExp('^https://fetlife.com/users/[0-9]*$');
    if( groupRE.test(pageLocation) )
    {
        return 'groupPage';
    }
    else if( groupSubRE.test( pageLocation ) )
    {
        return 'subGroup';
    }
    else if( homeRE.test( pageLocation) )
    {
        return 'home';
    }
    else if( profileRE.test( pageLocation ) )
    {
        return 'profile';
    }
    else {
        return 'all';
    }
}
function adjustGroupPage() {
    // Replace 'ago' with actual timestamp
    if( GM_getValue('timestamp_groups') ) {
        const timestampList = document.getElementsByClassName('refresh-timestamp');
        let listLength = timestampList.length;
        for( let i = 0; i < listLength; i++ ) {
            timestampList[i].textContent = 'on ' + timestampList[i].title;
        }
    }
    // Replace group href with redirect to new discussions instead of comments
    if( GM_getValue('group_new_discussion') ) {
        const groupListingList = document.getElementsByClassName('group_listing');
        let listLength = groupListingList.length;
        for( let i = 0; i < listLength; i++ ) {
            groupListingList[i].href = groupListingList[i] + '?order=discussions';
        }
    }
}
function adjustSubGroupPage() {
    // Replace 'ago' with actual timestamp
    if( GM_getValue('timestamp_group') ) {
        const timestampList = document.getElementsByClassName('refresh-timestamp');
        let listLength = timestampList.length;
        for( let i = 0; i < listLength; i++ ) {
            if( timestampList[i].parentElement.parentElement.className !== 'sticky_line' ) {
                timestampList[i].textContent = 'updated on ' + timestampList[i].title;
            }
        }
    }
}
function adjustHomePage() {
    // TODO: Add functionality exclusively to home page
}
function adjustProfile() {
    const imgLink = document.querySelector('img.pan').src.split(/^https:\/\/\w+.fetlife.com\/\w+\/\w+\/(\w+[-/]\w+-?\w+-?\w+-?[A-Za-z0-9]+)/)[1];
    GM_xmlhttpRequest({
        method: 'GET',
        url: document.location + '/pictures',
        onload: function handleResponse(response) {
            const profileGallery = new DOMParser().parseFromString(response.responseText, 'text/html');
            const galleryPages = profileGallery.getElementById('pictures').getAttribute('data-total-pages');
            for (let j = 1; j <= galleryPages; j++) {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: document.location + '/pictures?p=false&page=' + j,
                    onload: function findImage(response) {
                        const imageList = new DOMParser().parseFromString(response.responseText, 'text/html');
                        const galleryImages = imageList.querySelector('#pictures').querySelectorAll('ul')[0].children;
                        for (let i = 0; i < galleryImages.length; i++) {
                            if (galleryImages[i].firstElementChild.firstElementChild.src.split(/^https:\/\/\w+.fetlife.com\/\w+\/\w+\/(\w+[-/]\w+-?\w+-?\w+-?[A-Za-z0-9]+)/)[1] === imgLink) {
                                document.querySelector('img.pan').parentElement.href = galleryImages[i].firstElementChild.href;
                            }
                        }
                    }
                });
            }
        }
    });
}
switch(returnPageType(document.location)) {
    case 'groupPage':
        adjustGroupPage();
        break;
    case 'subGroup':
        adjustSubGroupPage();
        break;
    case 'home':
        adjustHomePage();
        break;
    case 'profile':
        adjustProfile();
        break;
    default:
        break;
}
