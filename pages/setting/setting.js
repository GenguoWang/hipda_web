(function () {
    "use strict";
    var nav = KingoJS.Navigation;
    function initNavbar() {
        document.getElementById("navForum").addEventListener("click", function (e) { nav.clearHistory(); nav.navigate("/pages/home/home.html"); }, false);
        document.getElementById("navPM").addEventListener("click", function (e) { nav.clearHistory(); nav.navigate("/pages/pm/pm.html"); }, false);
        document.getElementById("navFavorites").addEventListener("click", function (e) { nav.clearHistory(); nav.navigate("/pages/favorites/favorites.html"); }, false);
        document.getElementById("navSetting").addEventListener("click", function (e) { nav.clearHistory(); nav.navigate("/pages/setting/setting.html"); }, false);
    }
    function logout() {
        HiPDA.logout().then(function () {
            localStorage["username"] = "";
            localStorage["password"] = "";
            nav.clearHistory();
            nav.navigate("/pages/login/login.html");
        });
    }
    function buy() {
        Helper.buy();
    }
    function donate() {
        Helper.gotoUrl("https://me.alipay.com/ciceblue");
    }
    function change() {
        var node = document.getElementById("cssModern");
        if (node) {
            node.parentNode && node.parentNode.removeChild(node);
            Options["css"] = "nomodern";
        } else {
            var newCss = document.createElement("link");
            newCss.rel = "stylesheet"
            newCss.type = "text/css"
            newCss.id = "cssModern";
            newCss.href = Options.domain+"/css/modern.css";
            window.document.head.appendChild(newCss);
            Options["css"] = "modern";
        }
    }
    function stickthread() {
        if (Options.stickthread == "true") {
            Options.stickthread = "false";
            document.getElementById("stickthreadText").textContent = "显示置顶帖";
        } else {
            Options.stickthread = "true";
            document.getElementById("stickthreadText").textContent = "隐藏置顶帖";
        }
    }
    function sort(){
        if (Options.sort == "dateline") {
            Options.sort = "lastpost";
            document.getElementById("sortText").textContent = "按发帖时间排序";
        } else {
            Options.sort = "dateline";
            document.getElementById("sortText").textContent = "按最后回复排序";
        }
    }
    function enableBack(){
        if (Options.enableBack == "true") {
            Options.enableBack = "false";
        } else {
            Options.enableBack = "true";
        }
        document.getElementById("enableBackText").textContent = "(请重新载入页面)";
    }
    KingoJS.Page.define("/pages/setting/setting.html", {
        ready: function (element, options) {
            document.getElementById("logout").addEventListener("click", logout, false);
            document.getElementById("buy").addEventListener("click", buy, false);
            document.getElementById("donate").addEventListener("click", donate, false);
            document.getElementById("change").addEventListener("click", change, false);
            document.getElementById("stickthread").addEventListener("click", stickthread, false);
            document.getElementById("sort").addEventListener("click", sort, false);
            document.getElementById("enableBack").addEventListener("click", enableBack, false);
            if (Options.stickthread == "true") {
                document.getElementById("stickthreadText").textContent = "隐藏置顶帖";
            } else {
                document.getElementById("stickthreadText").textContent = "显示置顶帖";
            }
            if (Options.sort == "dateline") {
                document.getElementById("sortText").textContent = "按最后回复排序";
            } else {
                document.getElementById("sortText").textContent = "按发帖时间排序";
            }
            if (Options.enableBack == "true") {
                document.getElementById("enableBackText").textContent = "关闭虚拟返回键";
            } else {
                document.getElementById("enableBackText").textContent = "使用虚拟返回键";
            }
            initNavbar();
                if (Options.isTrial === undefined) {
                    Helper.isTrial().then(function (res) {
                        if (res == "true") {
                            Options.isTrial = true;
                            document.getElementById("buy").style.display = "block";
                        }
                        else {
                            Options.isTrial = false;
                        }
                    });
                } else {
                    if (Options.isTrial) {
                        document.getElementById("buy").style.display = "block";
                    }
                }
        },

        unload: function () {
        }
    });
})();
