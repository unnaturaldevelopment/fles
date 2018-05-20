// ==UserScript==
// @name        FetLife Enhancement Suite
// @namespace   https://fetlife.com/users/3846707
// @description Show full date and time on some FetLife pages instead of relative time.
// @include     https://fetlife.com/home
// @include     https://fetlife.com/groups*
// @version     1
// @grant       none
// ==/UserScript==
function returnPageType( pageLocation ) {
    var groupRE = RegExp('^https://fetlife.com/groups$');
    var groupSubRE = RegExp('^https://fetlife.com/groups/[0-9]*.*$')
    if( groupRE.test(pageLocation) )
    {
        return 'groupPage'
    }
    else if( groupSubRE.test( pageLocation ) )
    {
        return 'subGroup'
    }
    else {
        return false
    }
};
function adjustGroupPage() {
    // Replace 'ago' with actual timestamp
    var timestampList = document.getElementsByClassName('refresh-timestamp');
    var listLength = timestampList.length;
    for( var i = 0; i < listLength; i++ ) {
        timestampList[i].textContent = 'on ' + timestampList[i].title
    }
    // Replace group href with redirect to new discussions instead of comments
    var groupListingList = document.getElementsByClassName('group_listing');
    listLength = groupListingList.length;
    for( i = 0; i < listLength; i++ ) {
        groupListingList[i].href = groupListingList[i] + '?order=discussions'
    }
};
function adjustSubGroupPage() {
    // Replace 'ago' with actual timestamp
    var timestampList = document.getElementsByClassName('refresh-timestamp');
    var listLength = timestampList.length;
    for( var i = 0; i < listLength; i++ ) {
        if( timestampList[i].parentElement.parentElement.className !== 'sticky_line' ) {
            timestampList[i].textContent = 'updated on ' + timestampList[i].title
        }
    }
}

switch(returnPageType(document.location)) {
    case 'groupPage':
        adjustGroupPage();
        break;
    case 'subGroup':
        adjustSubGroupPage();
        break;
    default:
        break;
};
