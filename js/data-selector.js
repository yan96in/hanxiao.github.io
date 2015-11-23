/**
 * Created by hxiao on 15/9/27.
 */

function loadMenuData(filename) {
    getLastOpenTime();
    menuData = {};
    menuData.items = [];
    $.getJSON("data/" + filename, function(json) {
        $.each(json.children, function(idx, item) {
            var menuItem = {};
            menuItem.flagName = item.name;
            menuItem.flagId = flagData[item.name];
            var query = ':has(:root > .keyword:val("' + item.name + '"))';
            var re = jsel.match(query, allStories);
            query = ':has(:root > .publishTime:expr(x > '+ lastOpenTime +'))';
            menuItem.numAll = re.length;
            re = jsel.match(query, re);
            menuItem.stories = re;
            menuItem.hasUpdate = menuItem.stories.length > 0;
            menuItem.numNew = menuItem.stories.length;
            menuData.items.push(menuItem);
        });
        menuData.items.sort(compareMenuItem);
        $('#menuItem').empty().html(menutemplate(menuData));
        lastOpenTime = getLastStoryTime(allStories);
        Cookies.set('lastOpenTime', lastOpenTime, { expires: 14 });
    });
}

function selectFlag(param) {
    var query = ':has(:root > .keyword:val("' + param.dataset.flag + '"))';
    var re = jsel.match(query, allStories);
    re.sort(compareStories);
    $('#title-mainpage').text(param.dataset.flag + "的新闻 (" + re.length + " 条)");
    renderStories(re, 0, Math.min(200, re.length));

}

function loadAllData(filename) {
    myApp.showIndicator();
    $.getJSON(filename, function(json) {
        allData = json;
        allStories = selectAllStories(allData);
        renderStories(allStories, 0, Math.min(200, allStories.length));
        $('#title-mainpage').text("全部新闻 (" + allStories.length + " 条)");
        loadMenuData('keywords.json');
        myApp.hideIndicator();
    });
}

function loadCompressedData(filename, id) {
    myApp.showIndicator();
    //var updateNotif = myApp.addNotification({
    //    title: '正在请求更新...',
    //    media: '<i class="fa fa-refresh"></i>',
    //});
    $.get(filename, function() {
        console.log( "fetching data..." );})
        .done(function(data) {
            allData =  JSON.parse(LZString.decompressFromEncodedURIComponent(data));
            allStories = selectAllStories(allData);
        })
        .fail(function() {
            myApp.addNotification({
                title: '无法同步新闻，请稍后再试',
                media: '<i class="fa fa-exclamation-circle"></i>',
                hold: 3000
            });
        })
        .always(function() {
            myApp.hideIndicator();
            showDetails(id);
            //myApp.closeNotification(updateNotif);

        });
}


function getLastStoryTime(json) {
    var query = '.publishTime';
    var re = jsel.match(query, json);
    return Math.max.apply(null, re);
}

function loadFlagData(filename) {
    myApp.showIndicator();
    $.getJSON("data/" + filename, function(json) {
        flagData = json;
    });
}


function selectStoryHasImage(json) {
    var query = ':has(:root > .images)';
    var re = jsel.match(query, json);
    re.sort(compareStories);
    return re;
}


function selectStoryofDate(json, param) {
    var query = ':has(:root > .id:val("' + param +'"))';
    var re = jsel.match(query, json);
    return re;
}

function selectStoryofDate(json, param) {
    var query = ':has(:root > .publishDate:val("' + param +'"))';
    var re = jsel.match(query, json);
    re.sort(compareStories);
    return re;
}

function selectStoryToday(json) {
    var rightNow = new Date();
    var res = rightNow.toISOString().slice(0,10).replace(/-/g,"");
    return selectStoryofDate(json, res);
}

function selectStoryHasArticle(json) {
    var query = ':has(:root > .images)';
    var re = jsel.match(query, json);
    re.sort(compareStories);
    return re;
}

function selectAllStories(json) {
    var query = ':has(:root > .sourceArticles)';
    var re = jsel.match(query, json);
    //formatStoryImage(re);
    formatStoryTime(re);
    formatStorySources(re);
    formatLabelColor(re);
    var newre = [];
    var unique = {};

    $.each(re, function(idx, item) {
        if (typeof(unique[item.id]) === 'undefined') {
            newre.push(item);
            unique[item.id] = '0';
        }
    });
    newre.sort(compareStories);
    return newre;
}

function formatLabelColor(json) {
    for (var i = 0; i < json.length; i++) {
        json[i].flagId = flagData[json[i].keyword];
        //json[i].labelBGColor = 'FFF';intToRGB(hashCode(json[i].keyword));
        //json[i].labelColor = '000';//invertHex(json[i].labelBGColor);
    }
}

function formatStoryTime(json) {
    for (var i = 0; i < json.length; i++) {
        var tmpDate =  new Date(json[i].publishTime);
        json[i].localTime = moment(tmpDate).fromNow();
    }
}

function formatStorySources(json) {
    for (var i = 0; i < json.length; i++) {
        json[i].numSources = json[i].sourceArticles.length;
        json[i].isHot = json[i].numSources > 4;
    }
}

function formatStoryImage(json) {
    for (var i = 0; i < json.length; i++) {
        if (typeof(json[i].images) !== 'undefined') {
            json[i].mainImage = json[i].images[0];
            json[i].numImage = json[i].images.length;
        } else {
            json[i].numImage = 0;
        }
    }
}

function getFavIcon(article) {
    var imgUrl = 'http://www.google.com/s2/favicons?domain_url=' + article.sourceLink;
    return '<img src="' + imgurl + '" width="16" height="16" />';
}

function compareStories(a,b) {
    if (a.publishDate > b.publishDate)
        return -1;
    if (a.publishDate < b.publishDate)
        return 1;
    if (a.publishDate == b.publishDate) {
        if (a.sourceArticles.length > b.sourceArticles.length)
            return -1;
        if (a.sourceArticles.length < b.sourceArticles.length)
            return 1;
        if (a.sourceArticles.length == b.sourceArticles.length) {
            if (a.numImage > b.numImage)
                return -1;
            if (a.numImage < b.numImage)
                return 1;
        }
    }
    return 0;
}

function compareMenuItem(a,b) {
    if (a.numNew > b.numNew)
        return -1;
    if (a.numNew < b.numNew)
        return 1;
    if (a.numNew == b.numNew) {
        if (a.numAll > b.numAll) {
            return -1;
        } else if (a.numAll < b.numAll) {
            return 1;
        }
    }
    return 0;
}


function getAllPreloadImgURLs(story) {
    var preImgs = [];
    if (story.numImage > 0) {
        preImgs.push(story.mainImage);
    }
    //for (var i = 0; i < story.sourceArticles.length; i++){
    //    preImgs.push('http://www.google.com/s2/favicons?domain_url=' + story.sourceArticles[i].sourceLink);
    //}
    return preImgs;
}

function renderStories(stories, sIdx, eIdx) {
    $('#storyLine').empty();
    var numRow = 0;
    do {
        var rowStyle = randInt(3);
        if (numRow % 2 == -1) {
            $('#storyLine').append('<div class="content-block">');
        }

        switch (rowStyle) {
            case 0:
                // 33
                var story1 = stories[sIdx].numImage > 0 ?
                    pic33template(stories[sIdx]) : text33template(stories[sIdx]);
                var story2 = stories[sIdx + 1].numImage > 0 ?
                    pic33template(stories[sIdx + 1]) : text33template(stories[sIdx + 1]);
                var story3 = stories[sIdx + 2].numImage > 0 ?
                    pic33template(stories[sIdx + 2]) : text33template(stories[sIdx + 2]);

                var rowStories = {story1: story1, story2: story2, story3: story3};
                preloadImgArray(getAllPreloadImgURLs(stories[sIdx]), stories[sIdx].id);
                preloadImgArray(getAllPreloadImgURLs(stories[sIdx+1]), stories[sIdx+1].id);
                preloadImgArray(getAllPreloadImgURLs(stories[sIdx+2]), stories[sIdx+2].id);

                $('#storyLine').append(row33template(rowStories));
                sIdx += 3;
                break;
            case 1:
                // 33-66
                if (stories[sIdx + 1].numImage == 0) {
                    // second story must be image story
                    continue;
                }

                var story1 = stories[sIdx].numImage > 0 ?
                    pic33template(stories[sIdx]) : text33template(stories[sIdx]);

                var story2 = pic66template(stories[sIdx + 1]);

                var rowStories = {story1: story1, story2: story2};

                preloadImgArray(getAllPreloadImgURLs(stories[sIdx]), stories[sIdx].id);
                preloadImgArray(getAllPreloadImgURLs(stories[sIdx+1]), stories[sIdx+1].id);


                $('#storyLine').append(row3366template(rowStories));
                sIdx += 2;
                break;
            case 2:
                // 66-33
                if (stories[sIdx].numImage == 0) {
                    // first story must be image story
                    continue;
                }

                var story1 = pic66template(stories[sIdx]);

                var story2 = stories[sIdx + 1].numImage > 0 ?
                    pic33template(stories[sIdx + 1]) : text33template(stories[sIdx + 1]);

                var rowStories = {story1: story1, story2: story2};

                preloadImgArray(getAllPreloadImgURLs(stories[sIdx]), stories[sIdx].id);
                preloadImgArray(getAllPreloadImgURLs(stories[sIdx+1]), stories[sIdx+1].id);

                $('#storyLine').append(row6633template(rowStories));
                sIdx += 2;
                break;
        }
        $('#storyLine').append('</div>');
        numRow ++;
    } while (sIdx < eIdx)

}