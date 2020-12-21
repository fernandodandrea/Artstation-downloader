var SLASH = '/';

Array.prototype.remove = function(value) {
  if (this.indexOf(value) !== -1) {
    this.splice(this.indexOf(value), 1);
    return true;
  } else {
    return false;
  }
};

Array.prototype.removeDuplicates = function() {
  var temp=[];
  this.sort();
  for(i = 0; i < this.length; i++){
    if(this[i] === this[i + 1]) {continue}
    temp[temp.length] = this[i];
  }
  return temp;
};

var ad_regDownloadTabs = [];
var ad_path = localStorage["ad-path"];
var ad_saveJson = (localStorage["ad-save-json"] === 'true');
var ad_artistFolder = (localStorage["ad-artist-folder"] === 'true');
var ad_artworkFolder = (localStorage["ad-artwork-folder"] === 'true');
var ad_artworkRename = (localStorage["ad-artwork-rename"] === 'true');
function UpdateConfigs(){
  ad_path = localStorage["ad-path"];
  ad_saveJson = (localStorage["ad-save-json"] === 'true');
  ad_artistFolder = (localStorage["ad-artist-folder"] === 'true');
  ad_artworkFolder = (localStorage["ad-artwork-folder"] === 'true');
  ad_artworkRename = (localStorage["ad-artwork-rename"] === 'true');
  if (ad_path === undefined) { ad_path = 'ArtstationDownloader'; }
  if (ad_path === '') { ad_path = 'ArtstationDownloader'; }
  if (!ad_saveJson) ad_saveJson = false;
  if (!ad_artistFolder) ad_artistFolder = false;
  if (!ad_artworkFolder) ad_artworkFolder = false;
  if (!ad_artworkRename) ad_artworkRename = false;
}
UpdateConfigs();

function cleanupRegTabs() {
//  ad_regDownloadTabs = ad_regDownloadTabs.filter(function(item, pos) {
//    return ad_regDownloadTabs.indexOf(item) === pos;
//  });
  ad_regDownloadTabs = ad_regDownloadTabs.removeDuplicates();
}

chrome.runtime.onMessage.addListener (
  function(request, sender, sendResponse) {
    if (request.message === 'ack') {
      ad_regDownloadTabs.push(sender.tab.id);
      cleanupRegTabs();
      //sendResponse ({message: 'ack'});
      chrome.browserAction.setBadgeText({'text': ad_regDownloadTabs.length.toString()});
      return false;
    }
    if (request.message === 'unload') {
      if (chrome.extension.lastError) {
        console.log('Error: ' + chrome.runtime.lastError.message);
      }
      ad_regDownloadTabs.remove(sender.tab.id);
      chrome.browserAction.setBadgeText({'text': ad_regDownloadTabs.length.toString()});
      return false;
    }
  }
);

/**
 * @return {boolean}
 */
function DoListener(tab) {
  if (ad_regDownloadTabs.length > 0) {
    UpdateConfigs();
    for (var i = 0; i < ad_regDownloadTabs.length; i++) {
      var j = ad_regDownloadTabs[i];
      chrome.tabs.sendMessage(j,
          {'op': 'download', 'id': ad_regDownloadTabs[i]},
          function(response) {
            if (response === undefined) {
              alert('Tab ' + j + ' didn\'t answer.');
              ad_regDownloadTabs.remove(j);
              //chrome.tabs.reload(j);
              return false;
            }
            if (!response.isArt || response.imageList === undefined || response.imageList.length < 1) {
              ad_regDownloadTabs.remove(j);
              return false;
            }
            for (var k = 0; k < response.imageList.length; k++) {
              if (response.imageList[k] !== undefined && response.imageList[k] !== '') {
                let url = (new URL(response.imageList[k], response.url));
                let href = url.href;
                let f_name = url.href.split('/').pop().
                    split('\\').pop().
                    split('?').shift();
                let path = '';
                path += ad_path + (ad_path.endsWith(SLASH) ? '' : SLASH);
                let author = response.author.
                    replace(/[^A-Za-z0-9\-]/gi, '_').replace(/_{2,}/g, '_');
                let title = response.title.
                    replace(/[^A-Za-z0-9\-]/gi, '_').replace(/_{2,}/g, '_');
                if (ad_artistFolder && Boolean(response.author))
                  path += author + SLASH;
                if (ad_artworkFolder && Boolean(response.title))
                  path += title + SLASH;
                let ren = title + '_by_' + author + '___' + f_name;
                let target = path + (ad_artworkRename ? ren : f_name);
                console.log(
                    '    link:' + response.imageList[k] + '\n' +
                    '  author:' + response.author + '\n' +
                    '   title:' + response.title + '\n' +
                    '    href:' + href + '\n' +
                    '    file:' + f_name + '\n' +
                    ' renamed:' + ren + '\n' +
                    '    path:' + path + '\n' +
                    '  target:' + target + '\n' +
                    ' options:' + [ad_saveJson, ad_artistFolder, ad_artworkFolder, ad_artworkRename]
                );
                chrome.downloads.download({
                      url: href,
                      filename: target,
                      conflictAction: 'overwrite'
                    },
                    function (downloadId) {
                      if (downloadId === undefined) {
                        if (chrome.extension.lastError) {
                          console.log('Download failed, reason: ' + chrome.runtime.lastError.message);
                        } else {
                          console.log('***UNKNOWN ERROR***');
                        }
                        //console.log(response);
                        return false;
                      } else {
                        console.log('Download ' + downloadId + ' successfully to ' + f_name + ';');
                        if (ad_saveJson === true) {
                          chrome.downloads.download({
                            url: 'data:application/json,' + JSON.stringify(response.tags),
                            filename: target + '.json',
                            conflictAction: 'overwrite'
                          }, function (downloadId) { console.log('JSON: saved.'); });
                        } else {
                          console.log('JSON: -----.');
                        }
                        chrome.tabs.remove(response.id);
                        ad_regDownloadTabs.remove(response.id);
                        return true;
                      }
                    });
              } else {
                console.log('Something went wrong...');
              }
            }
          }
      );
      cleanupRegTabs();
    }
    return true;
  } else {
    alert('There are no Artstation tabs to consume.');
  }
  return true;
}

function DoCleanUp(tab) {
  chrome.tabs.query({'url': '*://*.artstation.com/artwork/*'}, function (tabs){
    unique = [];
    for (let i = 0; i < tabs.length; i++) {
      console.log(tabs[i].url);
      if (unique.indexOf(tabs[i].url) < 0)
        unique.push(tabs[i].url);
      else
        chrome.tabs.remove(tabs[i].id);
    }
  });
}


function DoExpandTabs(tab){
  chrome.tabs.query(
      {"active": true, "lastFocusedWindow": true},
      function (tabs) {
        if(tabs.length > 0)
          chrome.tabs.sendMessage(tabs[0].id,
              { 'op': 'expand', 'id': tabs[0].id, 'url': tabs[0].url },
              function (response) {
                if (response.expandItems.length > 0) {
                  for (var i = 0; i < response.expandItems.length; i++) {
                    if (response.expandItems[i]) {
                      let u = (new URL(response.expandItems[i],
                          response.url)).href;
                      chrome.tabs.create({ 'url': u });
                    }
                  }
                }
              });
      });
}

var ad_MenuMain = chrome.contextMenus.create(
    {
      'title': "Download",
      'contexts': ["page", "selection", "link", "editable", "image"],
      'onclick': function (info, tab) { DoListener(tab);}
    }
);

var ad_MenuExp = chrome.contextMenus.create(
    {
      'title': "Expand",
      'contexts': ["page", "selection", "link", "editable", "image"],
      'onclick': function (info, tab) { DoExpandTabs(tab);}
    }
);

var ad_MenuClean = chrome.contextMenus.create(
    {
      'title': "Remove duplicated artwork tabs",
      'contexts': ["page", "selection", "link", "editable", "image"],
      'onclick': function (info, tab) { DoCleanUp(tab);}
    }
);

function GetExpandTabs(tab){
  chrome.tabs.query(
      {"active": true, "lastFocusedWindow": true},
      function (tabs) {
        if(tabs.length > 0)
          chrome.tabs.sendMessage(tabs[0].id,
              { 'op': 'expand', 'id': tabs[0].id },
              function (response) {
                let i = 0;
                if (response)
                  if (response.expandItems)
                    i += response.expandItems.length;
                chrome.contextMenus.update(ad_MenuExp, {
                  'title': "Expand (" + i.toString() + ")"
                }, function(){});
              });
      });
}

chrome.browserAction.onClicked.addListener(DoListener);
chrome.tabs.onActivated.addListener(GetExpandTabs);

