/**
 * Created by hxiao on 15/9/27.
 */

function loadMenuData(filename) {
    lastNewsTime = window.localStorage.getItem('lastNewsTime') || 0;
    lastNewsTime = Math.max(0, lastNewsTime);
    menuData = {};
    menuData.items = [];
    $('#left-menu-button').removeClass('new-badge');
    $.getJSON(filename, function(json) {
        $.each(json.children, function(idx, item) {
            var menuItem = {};
            menuItem.flagName = item.name;
            menuItem.flagId = flagData[item.name];
            var query = ':has(:root > .keyword:val("' + item.name + '"))';
            var re = jsel.match(query, allStories);
            query = ':has(:root > .publishTime:expr(x > '+ lastNewsTime +'))';
            menuItem.numAll = re.length;
            re = jsel.match(query, re);
            menuItem.stories = re;
            menuItem.hasUpdate = menuItem.stories.length > 0;
            menuItem.numNew = menuItem.stories.length;
            menuData.items.push(menuItem);
            if (re.length > 0) {
                $('#left-menu-button').addClass('new-badge');
            }
        });
        menuData.items.sort(compareMenuItem);
        $('#menuItem').empty().html(menutemplate(menuData));
        window.localStorage.setItem('lastNewsTime', getLastStoryTime(allStories));
        initMenuCalendar();
    });
}

function initMenuCalendar() {
    datePicker = myApp.calendar({
        input: '#calendar-default',
        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月' , '九月' , '十月', '十一月', '十二月'],
        monthNamesShort:  ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月' , '九月' , '十月', '十一月', '十二月'],
        dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        closeOnSelect: true,
        maxDate: new Date(),
        minDate: new Date(getOldestStoryTime(allStories)),
        onChange: function (p, values, displayValues) {
            var re = selectStoryofTimestamp(allStories, datePicker.value[0]);
            re.sort(compareStories);
            renderStories(re, 0, Math.min(200, re.length));
        }
    });
}

function selectFlag(param) {
    var query = ':has(:root > .keyword:val("' + param.dataset.flag + '"))';
    var re = jsel.match(query, allStories);
    re.sort(compareStories);
    $('#title-mainpage').text(param.dataset.flag + "的新闻 (" + re.length + " 条)");
    renderStories(re, 0, Math.min(200, re.length));

}

function selectDate(param) {
    var re;
    switch (param.dataset.date) {
        case "all":
            re = allStories;
            break;
        case "today":
            re = selectStoryToday(allStories);
            break;
        case "yesterday":
            re = selectStoryYesterday(allStories);
            break;
        case "hot":
            re = selectHotStory(allStories);
            break;
        case "star":
            re = $.grep(allStories, function(e){ return $.inArray(e.id.toString(), starList) > -1;});
            break;
        case "any":
            break;
    }
    re.sort(compareStories);
    $('#title-mainpage').text(param.dataset.flag + "的新闻 (" + re.length + " 条)");
    renderStories(re, 0, Math.min(200, re.length));
}



function loadAllData(filename, force) {
    var rightNow = new Date();
    lastUpdateTime = Number(window.localStorage.getItem('lastUpdateTime')) || 0;
    if (rightNow.getTime() - lastUpdateTime > 600*1000 || force) {
        loadFlagData(keywordFlagUrl);
        $('#updateText').text("正在更新");
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
                var newlastNewsTime = getLastStoryTime(allStories);
                if (newlastNewsTime != lastNewsTime || force) {
                    renderStories(allStories, 0, Math.min(numStoryPerPage, allStories.length));
                    $('#title-mainpage').text("全部新闻 (" + allStories.length + " 条)");
                    saveAllStoriesLocal();
                }
            })
            .fail(function() {
                myApp.addNotification({
                    title: '无法同步新闻，请稍后再试',
                    media: '<i class="fa fa-exclamation-circle"></i>',
                    hold: 3000
                });
            })
            .always(function() {
                loadMenuData(keywordUrl);
                myApp.pullToRefreshDone();
                window.localStorage.setItem('lastUpdateTime', rightNow.getTime());
                myApp.hideIndicator();
                //myApp.closeNotification(updateNotif);
            });
    } else {
        myApp.pullToRefreshDone();
    }
}

function loadAllStoriesFromLocal() {
    var compressed = window.localStorage.getItem('allStories') || LZString.compress("[]");
    tmp = LZString.decompress(compressed);
    allStories = JSON.parse(tmp);
}


function saveAllStoriesLocal() {
    var org = JSON.stringify(allStories);
    console.log("Size of sample is: " + org.length);
    var compressed = LZString.compress(org);
    console.log("Size of compressed sample is: " + compressed.length);
    // Put the object into storage
    window.localStorage.setItem('allStories', compressed);
}

function getLastStoryTime(json) {
    var query = '.publishTime';
    var re = jsel.match(query, json);
    return Math.max.apply(null, re);
}

function getOldestStoryTime(json) {
    var query = '.publishTime';
    var re = jsel.match(query, json);
    return Math.min.apply(null, re);
}

function loadFlagData(filename) {
    $.getJSON(filename, function(json) {
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
    var query = ':has(:root > .publishDate:val("' + param +'"))';
    var re = jsel.match(query, json);
    re.sort(compareStories);
    return re;
}

function selectStoryofTimestamp(json, param) {
    var rightNow = new Date(param + 10);
    rightNow.setDate(rightNow.getDate() + 1);
    var res = rightNow.toISOString().slice(0,10).replace(/-/g,"");
    return selectStoryofDate(json, res);
}

function selectStoryToday(json) {
    var rightNow = new Date();
    var res = rightNow.toISOString().slice(0,10).replace(/-/g,"");
    return selectStoryofDate(json, res);
}

function selectStoryYesterday(json) {
    var rightNow = new Date();
    rightNow.setDate(rightNow.getDate() - 1);
    var res = rightNow.toISOString().slice(0,10).replace(/-/g,"");
    return selectStoryofDate(json, res);
}

function selectStoryHasArticle(json) {
    var query = ':has(:root > .images)';
    var re = jsel.match(query, json);
    re.sort(compareStories);
    return re;
}

function selectHotStory(json) {
    var query = ':has(:root > .numSources:expr(x>4))';
    var re = jsel.match(query, json);
    re.sort(compareStories);
    return re;
}

function selectAllStories(json) {
    var query = ':has(:root > .title)';
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
        json[i].labelBGColor = 'FFF';intToRGB(hashCode(json[i].keyword));
        json[i].labelColor = '000';//invertHex(json[i].labelBGColor);
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
            json[i].numImage = json[i].images.length;
            json[i].hasImage = true;
        } else {
            json[i].numImage = 0;
            json[i].hasImage = false;
        }
    }
}

function getFavIcon(article) {
    var imgUrl = 'https://www.google.com/s2/favicons?domain_url=' + article.sourceLink;
    return '<img src="' + imgurl + '" width="16" height="16" />';
}

function compareStoriesHot(a,b) {
    if (a.publishDate > b.publishDate)
        return -1;
    if (a.publishDate < b.publishDate)
        return 1;
    if (a.publishDate == b.publishDate) {
        if (a.sourceArticles.length > b.sourceArticles.length)
            return -1;
        if (a.sourceArticles.length < b.sourceArticles.length)
            return 1;
        //if (a.sourceArticles.length == b.sourceArticles.length) {
        //    if (a.numImage > b.numImage)
        //        return -1;
        //    if (a.numImage < b.numImage)
        //        return 1;
        //}
    }
    return 0;
}

function compareStories(a,b) {
    switch (sortMethod) {
        case "time":
            compareStoriesTime(a, b);
            break;
        case "hot":
            compareStoriesHot(a, b);
            break;
    }
}


function compareStoriesTime(a,b) {
    if (a.publishTime > b.publishTime)
        return -1;
    if (a.publishTime < b.publishTime)
        return 1;
    if (a.publishTime == b.publishTime) {
        if (a.sourceArticles.length > b.sourceArticles.length)
            return -1;
        if (a.sourceArticles.length < b.sourceArticles.length)
            return 1;
        //if (a.sourceArticles.length == b.sourceArticles.length) {
        //    if (a.numImage > b.numImage)
        //        return -1;
        //    if (a.numImage < b.numImage)
        //        return 1;
        //}
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



function renderAllStories(stories) {
    $('.cards-list').empty().html(compiledListTemplate({stories: stories}));
    $.each(stories, function(idx, item) {
        if (item.mainImage) {
            preloadImgArray([item.mainImage], item.id);
        }
    });

}

function renderStories(stories, sIdx, eIdx) {
    formatStoryTime(allStories);
    renderAllStories(stories.slice(sIdx, eIdx));
    refreshStars();
    myApp.closePanel();
    var curpage = $$(".page-content", mainView.activePage.container);
    $$(curpage).scrollTop(0, Math.round($$(curpage).scrollTop()/10));
}
