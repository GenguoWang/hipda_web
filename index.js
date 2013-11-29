(function (window) {
    "use strict";
    var nav;
    window.sTime = new Date().valueOf();
    window.Options = {
        set css(value) { localStorage["css"] = value; },
        get css() { return localStorage["css"]; },
        set stickthread(value) { localStorage["stickthread"] = value; },
        get stickthread() { return localStorage["stickthread"]; },
        set backX(value) { localStorage["backX"] = value; },
        get backX() { return localStorage["backX"]; },
        set backY(value) { localStorage["backY"] = value; },
        get backY() { return localStorage["backY"]; },
		domain:"/hipda"
    };
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
            HiPDA.getForums();
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
        var startX;
        var startY;
        var node = document.getElementById("gback");
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
                document.addEventListener("touchmove",move,false);
                document.addEventListener("touchend",end,false);
            },500);
        }
        function end(e){
            document.removeEventListener("mousemove",move);
            document.removeEventListener("mouseup",end);
            document.removeEventListener("touchmove",move);
            document.removeEventListener("touchend",end);
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
        function endtimer(){
            if(timer) clearTimeout(timer);
            timer = null;
            node.classList.remove("beginmove");
            node.classList.remove("begindown");
        }
        node.addEventListener("click",function(){
            if(!flag)navHandle("back");
            flag = false;
        },false);
        node.addEventListener("mousedown",start,false);
        node.addEventListener("touchstart",start,false);

        node.addEventListener("mouseup",endtimer,false);
        node.addEventListener("touchend",endtimer,false);

        node.addEventListener("mouseout",endtimer,false);
        node.addEventListener("touchout",endtimer,false);

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
            KingoJS.log(node);
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
            if (password && username) {
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
