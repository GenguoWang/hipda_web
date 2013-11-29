(function (window) {
    "use strict";
    function HttpHandle(worker) {
        this.httpGet = function (url) {
            var p = new KingoJS.Promise();
            var callbackName = KingoJS.genName();
            window.callbacks[callbackName] = function (res) {
                try {
                    p.resolve(res);
                } catch (e) {
                    KingoJS.log && KingoJS.log(e.message);
                }
            }
            var args = ["HttpGet", callbackName, url];
            window.wggexternal.notify(JSON.stringify(args));
            return p;
        }
        this.httpPost = function (url, ps) {
            var p = new KingoJS.Promise();
            var callbackName = KingoJS.genName();
            window.callbacks[callbackName] = function (res) {
                p.resolve(res);
            }
            var args = ["HttpPost", callbackName, url, JSON.stringify(ps)];
            window.wggexternal.notify(JSON.stringify(args));
            return p;
        }
        this.httpPostFile = function (url, ps, filename, filetype, fieldname, buffer) {
            var p = new KingoJS.Promise();
            var callbackName = KingoJS.genName();
            window.callbacks[callbackName] = function (res) {
                p.resolve(res);
            }
            var args = ["HttpPostFile", callbackName, url, JSON.stringify(ps),filename,filetype,fieldname];
            window.wggexternal.notify(JSON.stringify(args));
            return p;
        }
    }
    window.HttpHandle = HttpHandle;
    window.wggexternal = { };
    window.wggexternal.notify = function(args){
        var callback = eval(args)[1];
        var xmlhttp=new XMLHttpRequest();
        xmlhttp.onreadystatechange=function()
        {
            if (xmlhttp.readyState==4 && xmlhttp.status==200)
            {
                handleInvoke(callback,xmlhttp.responseText);
            }
        }
        xmlhttp.open("POST","http://blog.hifiwiki.net/hipda/notify.php",true);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        if(!Options.cookie) Options.cookie = new Date().valueOf()+""+Math.round((Math.random(10000)*10000));
        xmlhttp.send("args="+encodeURIComponent(args)+"&cookie="+Options.cookie);
    }
    window.Helper = {
    	getFile:function(remoteLocation){
    	    var p = new KingoJS.Promise();
    	    var callbackName = KingoJS.genName();
    	    window.callbacks[callbackName] = function (res) {
    	        try {
    	            p.resolve(res);
    	        } catch (e) {
    	            KingoJS.log && KingoJS.log(e.message);
    	        }
    	    }
    	    var args = ["LoadPage", callbackName, remoteLocation];
    	    window.wggexternal.notify(JSON.stringify(args));
    	    return p;
    	},
    	takePhoto: function () {
    	    var p = new KingoJS.Promise();
    	    var callbackName = KingoJS.genName();
    	    window.callbacks[callbackName] = function (res) {
    	        p.resolve(res);
    	    }
    	    var args = ["TakePhoto", callbackName];
    	    window.wggexternal.notify(JSON.stringify(args));
    	    return p;
    	},
    	choosePhoto: function (uid) {
    	    var p = new KingoJS.Promise();
    	    var callbackName = KingoJS.genName();
    	    window.callbacks[callbackName] = function (res) {
    	        p.resolve(res);
    	    }
    	    var args = ["ChoosePhoto", callbackName];
    	    window.wggexternal.notify(JSON.stringify(args));
    	    return p;
    	},
    	gotoDetail: function (detail) {
			
            var nav = KingoJS.Navigation;
            if(detail[0]=="Thread")nav.navigate("/pages/thread/thread.html",{thread:detail[1]});
			
    	    //var args = ["GotoDetail", JSON.stringify(detail)];
    	    //window.wggexternal.notify(JSON.stringify(args));
    	}
        ,
    	gotoUrl: function (url) {
    	    //var args = ["GotoUrl", url];
    	    //window.wggexternal.notify(JSON.stringify(args));
            window.open(url,"_blank");
    	},
		isTrial:function(){
			return KingoJS.Promise.as("false");
		}
    }
    if(!window.toStaticHTML)window.toStaticHTML = function(res){
        return res;
    }
    window.callbacks = {}
    window.handleInvoke = function (method, res) {
        if (window.callbacks[method]) {
            var ret = window.callbacks[method](res);
            delete window.callbacks[method];
            return ret;
        }
        else {
            return null;
        }
    }
})(window);
