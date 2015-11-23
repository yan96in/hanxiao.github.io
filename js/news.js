/**
 * Created by hxiao on 15/10/17.
 */
var randomTitles = ["德国2016年经济增速因难民问题下调？",
    "希腊已经开始经济复苏？", "降息？升息？且看欧洲央行和美联储如何做决策",
    "2015年经济回顾，震荡中发展", "欧元人民币汇率今年破7？", "经济报：欧洲的复苏全靠中国",
    "接受难民是双刃剑还是自刎剑？", "双11消费狂欢背后的世界经济"];

var QueryString = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

/**
 * Created by hxiao on 15/9/27.
 */


var myApp = new Framework7();
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true,
    domCache: true //enable inline pages
});

var allData;
var flagData;
var allStories;
var jsel = JSONSelect;
var menuData;
var lastOpenTime;

moment.locale('zh-cn');

var detailtemplate = Template7.compile($$('#details-template').html());
var dataUrl = 'data/database-' + Math.abs(QueryString.id % 10) + '.json.lz';
//var dataUrl = 'http://cdn.rawgit.com/hanxiao/xiaode-backend/master/database.json';

console.log(QueryString.id);

function showDetails(param) {
    var query = ':has(:root > .id:expr(x=' + param + '))';
    var re = jsel.match(query, allStories);
    if (re.length > 0) {
        mainView.router.loadContent(detailtemplate(re[0]));
        var updateNotif = myApp.addNotification({
            title: randomTitles[randInt(randomTitles.length)],
            subtitle: '下载欧金所app，掌握的欧洲金融脉搏！<div class="download-btn-group"><img src="img/Download_on_the_App_Store_Badge_CN_135x40.svg" height="30px">&nbsp; &nbsp;<img src="img/zh-cn_generic_rgb_wo_60.png" height="30px"></div>',
            media: '<img src="img/logo-invert-64x64.png" height="40px" style="border-radius: 8px;">'
        });


        //$("img").each(function () {
        //    var image = $(this);
        //    if (image.context.naturalWidth == 0 || image.readyState == 'uninitialized') {
        //        $(image).unbind("error").hide();
        //    }
        //});
    } else {
        var updateNotif = myApp.addNotification({
            title: '无法找到该新闻！',
            media: '<i class="fa fa-chain-broken"></i>'
        });
    }
}

loadFlagData('keyword-flag.json');
loadCompressedData(dataUrl, QueryString.id);




