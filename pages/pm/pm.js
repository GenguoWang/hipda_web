/// <reference path="/js/kingo.js" />
/// <reference path="/js/hipda.js" />
(function () {
    "use strict";
    var nav = KingoJS.Navigation;
    var mCurUid;
    function initNavbar() {
        document.getElementById("navForum").addEventListener("click", function (e) { nav.navigate("/pages/home/home.html"); }, false);
        document.getElementById("navPM").addEventListener("click", function (e) { nav.clearHistory();nav.navigate("/pages/pm/pm.html"); }, false);
        document.getElementById("navFavorites").addEventListener("click", function (e) { nav.navigate("/pages/favorites/favorites.html"); }, false);
        document.getElementById("navSetting").addEventListener("click", function (e) { nav.navigate("/pages/setting/setting.html"); }, false);
    }
    KingoJS.Page.define("/pages/pm/pm.html", {
        ready: function (element, options) {
            mCurUid = null;
            document.getElementById("cmdNewPM").addEventListener("click", function () { nav.navigate("/pages/newPM/newPM.html"); }, false);
            if (options && options.uid) {
                mCurUid = options.uid;
                document.getElementById("normalFooter").style.display = "none";
                document.getElementById("cmdReplyPM").addEventListener("click", doReplyPM, false);
                var txtContainer = document.getElementById("txtContainer");
                var pw = txtContainer.parentNode.clientWidth;
                var bw = document.getElementById("cmdReplyPM").clientWidth;
                txtContainer.style.width = (pw - bw - 20) + "px";
                var textarea = document.getElementById("txtReplyPM");
                textarea.addEventListener("input", function () {
                    this.style.height = "2px";
                    this.style.height = (this.scrollHeight + 2) + "px";
                }, false);

                HiPDA.getPM(mCurUid).then(function (data) {
                    document.getElementById("loadingIcon").style.display = "none";
                    var tmp = new KingoJS.Template("#pmTemplate");
                    var pmList = document.getElementById("pmList");
                    for (var i = data.pm.length - 1; i >= 0; i--) {
                        var item = data.pm[i];
                        item.avatar = HiPDA.getAvatarUrl(item.uid);
                        tmp.render(item).then(function (div) {
                            pmList.appendChild(div);
                        });
                    }
                });
            } else {
                document.getElementById("pmFooter").style.display = "none";
                HiPDA.getPM().then(function (data) {
                    document.getElementById("loadingIcon").style.display = "none";
                    var tmp = new KingoJS.Template("#pmTemplate");
                    var pmList = document.getElementById("pmList");
                    data.pm.forEach(function (item) {
                        item.avatar = HiPDA.getAvatarUrl(item.uid);
                        tmp.render(item).then(function (div) {
                            div.uid = item.uid;
                            div.addEventListener("click", gotoPM, false);
                            pmList.appendChild(div);
                        });
                    });
                });
                initNavbar();
            }

        },

        unload: function () {
        }
    });
    function doReplyPM() {
        try {
            var message = document.getElementById("txtReplyPM").value;
            HiPDA.replayPM(mCurUid, message).then(function (res) {
                nav.navigate("/pages/pm/pm.html", { uid: mCurUid });
            });
        } catch (e) {
            KingoJS.log && KingoJS.log(e.message);
        }
    }
    function gotoPM() {
        nav.navigate("/pages/pm/pm.html", { uid: this.uid });
    }
})();
