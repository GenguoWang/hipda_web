(function (window) {
    "use strict";
    var nav;
    window.sTime = new Date().valueOf();
    window.Options = {
        set css(value) { localStorage["css"] = value; },
        get css() { return localStorage["css"]; },
        set stickthread(value) { localStorage["stickthread"] = value; },
        get stickthread() { return localStorage["stickthread"]; },
        set sort(value) { localStorage["sort"] = value; },
        get sort() { return localStorage["sort"]; },
        set backX(value) { localStorage["backX"] = value; },
        get backX() { return localStorage["backX"]; },
        set backY(value) { localStorage["backY"] = value; },
        get backY() { return localStorage["backY"]; },
        set enableBack(value) { localStorage["enableBack"] = value; },
        get enableBack() { return localStorage["enableBack"]; },
        set cookiestr(value) { localStorage["cookiestr"] = value; },
        get cookiestr() { return localStorage["cookiestr"]; },
        set cookie(value) { localStorage["cookie"] = value; },
        get cookie() { return localStorage["cookie"]; },
        set agent(value) { localStorage["agent"] = value; },
        get agent() { return localStorage["agent"]; },
        set blackList(value) { localStorage["blackList"] = value;HiPDA.blackList = value.split("\n"); },
        get blackList() { return localStorage["blackList"]; },
        set enableBlackList(value) { 
            localStorage["enableBlackList"] = value;
            if(value=="true")HiPDA.enableBlackList = true; 
            else HiPDA.enableBlackList = false;
        },
        get enableBlackList() { return localStorage["enableBlackList"]; },
		domain:"/hipda",
baseUrl:"http://45.33.46.27/hipda"
    };
    if(Options.blackList)HiPDA.blackList = Options.blackList.split("\n");
    else HiPDA.blackList = null;
    if(Options.enableBlackList=="true")HiPDA.enableBlackList = true; 
    else HiPDA.enableBlackList = false;
    try{
        var argList = null;
        var args = window.location.href.split("#")[1];
        if (args) {
            args = decodeURIComponent(args);
            var argobject = JSON.parse(args);
            argList = argobject["detail"];
            window.Options = argobject["Options"];
        }
    }
    catch (e) {
        KingoJS.log(e.message);
    }
    function login(username, password) {
        HiPDA.login(username, password).then(function (res) {
            if (res != "success") {
                nav.navigate("/pages/login/login.html");
                return;
            }
            Options.isLogin = true;
            HiPDA.getForums().then(function () {
                if (HiPDA.permission["perm"] != "allow") {
                    HiPDA.logout();
                    Helper.showMsg("您是" + HiPDA.permission["role"]+",请使用正常账号访问");
                    nav.replacePage("/pages/login/login.html");
                }
            });
            nav.clearHistory();
            nav.navigate("/pages/home/home.html", { forumId: HiPDA.defaultForumId });
        });
    }
    function loginStr(){
        HiPDA.testIsLogin().then(function (res) {
            if (res != "success") {
                nav.navigate("/pages/login/login.html");
                return;
            }
            Options.isLogin = true;
            HiPDA.getForums();
            nav.clearHistory();
            nav.navigate("/pages/home/home.html", { forumId: HiPDA.defaultForumId });
        });
    }
    function log(msg){
        var node = document.getElementById("msg");
        node.innerHTML += msg + "<br/>";
    }
    window.log = log;
    function initGBack(){
        var flag = false;
        var timer = null;
        var timer1 = null;
        var startX;
        var startY;
        var node = document.getElementById("gback");
        if(Options.enableBack == "true"){
            node.style.display = "block";    
        }
        if(Options.backX){
            node.style.left = Options.backX+"px";
        }
        if(Options.backY){
            node.style.top = Options.backY+"px";
        }
        function start(e){
            node.classList.add("begindown");
            timer = setTimeout(function(){
                node.classList.add("beginmove");
                flag = true;
                var style = getComputedStyle(node);
                startX = parseInt(style.left)-e.clientX;
                startY = parseInt(style.top)-e.clientY;
                document.addEventListener("mousemove",move,false);
                document.addEventListener("mouseup",end,false);
            },500);
        }
        function touchstart(e){
            node.classList.add("begindown");
            e.preventDefault();
            timer1 = setTimeout(function(){
                node.classList.add("beginmove");
                flag = true;
                var style = getComputedStyle(node);
                startX = parseInt(style.left)-e.touches[0].clientX;
                startY = parseInt(style.top)-e.touches[0].clientY;
                document.addEventListener("touchmove",touchmove,false);
                document.addEventListener("touchend",end,false);
            },500);
        }
        function end(e){
            document.removeEventListener("mousemove",move);
            document.removeEventListener("mouseup",end);
            document.removeEventListener("touchmove",touchmove);
            document.removeEventListener("touchend",end);
            if(e.type=="touchend") flag = false;
            node.classList.remove("beginmove");
            node.classList.remove("begindown");
        }
        function move(e){
            if(flag){
                Options.backX = e.clientX+startX;
                Options.backY = e.clientY+startY;
                node.style.left = Options.backX+"px";
                node.style.top = Options.backY+"px";
            }
        }
        function touchmove(e){
            if(flag){
                e.preventDefault();
                Options.backX = e.touches[0].clientX+startX;
                Options.backY = e.touches[0].clientY+startY;
                node.style.left = Options.backX+"px";
                node.style.top = Options.backY+"px";
            }
        }
        function endtimer(){
            if(timer) clearTimeout(timer);
            timer = null;
            node.classList.remove("beginmove");
            node.classList.remove("begindown");
        }
        function touchendtimer(){
            if(timer1) clearTimeout(timer1);
            timer1 = null;
            node.classList.remove("beginmove");
            node.classList.remove("begindown");
            if(!flag)navHandle("back");
        }
        node.addEventListener("click",function(){
            if(!flag)navHandle("back");
            flag = false;
        },false);
        node.addEventListener("mousedown",start,false);
        node.addEventListener("touchstart",touchstart,false);

        node.addEventListener("mouseup",endtimer,false);
        node.addEventListener("touchend",touchendtimer,false);

        node.addEventListener("mouseout",endtimer,false);
        node.addEventListener("touchcancel",touchendtimer,false);

        //node.addEventListener("mousemove",move,false);
        //node.addEventListener("touchmove",move,false);
    }
    document.addEventListener("DOMContentLoaded", function () {
        document.body.addEventListener("selectstart", function (e) { e.preventDefault(); }, false);
        KingoJS.Navigation = new KingoJS.PageControlNavigator(document.getElementById("pagecontrol"));
        nav = KingoJS.Navigation;
        initGBack();
        if (Options["css"] && Options["css"] == "nomodern") {
            var node = document.getElementById("cssModern");
            if (node) {
                node.parentNode && node.parentNode.removeChild(node);
                localStorage["css"] = "nomodern";
            }
        }
        if (argList) {
            if (argList[0]=="Thread") {
                nav.navigate("/pages/thread/thread.html", { thread: argList[1] });
            }
        } else {
            var password = localStorage.getItem("password");
            var username = localStorage.getItem("username");
            if(Options.cookiestr){
                loginStr();
            }
            else if (password && username) {
                login(username, password, false);
            } else {
                nav.navigate("/pages/login/login.html");
            }
        }
    }, false);

    window.navHandle = function (method) {
        window.sTime = new Date().valueOf();
        if (method == "back") {
            if(nav.canBack()){
                nav.back();
                return "true";
            }else{
                return "false";
            }
        }
        else if (method == "forward") {
            nav.forward();
            return "true";
        }
        else return "false";
    };
    /*
    if (navigator.pointerEnabled) {
        document.addEventListener("pointerdown", testTouch, false);
        document.addEventListener("pointerup", testTouch, false);
    } else if (navigator.msPointerEnabled) {
        KingoJS.log("ms pointtttt");
        var node = document.getElementById("msg");
        node.addEventListener("MSPointerDown", testTouch, false);
        node.addEventListener("MSPointerMove", testTouch, false);
        node.addEventListener("MSPointerUp", testTouch, false);
        //node.addEventListener("click", testTouch, false);
        //document.addEventListener("MSPointerCancel", testTouch, false);
        //document.addEventListener("MSPointerOver", testTouch, false);
        //document.addEventListener("MSPointerOut", testTouch, false);
    } else {
        
        elm.addEventListener("mousedown", foo);
    }
    
    this.element.addEventListener("mousemove", testTouch, false);
    function testTouch(event) {
        KingoJS.log("touch touche " + event.type+" "+event.pageX+" "+event.pageY);
        switch (event.type) {
            case "touchstart": case "MSPointerDown":
                //document.body.style.removeProperty("-ms-touch-action");
                break;
            case "touchmove": case "MSPointerMove": 
                break;
            case "touchend": case "MSPointerUp": 
                break;
        }
    }
    */
})(window);
