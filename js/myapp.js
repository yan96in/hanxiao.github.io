/**
 * Created by hxiao on 15/9/27.
 */


var myApp = new Framework7();
var $$ = Dom7;
var leftView = myApp.addView('.view-left', {
    dynamicNavbar: true
});

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

var text33template = Template7.compile($$('#card-text-33-template').html());
var pic33template = Template7.compile($$('#card-pic-33-template').html());
var pic66template = Template7.compile($$('#card-pic-66-template').html());
var row33template = Template7.compile($$('#row-33-template').html());
var row3366template = Template7.compile($$('#row-33-66-template').html());
var row6633template = Template7.compile($$('#row-66-33-template').html());
var menutemplate = Template7.compile($$('#menu-template').html());
var detailtemplate = Template7.compile($$('#details-template').html());
var dataUrl = 'data/database.json';
//var dataUrl = 'http://cdn.rawgit.com/hanxiao/xiaode-backend/master/database.json';