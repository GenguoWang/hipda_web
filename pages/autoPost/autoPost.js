/// <reference path="/js/kingo.js" />
/// <reference path="/js/hipda.js" />
(function () {
    "use strict";
    var nav = KingoJS.Navigation;
    var mCurThread;
    KingoJS.Page.define("/pages/autoPost/autoPost.html", {
        ready: function (element, options) {
            if (!options || !options.thread) {
                return;
            }
            mCurThread = options.thread;
            document.getElementById("txtPostMessage").focus();
            initListener();
        },

        unload: function () {
        }

    });
    function initListener() {
        document.getElementById("btnNewPost").addEventListener("click", doSubmitNewPost, false);
        document.getElementById("btnCancelNewPost").addEventListener("click", function () { nav.back(); }, false);
    }
    function doSubmitNewPost() {
        try{
            var message = document.querySelector("textarea[name='postmessage']").value;
            Helper.autoPost(mCurThread, message).then(function (res) {
                if (res == "success") {
                    nav.back();
                } else {
                    alert(res);
                    return;
                }
            });
        } catch (e) {
            KingoJS.log && KingoJS.log("wgg:" + e.message);
        }
    }
})();
