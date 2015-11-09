/**
 * Created by han on 9/27/15.
 */

function randInt(bound) {
    return Math.floor(Math.random() * bound);
}


function invertHex(hexnum){
    if(hexnum.length != 6) {
        alert("Hex color must be six hex numbers in length.");
        return false;
    }

    hexnum = hexnum.toUpperCase();
    var splitnum = hexnum.split("");
    var resultnum = "";
    var simplenum = "FEDCBA9876".split("");
    var complexnum = new Array();
    complexnum.A = "5";
    complexnum.B = "4";
    complexnum.C = "3";
    complexnum.D = "2";
    complexnum.E = "1";
    complexnum.F = "0";

    for(i=0; i<6; i++){
        if(!isNaN(splitnum[i])) {
            resultnum += simplenum[splitnum[i]];
        } else if(complexnum[splitnum[i]]){
            resultnum += complexnum[splitnum[i]];
        } else {
            alert("Hex colors must only include hex numbers 0-9, and A-F");
            return false;
        }
    }

    return resultnum;
}

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function preloadImgArray( imgs, cardId ) {
    "use strict";
    var loaded = 0;
    var images = [];
    imgs = Object.prototype.toString.apply( imgs ) === '[object Array]' ? imgs : [imgs];
    var inc = function() {
        loaded += 1;
        console.log(loaded + ' images are ready!');
        if ( loaded === imgs.length) {
            $('#card'+cardId).fadeIn();
        }
    };
    for ( var i = 0; i < imgs.length; i++ ) {
        images[i] = new Image();
        images[i].onabort = inc;
        images[i].onerror = inc;
        images[i].onload = inc;
        images[i].src = imgs[i];
    }
}


function getLastOpenTime() {
    var d = new Date();
    lastOpenTime = Cookies.get('lastOpenTime') || 0;
}

function fireClick(node){
    if ( document.createEvent ) {
        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, false);
        node.dispatchEvent(evt);
    } else if( document.createEventObject ) {
        node.fireEvent('onclick') ;
    } else if (typeof node.onclick == 'function' ) {
        node.onclick();
    }
}

function openClick(param) {
    var a = document.createElement('a');
    a.setAttribute("href", param);
    a.setAttribute("target", "_blank");
    fireClick(a);
}

function isWeixinBrowser(){
    var ua = navigator.userAgent.toLowerCase();
    return (/micromessenger/.test(ua)) ? true : false ;
}