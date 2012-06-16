/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */
 
(function(){

	function loadScripts(array,callback){
    var loader = function(src,handler){
        var script = document.createElement("script");
        script.src = src;
        script.onload = script.onreadystatechange = function(){
        script.onreadystatechange = script.onload = null;
                handler();
        }
        var head = document.getElementsByTagName("head")[0];
        (head || document.body).appendChild( script );
    };
    (function(){
        if(array.length!=0){
                loader(array.shift(),arguments.callee);
        }else{
                callback && callback();
        }
    })();
}
//var postMesjs = chrome.extension.getURL("postMessage.js");
var raphaeljs = chrome.extension.getURL("raphael-min.js");
var worldjs = chrome.extension.getURL("world.js");
var worldmapjs = chrome.extension.getURL("worldmap.js");
var box2djs= chrome.extension.getURL("box2d.js");
var userjs= chrome.extension.getURL("user.js");
loadScripts([
    box2djs,
    userjs
],function(){
    console.log('All things are loaded');
});


// var port = chrome.extension.connect();
// window.addEventListener("message", function(event) {
//     // We only accept messages from ourselves
//     if (event.source != window)
//       return;
//     if (event.data.type && (event.data.type == "FROM_PAGE")) {
//       console.log("Content script received: " + event.data.text);
//       port.postMessage(event.data.text);
//     }
// }, false);




 
} )();