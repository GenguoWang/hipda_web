/// <reference path="/js/kingo.js" />
/// <reference path="/js/hipda.js" />
(function () {
    "use strict";
    var nav = KingoJS.Navigation;
    function initNavbar() {
        document.getElementById("navForum").addEventListener("click", function (e) { nav.clearHistory(); nav.navigate("/pages/home/home.html"); }, false);
        document.getElementById("navPM").addEventListener("click", function (e) { nav.clearHistory(); nav.navigate("/pages/pm/pm.html"); }, false);
        document.getElementById("navFavorites").addEventListener("click", function (e) { nav.clearHistory(); nav.navigate("/pages/favorites/favorites.html"); }, false);
        document.getElementById("navSetting").addEventListener("click", function (e) { nav.clearHistory(); nav.navigate("/pages/setting/setting.html"); }, false);
    }
    KingoJS.Page.define("/pages/favorites/favorites.html", {
        ready: function (element, options) {
            HiPDA.getThreadsFromFavorites().then(function (data) {
                var tmp = new KingoJS.Template("#threadItemTemplate");
                var list = document.getElementById("threadList");
                data.forEach(function (item) {
                    tmp.render(item).then(function (node) {
                        list.appendChild(node);
                        node.addEventListener("click", function () {
                            //nav.navigate("/pages/thread/thread.html", { thread: item });
                            Helper.gotoDetail(["Thread", item]);
                        }, false);
                    });
                });
            });
            initNavbar();
        },

        unload: function () {
            // TODO: 响应导航到其他页。
        }
    });
})();
