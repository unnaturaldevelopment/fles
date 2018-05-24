// ==UserScript==
// @name        FetLife Enhancement Suite
// @namespace   https://fetlife.com/users/8366100
// @match       https://fetlife.com/*
// @version     1
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==
function returnPageType( pageLocation ) {
    const homeRE = RegExp('^https://fetlife.com/home.*$');
    const groupRE = RegExp('^https://fetlife.com/groups$');
    const groupSubRE = RegExp('^https://fetlife.com/groups/[0-9]*.*$');
    const settingsRE = RegExp('^https://fetlife.com/settings/.*$');
    if( groupRE.test(pageLocation) )
    {
        return 'groupPage'
    }
    else if( groupSubRE.test( pageLocation ) )
    {
        return 'subGroup'
    }
    else if( homeRE.test( pageLocation) )
    {
        return 'home'
    }
    else if( settingsRE.test( pageLocation ) )
    {
        return 'settings';
    }
    else {
        return 'all'
    }
}
function adjustGroupPage() {
    // Replace 'ago' with actual timestamp
    const timestampList = document.getElementsByClassName('refresh-timestamp');
    let listLength = timestampList.length;
    for( let i = 0; i < listLength; i++ ) {
        timestampList[i].textContent = 'on ' + timestampList[i].title
    }
    // Replace group href with redirect to new discussions instead of comments
    const groupListingList = document.getElementsByClassName('group_listing');
    listLength = groupListingList.length;
    for( let i = 0; i < listLength; i++ ) {
        groupListingList[i].href = groupListingList[i] + '?order=discussions'
    }
}
function adjustSubGroupPage() {
    // Replace 'ago' with actual timestamp
    const timestampList = document.getElementsByClassName('refresh-timestamp');
    let listLength = timestampList.length;
    for( let i = 0; i < listLength; i++ ) {
        if( timestampList[i].parentElement.parentElement.className !== 'sticky_line' ) {
            timestampList[i].textContent = 'updated on ' + timestampList[i].title
        }
    }
}
function adjustHomePage() {
    // TODO: Add functionality exclusively to home page
}
function adjustSettings() {
    const lastTabElement = document.getElementById('tab8');
    lastTabElement.insertAdjacentHTML('afterend','<li id="tab9"><button class="fles">FLES Settings</button></li>');
    GM_addStyle('button.fles{ outline: none; padding: 3px 5px; border: 1px solid #373737; background-color: #222; color: #888; border-bottom: none; font-weight: inherit; font-style: inherit; font-size: 100%; font-family: inherit;}'); // eslint-disable-line no-undef
    const buttonFLES = document.getElementsByClassName('fles')[0];
    buttonFLES.addEventListener('click', function( event ) { showSettings(event); });
    buttonFLES.addEventListener('mouseover', settingsMenuButtonMouseOverlistener);
    buttonFLES.addEventListener('mouseout', settingsMenuButtonMouseOutlistener);
}
function settingsMenuButtonMouseOverlistener(event) {
    event.target.style.backgroundColor = '#000';
}
function settingsMenuButtonMouseOutlistener(event) {
    event.target.removeAttribute('style');
}
function showSettings(event) {
    // Setup the FLES Settings Page
    document.title = 'FL Enhancement Suite Settings';
    document.getElementsByClassName('in_section')[0].removeAttribute('class');
    const divContainer = document.getElementsByClassName('container')[0];
    divContainer.querySelectorAll('div').forEach(function(element) {
        element.remove();
    });
    divContainer.querySelectorAll('#payments').forEach(function(element) {
        element.remove();
    });
    event.target.removeEventListener('mouseover', settingsMenuButtonMouseOverlistener);
    event.target.removeEventListener('mouseout', settingsMenuButtonMouseOutlistener);
    event.target.style.color = '#fff';
    event.target.style.fontWeight = '700';
    // Instantiate the containers
    divContainer.insertAdjacentHTML('beforeEnd','<div class="span-16 append-1"><fieldset><legend>FL Enhancement Suite Settings</legend></fieldset></div>');
    divContainer.insertAdjacentHTML('beforeEnd','<div class="span-7 small last"><br><h4>Q: What is the FL Enhancement Suite?</h4><p>A: The FL Enhancement Suite is a <a href="https://en.wikipedia.org/wiki/Userscript" target="_blank">UserScript</a> that can be added to the <a href="https://tampermonkey.net/" target="_blank">Tampermonkey</a> (or like) plug-in. The purpose of the script is to provide customization of the user interface built by the FetLife team. The script will <b>not</b> add functionality that is included when a user <a href="/support?ici=footer--support-fetlife&icn=support-fetlife" target="_blank">supports</a> FetLife.</p></div>');
    // Fill the containers
    const fieldSetElement = divContainer.querySelectorAll('fieldset')[0];
    fieldSetElement.insertAdjacentHTML('afterbegin','<table class="settings"><tbody><tr id="misc"><th class="section_header">Miscellaneous Options</th><th class="section_header">Enabled?</th></tr></tbody></table>');
    fieldSetElement.insertAdjacentHTML('afterbegin','<table class="settings"><tbody><tr id="timestamp_expansion"><th class="section_header">Timestamp Expansion</th><th class="section_header">Enabled?</th></tr></tbody></table>');
    const timeStampExpansionGroup = divContainer.querySelectorAll('#timestamp_expansion')[0];
    timeStampExpansionGroup.insertAdjacentHTML('afterend','<tr><td><label for="timestamp_group">Expand timestamps in individual Group Pages</label></td><td class="option"><input type="checkbox" id="timestamp_group" name="timestamp_group"/></td></tr>');
    timeStampExpansionGroup.insertAdjacentHTML('afterend','<tr><td><label for="timestamp_groups">Expand timestamps in main Groups Page</label></td><td class="option"><input type="checkbox" id="timestamp_groups" name="timestamp_groups"/></td></tr>');
    const miscGroup = divContainer.querySelectorAll('#misc')[0];
    miscGroup.insertAdjacentHTML('afterend','<tr><td><label for="group_new_discussion">Redirect to new discussions when visiting group</label></td><td class="option"><input type="checkbox" id="group_new_discussion" name="group_new_discussion"/></td></tr>');
    fieldSetElement.querySelectorAll('input').forEach(function(element) {
        element.addEventListener('input',processCheckbox);
        if( GM_getValue(element.id) ) element.setAttribute('checked', '');
    });
}
function processCheckbox(event) {
    GM_setValue(event.target.id, event.target.checked);
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
    case 'settings':
        adjustSettings();
        break;
    default:
        break;
}
