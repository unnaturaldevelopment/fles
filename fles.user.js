// ==UserScript==
// @name        FetLife Enhancement Suite
// @description Provide customization of the FetLife user interface
// @license     GPL-3.0-or-later
// @homepageURL https://github.com/unnaturaldevelopment/fles
// @supportURL  https://github.com/unnaturaldevelopment/fles/issues
// @version     1.7
// @updateURL   https://openuserjs.org/meta/unnaturaldeveloper/FetLife_Enhancement_Suite.meta.js
// @namespace   unnaturaldevelopment
// @match       https://fetlife.com/*
// @resource    normalize4ab3de5 https://cdn.rawgit.com/necolas/normalize.css/4ab3de5bdd26b161c3c82a5a2f72df3e57a8e4bf/normalize.css#md5=fda27b856c2e3cada6e0f6bfeccc2067,sha1=734a72e6c28d4a3a870404fb4abf72723c754296,sha512=faa0766a27f822e530f9cd2d1f9c3b8989abeefe8027e14b52aaf6c1faf732cf633fa2062926613b487807db84a418754ee3ede81a3c1cb593940157d6f71c65
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// ==/UserScript==
// ==OpenUserJS==
// @author unnaturaldeveloper
// ==/OpenUserJS==

'use strict';

function adjustGroup() {
    // Replace 'ago' with actual timestamp
    if( GM_getValue('timestamp_groups') ) {
        const timestampList = document.querySelectorAll('time.dn.dib-ns');
        let listLength = timestampList.length;
        for( let i = 0; i < listLength; i++ ) {
            timestampList[i].textContent = timestampList[i].title;
        }
    }

}
function adjustSubGroup() {
    // Replace 'ago' with actual timestamp
    if( GM_getValue('timestamp_group') ) {
        const timestampList = document.querySelectorAll('span.dn.di-ns.nowrap > time[data-smart-timestamp="time-ago"]');
        let listLength = timestampList.length;
        for( let i = 0; i < listLength; i++ ) {
            timestampList[i].textContent = timestampList[i].title;
        }
    }
}
function adjustGroupPost() {
    let isValidPage = false;
    if( document.querySelector( 'div.pagination') != null ) {
        if ( document.querySelector('div.pagination').innerText.match(/\d+/g) !== null ) {
            isValidPage = true;
        }
    }
    else {
        isValidPage = true;
    }

    // Enable multi-reply
    if( GM_getValue('multi-reply-in-subgroup') ) {
        if( isValidPage ) {
            const commentList = document.querySelectorAll('#comments > div[data-comment-deletable]');
            commentList.forEach(function (comment) {
                let replyLink = comment.querySelector('a[data-reply-name]')
                let linkSpacer = comment.querySelector('div.mh1.mid-gray').cloneNode(true)
                let multiReplyElement = replyLink.cloneNode(true);
                multiReplyElement.innerHTML = 'Multi-Reply';
                multiReplyElement.removeAttribute('href');
                multiReplyElement.removeAttribute('data-action');
                multiReplyElement.classList.add('fles-link', 'link', 'gray', 'hover-silver', 'pointer');
                multiReplyElement.addEventListener('click', multiReplyInsert);
                replyLink.parentElement.insertAdjacentElement('beforeEnd', linkSpacer);
                replyLink.parentElement.insertAdjacentElement('beforeEnd', multiReplyElement);
            });
        }
    }

    // Add reply to original poster in group discussion
    if( GM_getValue('reply-to-op-in-subgroup') ) {
        // Regex to the rescue!
        if( isValidPage ) {
            const linkDiv = document.querySelector('div.vh-100 > div.relative.min-h-100.pb7 > div.w-100.center.ph4-l.mw1260.ph0.ph3-ns.pt4' +
                '> div.flex.flex-column.flex-row-l > main.flex-auto.tl.w-100.pr3-l.pr15-xl > div.w-100.br1.bg-near-black > div.ph3.ph4-ns.pv4.flex.justify-center.br1-ns.relative' +
                '> div.mw42.w-100.tl.relative > div.pt15.f6');
            const replyLink = '<a id="reply-to-op-in-subgroup" class="link gray hover-silver">Reply</a>';
            linkDiv.insertAdjacentHTML('beforeEnd', replyLink);
            linkDiv.querySelector('a#reply-to-op-in-subgroup').addEventListener('click', multiReplyInsert);
        }
    }

    // Enable viewing of image inline
    if( GM_getValue('inline-image-in-subgroup') ) {
        const linkDiv = document.querySelector('div.vh-100 > div.relative.min-h-100.pb7 > div.w-100.center.ph4-l.mw1260.ph0.ph3-ns.pt4' +
            '> div.flex.flex-column.flex-row-l > main.flex-auto.tl.w-100.pr3-l.pr15-xl > section.pt4.mt3-ns.ph0-ns.ph3' +
            '> div.bb.b--primary');
        const toggleInlineButtonThread = '<a id="fles-group-enable-inline-image-thread" class="link gray hover-silver">View images in thread</a>';
        linkDiv.insertAdjacentHTML('beforeEnd',toggleInlineButtonThread);
        linkDiv.querySelector('a#fles-group-enable-inline-image-thread').addEventListener('click',function(){ toggleInlineImage(); });

    }

    // Add ability to quote via copy/paste
    if( GM_getValue('quote-in-group') ) {
        const postBody = document.querySelector('div.story__copy.bigger.pt15');
        postBody.addEventListener('copy', function () {
            GM_setValue('text-to-quote', window.getSelection().toString());
        });
        const comments = document.querySelectorAll('div#comments');
        comments.forEach(function (comment) {
            comment.addEventListener('copy', function () {
                GM_setValue('text-to-quote', window.getSelection().toString());
            });
        });
    }
}
function multiReplyInsert(Event) {
    let pName = '';
    if(Event.target.text === 'Reply')
    {
        pName = Event.target.parentNode.parentNode.querySelector('a.link.gray.hover-silver.underline.mr1').innerText;
    }
    else if(Event.target.text === 'Multi-Reply')
    {
        pName = Event.target.getAttribute('data-nickname');
    }
    else if(Event.target.text === 'Mention') {
        pName = Event.target.ownerDocument.querySelector('a.link.mr1.mr0-l.f4-ns.f5.secondary.underline-hover.nowrap').innerHTML;
    }

    let commentBox = document.querySelector('textarea#markdown-editor')
    commentBox.focus();

    let existingComment = commentBox.value;
    if( Event.target.text === 'Mention' ) existingComment = '';

    let textToQuote = GM_getValue('text-to-quote');

    if(typeof textToQuote == 'undefined' || textToQuote === '')
    {
        commentBox.value = existingComment + '@' + pName + ' ';
    }
    else {
        textToQuote = textToQuote.replace(/^(\S.*)/gm,'> $1');
        commentBox.value = existingComment + textToQuote + ' -';
        commentBox.value = commentBox.value + ' @' + pName + '\n';
        GM_setValue('text-to-quote','');
    }
}
function toggleInlineImage() {
    const pictureRE = RegExp('^https://fetlife.com/users/[0-9]*/pictures/[0-9]*$');
    let imageList = document.querySelectorAll('div#comments a.content-link');
    imageList.forEach(function(image){
        let imageLink = image.getAttribute('href');
        if( pictureRE.test(imageLink))
        {
            GM_xmlhttpRequest({
                method: 'GET',
                url: imageLink,
                onload: function handleResponse(response) {
                    if( response.finalUrl === imageLink ) {
                        const imageDOM = new DOMParser().parseFromString(response.responseText, 'text/html');
                        let imgSrc = imageDOM.querySelector('main div img.ipp.center[src]')
                        image.textContent = '';
                        image.insertAdjacentElement('afterBegin', imgSrc);
                    }
                }
            });
        }
    });
}
function adjustProfile() {
    // Enable redirection of click on avatar to full image in gallery
    if (GM_getValue('redirect_avatar_to_gallery')) {
        const imgLink = document.querySelector('img.pan').src.split(/^https:\/\/pic-\w+-\d.fetlife.com\/[0-9]+\/([0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12})\/\w+\d+.jpg/)[1];
        GM_xmlhttpRequest({
            method: 'GET',
            url: window.location.href + '/pictures',
            onload: function handleResponse(response) {
                const profileGallery = new DOMParser().parseFromString(response.responseText, 'text/html');
                const galleryImages = profileGallery.querySelector('span.gray').innerText.split(/\((\d+)\)/)[1]
                const galleryPages = Math.ceil(galleryImages / 30)
                for (let j = 1; j <= galleryPages; j++) {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: window.location.href + '/pictures?page=' + j,
                        onload: function findImage(response) {
                            const imageList = new DOMParser().parseFromString(response.responseText, 'text/html');
                            const galleryImages = imageList.querySelectorAll('main > div.flex-wrap img.object-cover')
                            for (let i = 0; i < galleryImages.length; i++) {
                                if (galleryImages[i].src.split(/^https:\/\/pic-\w+-\d.fetlife.com\/[0-9]+\/([0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12})\/\w+\d+.jpg/)[1] === imgLink) {
                                    document.querySelector('img.pan').parentElement.href = galleryImages[i].parentNode.parentNode.parentNode.href;
                                }
                            }
                        }
                    });
                }
            }
        })
    }

    // Enable links to friends/followers/following from profile page
    if (GM_getValue('clickable_friend_categories')) {
        const friendCats = document.querySelectorAll('div#profile ul.friends');
        friendCats.forEach(function (category) {
            let elementText = category.previousElementSibling.textContent;
            let newRef = window.location.href;
            if (elementText.match('^Friends')) {
                newRef = newRef + '/friends';
            } else if (elementText.match('^Followers')) {
                newRef = newRef + '/followers';
            } else if (elementText.match('^Following')) {
                newRef = newRef + '/following';
            } else if (elementText.match('^Mutual Friends')) {
                newRef = newRef + '/friends/mutual';
            }
            category.previousElementSibling.outerHTML = '<a href="' + newRef + '">' + category.previousElementSibling.outerHTML + '</a>';
        });
    }

    // Identify common kinks, and highlight
    if (GM_getValue('common_kink_highlight')) {
        let myFetId = unsafeWindow.FL.user.id;
        let currentProfileId = window.location.href.split(/users\/([0-9]+)/)[1];
        let kinkList = {};
        if (GM_getValue('common_kink_highlight-color')) {
            GM_addStyle('span.fles-kink { color:' + GM_getValue('common_kink_highlight-color') + ';}');
        }
        let DOMsection = document.querySelectorAll('div.content_container div#profile div.container div.border div h3.bottom');
        DOMsection.forEach(function (header) {
            if (header.innerText.match(/^Fetishes/)) {
                let iteratorHack = header.nextElementSibling;
                while (iteratorHack) {
                    if (iteratorHack.outerHTML == '<br>') {
                        break;
                    } else {
                        let listCategoryElement = iteratorHack.querySelector('p span > em');
                        let listCategory = listCategoryElement.innerText.slice(0, -1);
                        let listItemElements = listCategoryElement.parentElement.parentElement.querySelectorAll('a');
                        if (myFetId.toString() == currentProfileId.toString()) {
                            let myKinks = [];
                            listItemElements.forEach(function (itemElement) {
                                myKinks.push(itemElement.innerText);
                            });
                            kinkList[listCategory] = myKinks;
                        } else {
                            let myKinks = JSON.parse(GM_getValue('myKinkList'));
                            listItemElements.forEach(function (itemElement) {
                                if (myKinks[listCategory].includes(itemElement.innerText)) {
                                    itemElement.innerHTML = '<span class="fles-kink">' + itemElement.innerHTML + '</span>';
                                }
                            });
                            if (listCategory.match(/limit/)) {
                                let limits = listCategoryElement.parentElement.parentElement.innerText.split(/:([\w\W]+)/)[1].split(',');
                                limits.forEach(function (limit) {
                                    if (listCategory in myKinks && myKinks[listCategory].includes(limit.trim())) {
                                        listCategoryElement.parentElement.parentElement.innerHTML =
                                            listCategoryElement.parentElement.parentElement.innerHTML.replace(limit.trim(), '<span class="fles-kink">' + limit.trim() + '</span>');
                                    }
                                });
                            }
                        }
                    }
                    iteratorHack = iteratorHack.nextElementSibling;
                }
                if (myFetId.toString() == currentProfileId.toString()) {
                    GM_setValue('myKinkList', JSON.stringify(kinkList));
                }
            }
        });
    }

    // Mutual followers should be friends
    if (GM_getValue('show_mutual_followers')) {
        let myFetId = unsafeWindow.FL.user.id;
        let currentProfileId = window.location.href.split(/users\/([0-9]+)/)[1];
        let cacheTime = GM_getValue('mutual_follower_cache_time', false);
        let nowTime = Date.now()
        if (myFetId.toString() == currentProfileId) {
            if (cacheTime == false || nowTime >= (cacheTime + 3600000)) {
                GM_setValue('mutual_follower_cache_time', nowTime)
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: window.location.href + '/followers',
                    onload: function (response) {
                        cacheList(response);
                    }
                });
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: window.location.href + '/following',
                    onload: function (response) {
                        cacheList(response);
                    }
                });
            }
            let followers = GM_getValue('followers');
            let following = GM_getValue('following');
            if (followers && following) {
                const lastElement = document.querySelector('div.span-5 p.more');
                lastElement.insertAdjacentHTML('beforeBegin', '<br><h4>Mutual Followers</h4><ul id="fles-mutual-followers" class="friends clearfix"></ul>');
                const mutualFollowerElement = document.querySelector('ul#fles-mutual-followers');
                followers = JSON.parse(followers);
                following = JSON.parse(following);

                Object.keys(followers).forEach(function (key) {
                    if (key in following) {
                        mutualFollowerElement.insertAdjacentHTML('afterBegin',
                            '<a href="https://fetlife.com/' + key + '">' +
                            '<li>' +
                            '<img ' +
                            'alt="' + key + '" ' +
                            'title="' + key + '" ' +
                            'width="32" height="32" class="avatar profile_avatar" src="' + following[key] + '"></li>');
                    }
                });
            }
        }
    }

    // Move writings link under profile avatar pic
    if( GM_getValue('add_writings_link')) {
        let h4List = document.querySelectorAll('div.span-5 h4');
        h4List.forEach(function(member){
            if(member.innerHTML.match(/Writing/g)) {
                const linksDiv = document.querySelector('div#main_content div.span-6 div.center.smaller');
                linksDiv.classList.remove('center');
                linksDiv.insertAdjacentHTML('afterEnd','<div class="smaller"><a href="'+ window.location.href + '/posts">view writings</a></div>');
            }
        });
    }
}

function cacheList(response)
{
    const baseUrl = response.finalUrl;
    const pageDOM = new DOMParser().parseFromString(response.responseText, 'text/html');
    let nextPageElement = pageDOM.querySelector('.next_page');
    let totalCountElement = pageDOM.querySelector('span.dib-ns:nth-child(1)');
    let totalCount = totalCountElement.innerText.split(/(?:\d+ - \d+ of )(\d+)/)[1];
    let totalPages = 1;
    let list = {
        memberList: {},
        listCount: 0,
        addMember: function(key, value) {
            this.memberList[key] = value;
            this.listCount += 1;
        },
        saveList: function(key) {
            GM_setValue(key.split('/')[5],JSON.stringify(this.memberList));
        },
        isComplete: function(total) {
            if( total == this.listCount ){
                return true;
            }
            else {
                return false;
            }
        }
    };

    if( nextPageElement !== null ) {
        totalPages = nextPageElement.previousElementSibling.innerHTML;
    }

    while( totalPages >= 1 )
    {
        let loopUrl = baseUrl + '?page=' + totalPages;
        GM_xmlhttpRequest({
            method: 'GET',
            url: loopUrl,
            onload: function (response) {
                if (response.status == 200) {
                    const pageDOM = new DOMParser().parseFromString(response.responseText, 'text/html');
                    let memberImages = pageDOM.querySelectorAll('main div.w-50-ns.w-100.ph1 img')
                    memberImages.forEach(function (memberImage) {
                        let memberName = memberImage.parentElement.parentElement.parentElement.lastChild.firstChild.firstChild.innerText;
                        let imageSrc = memberImage.src;
                        list.addMember(memberName,imageSrc);
                        if( list.isComplete(totalCount) === true ){
                            list.saveList(baseUrl);
                        }
                    });
                }
            }
        });
        totalPages -= 1;
    }
}

function cacheWritings(response) {
    // Retrieve total count of posts and pages
    const baseUrl = response.finalUrl;
    const pageDOM = new DOMParser().parseFromString(response.responseText, 'text/html');
    const postsJSON = JSON.parse(pageDOM.firstChild.innerText);
    let totalCount = postsJSON.paging.total_entries;
    let totalPages = postsJSON.paging.total_pages;

    // Build a JSON object in FLES with all posts for user
    // Post object will look like this
    // let post[id] = {writing_type, time_to_read, title};
    let list = {
        postList: {},
        listCount: 0,
        addPost: function(key, value) {
            this.postList[key] = value;
            this.listCount += 1;
        },
        saveList: function(key) {
            GM_setValue(key,JSON.stringify(this.postList));
        },
        isComplete: function(total) {
            if( total == this.listCount ){
                return true;
            }
            else {
                return false;
            }
        }
    }
    let curPage = 1;
    while( curPage <= totalPages ){
        let loopUrl = baseUrl + '?page=' + curPage;
        GM_xmlhttpRequest({
            method: 'GET',
            url: loopUrl,
            onload: function (response) {
                if (response.status == 200) {
                    const pageDOM = new DOMParser().parseFromString(response.responseText, 'text/html');
                    const postsJSON = JSON.parse(pageDOM.firstChild.innerText);
                    for(let i = 0; i < postsJSON.entries.length; i++){
                        let post = { "writing_type": postsJSON.entries[i].writing_type,
                                "time_to_read": postsJSON.entries[i].time_to_read,
                                "title": postsJSON.entries[i].title };
                        list.addPost(postsJSON.entries[i].id,post);
                        if( list.isComplete(totalCount) === true ){
                            list.saveList("writings");
                        }
                    }
                }
            }
        });
        curPage+=1;
    }
}

function adjustPosts() {
    // Build writings index
    if( GM_getValue('build_writings_index') ) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: window.location.href,
            onload: function (response) {
                cacheWritings(response);
            }
        });
    }
    if( GM_getValue('build_writings_index') && GM_getValue('writings') ) {
        const linkNav = document.querySelector('div.truncate')
        linkNav.insertAdjacentHTML('beforeend', '<span class="dib mh1 mid-gray">·</span>');
        linkNav.insertAdjacentHTML('beforeend', '<a class="dib gray link hover-silver" title="Show writings index">Writings Index</a>');
        const postsJSON = JSON.parse(GM_getValue('writings'));
        const indexElement = document.querySelector('a[title="Show writings index"]')
        indexElement.addEventListener('click', function () {
            const postBody = document.querySelector('.flex-row-l > main:nth-child(1) > div:nth-child(4)')
            const parentElement = postBody.parentElement;
            const writingsBody = postBody.parentElement.removeChild(postBody);
            // Build table of posts
            parentElement.insertAdjacentHTML("afterbegin", '<div id="writings_index"></div>')
            const indexDiv = document.querySelector('div#writings_index');
            indexDiv.insertAdjacentHTML('afterbegin', '<table id="writings_index"></table>');
            const indexTable = document.querySelector('table#writings_index');
            indexTable.insertAdjacentHTML('afterbegin', '<tr><th>Title</th></td><th>Writing Type</th><th>Time to Read</th></tr>');
            for (let post in postsJSON) {
                indexTable.insertAdjacentHTML('beforeend', `<tr><td><a class="content-link" href=${document.URL}/${post}>${postsJSON[post].title}</a></td><td>${postsJSON[post].writing_type}</td><td>${postsJSON[post].time_to_read}</td></tr>`);
            }
        })
    }
}
function adjustNewConv() {
    // Enable automatic message box cursor placement for new messages
    if( GM_getValue('pm_message_box_cursor_new')) {
        const messageBox = document.querySelector('form input#subject');
        messageBox.focus();
    }
}
function adjustInbox() {
    // Listen for turbolinks:click to conversation#new-message
    const convRE = RegExp('https://fetlife.com/conversations/[0-9]*.*$');
    document.addEventListener('turbolinks:load',function(){
        if(convRE.test(window.location.href)) {
            adjustExistingConv();
        }
        addFlesSettings();
    });
}

function addFlesSettings(){
    // asterisk icon courtesy of https://fontawesome.com
    // Usage license: https://fontawesome.com/license
    const asteriskIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
        '<path d="M478.21 334.093L336 256l142.21-78.093c11.795-6.477 15.961-21.384 ' +
        '9.232-33.037l-19.48-33.741c-6.728-11.653-21.72-15.499-33.227-8.523L296 186.718l3.475-162.204C299.763 11.061 ' +
        '288.937 0 275.48 0h-38.96c-13.456 0-24.283 11.061-23.994 24.514L216 186.718 77.265 ' +
        '102.607c-11.506-6.976-26.499-3.13-33.227 8.523l-19.48 33.741c-6.728 11.653-2.562 26.56 9.233 33.037L176 256 ' +
        '33.79 334.093c-11.795 6.477-15.961 21.384-9.232 33.037l19.48 33.741c6.728 11.653 21.721 15.499 33.227 ' +
        '8.523L216 325.282l-3.475 162.204C212.237 500.939 223.064 512 236.52 512h38.961c13.456 0 24.283-11.061 ' +
        '23.995-24.514L296 325.282l138.735 84.111c11.506 6.976 26.499 3.13 33.227-8.523l19.48-33.741c6.728-11.653 ' +
        '2.563-26.559-9.232-33.036z"/></svg>';

    let notifyBar = document.querySelector('body nav div.self-end ul.list li a[href="/search"]');
    if( notifyBar !== null )
    {
        // /inbox and /conversations/.* are using a new responsive design for the navbar... compensating
        notifyBar = notifyBar.parentElement;
        const flesNavElement = notifyBar.cloneNode(false);
        const flesNavAnchor = notifyBar.firstElementChild.cloneNode(false);
        flesNavAnchor.id = 'fles-settings';
        flesNavAnchor.removeAttribute('href');
        flesNavAnchor.insertAdjacentHTML('afterBegin',asteriskIcon);
        flesNavElement.insertAdjacentElement('afterBegin',flesNavAnchor);
        notifyBar.insertAdjacentElement('beforeBegin',flesNavElement);
        notifyBar = notifyBar.parentElement; // Necessary hack to find the FLES icon
    }
    else {
        notifyBar = document.querySelector('div.fl-nav__right-hand-wrapper div.fl-nav__notifications-wrapper');
        notifyBar.insertAdjacentHTML('beforeEnd', '<a id="fles-settings" class="fl-nav__notification fl-nav__icon ' +
            'knockout-bound" title="FLES Settings">' + asteriskIcon + '</a>');
    }
    GM_addStyle(
        'a#fles-settings { display: block !important; }' +
        'div#fles-menu { box-sizing: content-box !important; position: fixed; ' +
            'display: none; flex-direction: column; top: 1%; left: 1%; right: 1%; height: 75%; padding: 1%; ' +
            'border: solid 2px #CC0000; ' + 'border-radius: 10px; background-color: rgba(0,0,0,0.9); ' +
            'z-index: 100000000; } ');
    notifyBar.querySelector('a#fles-settings').addEventListener('click', openFlesSettings);
    document.querySelector('body').insertAdjacentHTML('beforeEnd', '<div id="fles-menu"</div>');
    const flesMenu = document.querySelector('div#fles-menu');
    flesMenu.insertAdjacentHTML('afterBegin','<div id="fles-header"></div><div id="fles-content"></div><div id="fles-footer"></div>');
    const flesHeader = document.querySelector('div#fles-header');
    const flesFooter = document.querySelector('div#fles-footer');
    flesHeader.insertAdjacentHTML('afterBegin','<h1 id="fles-header">FetLife Enhancement Suite</h1>');
    flesFooter.insertAdjacentHTML('beforeEnd', '<button id="fles-close" class="fles-button">Close Settings</button>');
    flesFooter.querySelector('button#fles-close').addEventListener('click',function(){
        flesMenu.style.display = 'none';
        document.getElementById('fles-menu-normalize').parentElement.removeChild(document.getElementById('fles-menu-normalize'));
        document.querySelector('a#fles-settings').addEventListener('click', openFlesSettings);
    });
    const flesContent = document.querySelector('div#fles-content');
    flesContent.insertAdjacentHTML('afterBegin', '<div id="fles-toc"><ul id="fles-toc-list">' +
        '<li id="fles-toc-about"><h3 class="fles-toc-h3">About FLES</h3></li>' +
        '<li id="fles-global"><h3 class="fles-toc-h3">Global Features</h3></li>' +
        '<li id="fles-toc-localization"><h3 class="fles-toc-h3">Localization</h3></li>' +
        '<li id="fles-toc-profiles"><h3 class="fles-toc-h3">Profiles</h3></li>' +
        '<li id="fles-toc-groups"><h3 class="fles-toc-h3">Groups</h3></li>' +
        '<li id="fles-toc-messaging"><h3 class="fles-toc-h3">Messaging</h3></li>' +
        '</ul></div>');
    const flesTocList = document.querySelector('ul#fles-toc-list');
    flesTocList.querySelectorAll('li').forEach(function(listElement) {
       listElement.addEventListener('click',switchSetting);
    });
    flesContent.insertAdjacentHTML('beforeEnd','<div id="fles-body"><p>Thanks for choosing FLES!</p></div>');
}

function openFlesSettings() {
    // Set up normalization style sheet
    const htmlHead = document.querySelector('html head');
    htmlHead.insertAdjacentHTML('beforeEnd','<style id="fles-menu-normalize">' + GM_getResourceText('normalize4ab3de5') + '</style>');

    // Set up FLES style sheet
    GM_addStyle(
        'div#fles-header { display: inherit; margin: 1%; flex: 0 0 70px; } ' +
        'div#fles-content { display: inherit; flex: 0 0 230px; } ' +
        'div#fles-footer { display: inherit; flex: 0 0 50px; justify-content: flex-end; } ' +
        'div#fles-toc { } ' +
        'div#fles-body { margin: 1em; } ' +
        'div#fles-body p { margin: 0; } ' +
        'table#fles-settings { width: auto; margin: 1em; vertical-align: middle; border-collapse: separate; ' +
            'border-spacing: 0; } ' +
        'table#fles-settings th.section_header { border-bottom: 1px solid #555; font-weight: normal; ' +
            'vertical-align: top; padding: 4px 10px 4px 5px; } ' +
        'table#fles-settings td { padding: 4px 10px 4px 5px; vertical-align: middle; text-align: left; ' +
            'font-weight: normal; } ' +
        'table#fles-settings td.option { text-align: center; padding: 4px 10px 4px 5px; vertical-align: middle; ' +
            'font-weight: normal; } ' +
        'button.fles-button { margin: 1%; border-color: black; border-radius: 5px; background-color: #777; } ' +
        'button#fles-close { } ' +
        'ul#fles-toc-list { list-style-type: none; } ' +
        'ul#fles-toc-list > li { margin-top: 10%; cursor: pointer; } ' +
        'h1#fles-header { line-height: 36px; font-family: serif; font-weight: bold; font-size: 2em; ' +
            'letter-spacing: 0px; color: #CC0000; text-decoration: underline; text-decoration-color: #777; } ' +
        'h3.fles-toc-h3 { margin: 0; padding: 0; line-height: 26px; font-size: 26px; font-weight: normal; ' +
            'letter-spacing: -1px; color: #777; } ' +
        'h3.fles-toc-h3-active { color: #FFF; }');

    document.querySelector('a#fles-settings').removeEventListener('click', openFlesSettings);
    document.querySelector('div#fles-menu').style.display = 'flex';
}

function addCheckboxEvent(optionNode)
{
    optionNode.querySelectorAll('input[type=checkbox]').forEach(function(element) {
        element.addEventListener('change', processCheckbox);
        if (GM_getValue(element.id)) element.setAttribute('checked', '');
    });

    optionNode.querySelectorAll('input[type=color]').forEach(function(element) {
        element.addEventListener('change', processColor);
        if (GM_getValue(element.id)) element.setAttribute('value', GM_getValue(element.id));
    });
}

function processCheckbox(event) {
    GM_setValue(event.target.id, event.target.checked);
}

function processColor(event) {
    GM_setValue(event.target.id, event.target.value);
}

function switchSetting() {
    let h3ActiveNode = this.parentElement.parentElement.querySelector('h3.fles-toc-h3-active');
    if( h3ActiveNode ) {
        h3ActiveNode.classList.remove('fles-toc-h3-active');
    }
    this.firstElementChild.classList.add('fles-toc-h3-active');
    const flesBody = document.querySelector('div#fles-body');

    switch( this.id ) {
        case 'fles-toc-about' : {
            let aboutNode = document.createElement('span');
            aboutNode.insertAdjacentHTML('afterBegin', '<h4>Q: What is the FL Enhancement Suite?</h4><p>A: The FL Enhancement Suite is a <a href="https://en.wikipedia.org/wiki/Userscript" target="_blank">UserScript</a> that can be added to the <a href="https://tampermonkey.net/" target="_blank">Tampermonkey</a> (or like) plug-in. The purpose of the script is to provide customization of the user interface built by the FetLife team. The script will <b>not</b> add functionality that is included when a user <a href="/support?ici=footer--support-fetlife&icn=support-fetlife" target="_blank">supports</a> FetLife.</p>');
            if (flesBody.firstElementChild) {
                flesBody.replaceChild(aboutNode, flesBody.firstElementChild);
            }
            else flesBody.appendChild(aboutNode);
            addCheckboxEvent(aboutNode);
            break;
        }
        case 'fles-toc-localization': {
            let localNode = document.createElement('span');
            localNode.insertAdjacentHTML('afterBegin', '<p>The settings below are designed to improve the localized aspect of your FetLife user experience by adjusting datestamps, timezones, and other like attributes.</p>');
            localNode.insertAdjacentHTML('beforeEnd', '<table id="fles-settings"><tbody><tr id="timestamp_expansion"><th class="section_header">Timestamp Expansion</th><th class="section_header">Enabled?</th></tr>' +
                '<tr><td><label for="timestamp_group">Expand timestamps in individual Group Pages</label></td><td class="option"><input type="checkbox" id="timestamp_group" name="timestamp_group"/></td></tr>' +
                '<tr><td><label for="timestamp_groups">Expand timestamps in main Groups Page</label></td><td class="option"><input type="checkbox" id="timestamp_groups" name="timestamp_groups"/></td></tr>' +
                '</tbody></table>');
            if (flesBody.firstElementChild) {
                flesBody.replaceChild(localNode, flesBody.firstElementChild);
            }
            else flesBody.appendChild(localNode);
            addCheckboxEvent(localNode);
            break;
        }
        case 'fles-toc-profiles': {
            let profileNode = document.createElement('span');
            profileNode.insertAdjacentHTML('afterBegin','<p>The settings below are designed to improve an aspect of profile pages.</p>');
            profileNode.insertAdjacentHTML('beforeEnd', '<table id="fles-settings"><tbody><tr id="profile_changes"><th class="section_header">Profile Page Modifications</th><th class="section_header">Enabled?</th></tr>' +
                '<tr><td><label for="redirect_avatar_to_gallery">Redirect click on avatar to full image in gallery</label></td><td class="option"><input type="checkbox" id="redirect_avatar_to_gallery" name="redirect_avatar_to_gallery"/></td></tr>' +
                '<tr><td><label for="clickable_friend_categories">Enable clickable links for friends/followers/following categories</label></td><td class="option"><input type="checkbox" id="clickable_friend_categories" name="clickable_friend_categories"/></td></tr>' +
                '<tr><td><label for="common_kink_highlight">Highlight common kinks</label></td><td class="option"><input type="checkbox" id="common_kink_highlight" name="common_kink_highlight"/></td></tr>' +
                '<tr><td><label for="common_kink_highlight-color">Highlight color for common kinks</label></td><td class="option"><input type="color" id="common_kink_highlight-color" name="common_kink_highlight-color"/><td></tr>' +
                '<tr><td><label for="show_mutual_followers">Show Mutual Followers</label></td><td class="option"><input type="checkbox" id="show_mutual_followers" name="show_mutual_followers"/></td></tr>' +
                '<tr><td><label for="add_writings_link">Add writings link under avatar</label></td><td class="option"><input type="checkbox" id="add_writings_link" name="add_writings_link"/></td></tr>' +
                '<tr><td><label for="build_writings_index">Generate index of writings</label></td><td class="option"><input type="checkbox" id="build_writings_index" name="build_writings_index"</td></tr>' +
                '</tbody></table>');
            if( flesBody.firstElementChild ) {
                flesBody.replaceChild(profileNode, flesBody.firstElementChild);
            }
            else flesBody.appendChild(profileNode);
            addCheckboxEvent(profileNode);
            break;
        }
        case 'fles-toc-groups': {
            let groupNode = document.createElement('span');
            groupNode.insertAdjacentHTML('afterBegin','<p>The settings below are designed to improve an aspect of group pages.</p>');
            groupNode.insertAdjacentHTML('beforeEnd', '<table id="fles-settings"><tbody>' +
                '<tr id="group_options"><th class="section_header">Group Options</th><th class="section_header">Enabled?</th></tr>' +
                '<tr><td><label for="inline-image-in-subgroup">Enable ability to toggle inline images in group discussion</label></td><td class="option"><input type="checkbox" id="inline-image-in-subgroup" name="inline-image-in-subgroup"/></td></tr>' +
                '<tr><td><label for="multi-reply-in-subgroup">Enable multi-reply in group discussion</label></td><td class="option"><input type="checkbox" id="multi-reply-in-subgroup" name="multi-reply-in-subgroup"/></td></tr>' +
                '<tr><td><label for="reply-to-op-in-subgroup">Enable ability to reply to the original poster in a group discussion</label></td><td class="option"><input type="checkbox" id="reply-to-op-in-subgroup" name="reply-to-op-in-subgroup"/></td></tr>' +
                '<tr><td><label for="quote-in-group">Enable ability to quote directly into the message box via copy</label></td><td class="option"><input type="checkbox" id="quote-in-group" name="quote-in-group"/></td></tr>' +
                '</tbody></table>');
            if( flesBody.firstElementChild ) {
                flesBody.replaceChild(groupNode, flesBody.firstElementChild);
            }
            else flesBody.appendChild(groupNode);
            addCheckboxEvent(groupNode);
            break;
        }
        case 'fles-toc-messaging': {
            let messageNode = document.createElement('span');
            // pm_message_box_cursor
            messageNode.insertAdjacentHTML('afterBegin','<p>The settings below are designed to improve an aspect of the private messaging interface.</p>');
            messageNode.insertAdjacentHTML('beforeEnd', '<table id="fles-settings"><tbody>' +
                '<tr id="pm_options"><th class="section_header">Private Message Options</th><th class="section_header">Enabled?</th></tr>' +
                '<tr><td><label for="pm_message_box_cursor_new">Enable automatic message box cursor placement for new message</label></td><td class="option"><input type="checkbox" id="pm_message_box_cursor_new" name="pm_message_box_cursor_new"/></td></tr>' +
                '</tbody></table>');
            if( flesBody.firstElementChild ) {
                flesBody.replaceChild(messageNode, flesBody.firstElementChild);
            }
            else flesBody.appendChild(messageNode);
            addCheckboxEvent(messageNode);
            break;
        }
        case 'fles-global': {
            let messageNode = document.createElement('span');
            // pm_message_box_cursor
            messageNode.insertAdjacentHTML('afterBegin','<p>The settings below are global features that effect all pages.</p>');
            messageNode.insertAdjacentHTML('beforeEnd', '<table id="fles-settings"><tbody>' +
                '<tr id="pm_options"><th class="section_header">Global Features</th><th class="section_header">Enabled?</th></tr>' +
                '</tbody></table>');
            if( flesBody.firstElementChild ) {
                flesBody.replaceChild(messageNode, flesBody.firstElementChild);
            }
            else flesBody.appendChild(messageNode);
            addCheckboxEvent(messageNode);
            break;
        }
    }
}

// Add FLES Settings to all pages
addFlesSettings();
GM_addStyle('a.fles-link { cursor: pointer; } span.fles-kink { color: #CC0000; font-weight: 800; }');

// Page handling
const groupsRE = new RegExp('^https://fetlife.com/groups$');
const groupSubRE = new RegExp('^https://fetlife.com/groups/[0-9]*.*$');
const groupPostRE = new RegExp('^https://fetlife.com/groups/[0-9]*/posts/[0-9]*');
const profileRE = new RegExp('^https://fetlife.com/users/[0-9]*$');
const pictureRE = new RegExp('^https://fetlife.com/users/[0-9]*/pictures/[0-9]*$');
const postsRE = new RegExp('^https://fetlife.com/users/[0-9]*/posts$');
const convNewRE = new RegExp('^https://fetlife.com/conversations/new.*$');
const inboxRE = new RegExp('^https://fetlife.com/inbox.*$');
const exploreRE = new RegExp('^https://fetlife.com/explore/#/$');
const pageLocation = window.location.href;

switch(pageLocation) {
    case (pageLocation.match(groupPostRE) || {}).input:
        adjustGroupPost();
        break;
    case (pageLocation.match(groupSubRE) || {}).input:
        adjustSubGroup();
        break;
    case (pageLocation.match(groupsRE) || {}).input:
        adjustGroup();
        break;
    case (pageLocation.match(profileRE) || {}).input:
        adjustProfile();
        break;
    case (pageLocation.match(postsRE) || {}).input:
        adjustPosts();
        break;
    case (pageLocation.match(convNewRE) || {}).input:
        adjustNewConv();
        break;
    case (pageLocation.match(inboxRE) || {}).input:
        adjustInbox();
        break;
    case (pageLocation.match(exploreRE) || {}).input:
        break;
}
