/**
 * Created by hxiao on 15/9/26.
 */


loadAllData(dataUrl);
loadFlagData('keyword-flag.json');

if (isWeixinBrowser()) {
    $("html").html("<center><img src='img/logo.png'><h1>" +
        "为达到最佳体验，请在桌面或平板中打开 http://ojins.com</h1></center>");

}



