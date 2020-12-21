chrome.runtime.sendMessage(
    {
      message: 'ack'
    },
    function(response) {
      return true;
    }
    );

window.onbeforeunload = function() {
  chrome.runtime.sendMessage(
      {
        message: 'unload'
      },
      function(response) {
        return true;
      }
      );
};

// Expand listener
chrome.runtime.onMessage.addListener (
    function (request, sender, sendResponse) {
      if (chrome.extension.lastError)
        console.log('Error: ' + chrome.runtime.lastError.message);
      if (request.op === 'expand') {
        var expandItems = [];
        expandItems = expandItems.concat($('.gallery .project a.project-image').map(function(i, el) {
          return $(el).attr('href');
        }).get());
        expandItems = expandItems.concat($('.more-artworks .visible-sm a.additional-artwork').map(function(i, el) {
          return $(el).attr('href');
        }).get());
        expandItems = expandItems.concat($('.more-album-grid .album-grid-item a').map(function(i, el) {
          return $(el).attr('href');
        }).get());
        sendResponse (
            {
              'id': request.id,
              'url': window.location.href,
              'expandItems': expandItems,
              'debug': true
            }
        );
        return true;
      }
    }
);

// Download listener
chrome.runtime.onMessage.addListener (
  function (request, sender, sendResponse) {
    if (chrome.extension.lastError)
      console.log('Error: ' + chrome.runtime.lastError.message);
    if (request.op === 'download') {
      if (window.location.href.indexOf('/artwork/') < 0){
        sendResponse (
            {
              'id': request.id,
              'url': window.location.href,
              'isArt': false,
              'debug': true
            }
        );
        return true;
      } else {
        var authorName = $('.name > a').attr('href');
        if (authorName) authorName = authorName.replace('/', '');
        var imageList = $('.artwork-image img').map(function(i, el) {
          return $(el).attr('ng-src');
        }).get();
        var rxTags = {
          'category': '',
          'mature': false,
          'discovery': $('.tags a.label').map(function(i, el) {
            return $(el).text();
          }).get(),
          'software': $('.software p').map(function(i, el) {
            return $(el).text();
          }).get()
        };
        sendResponse(
            {
              'id': request.id,
              'url': window.location.href,
              'isArt': true,
              'debug': true,
              'author': authorName,
              'title': $('.artwork-info-container .h3').text(),
              'imageList': imageList,
              'tags': rxTags
            }
        );
        return true;
      }
    }
    // var rxGoodName = new RegExp(/[A-Z,a-z,0-9]+_by_[A-Z,a-z,0-9]+/);
    // var rxToULine = new RegExp(/[_,\s,-]/g);
    // var rxAuthorURL = new RegExp(/(?:_by_)([A-Z,a-z]+)(?:-)/);
    // var uri = new URI(imageLink);
    // properFileName = imageName.replace(/[^A-Za-z0-9]/gi, '_') + '_by_' +
  }
);
