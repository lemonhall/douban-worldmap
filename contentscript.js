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

loadScripts([
   "http://cdnjs.cloudflare.com/ajax/libs/raphael/2.0.0/raphael-min.js",
   "http://raphaeljs.com/world/world.js"
],function(){
    console.log('All things are loaded');
});




 
} )();