/// <reference path="/js/kingo.js" />
/// <reference path="/js/hipda.js" />
(function () {
    "use strict";
    var nav = KingoJS.Navigation;
    var mCurThread;
    var mImageAttach;
    var mReply;
    var mQuote;
    KingoJS.Page.define("/pages/newPost/newPost.html", {
        ready: function (element, options) {
            if (!options || !options.thread) {
                return;
            }
            mCurThread = options.thread;
            mImageAttach = null;
            mReply = options.reply;
            mQuote = options.quote;
            document.getElementById("txtPostMessage").focus();
            initListener();
        },

        unload: function () {
        }

    });
    function initListener() {
        document.getElementById("btnNewPost").addEventListener("click", doSubmitNewPost, false);
        document.getElementById("btnCancelNewPost").addEventListener("click", function () { nav.back(); }, false);
        document.getElementById("btnTakePhoto").addEventListener("click", doTakePhotoe, false); btnChoosePhoto
        document.getElementById("btnChoosePhoto").addEventListener("click", doChoosePhoto, false);
    }
    function doChoosePhoto() {
        Helper.choosePhoto().then(function (res) {
            if (res == "success") {
                HiPDA.uploadImage("a.jpg", "image/jpg", "a").then(function (res) {
                    if (res != "error" && parseInt(res) > 0) {
                        mImageAttach = res;
                        var messageNode = document.querySelector("textarea[name='postmessage']");
                        messageNode.value += "\n[attachimg]" + res + "[/attachimg]";
                    }
                });
            }
        });
    }
    function doTakePhotoe() {
        Helper.takePhoto().then(function (res) {
            if (res == "success") {
                HiPDA.uploadImage("a.jpg", "image/jpg", "a").then(function (res) {
                    if (res != "error" && parseInt(res) > 0) {
                        mImageAttach = res;
                        var messageNode = document.querySelector("textarea[name='postmessage']");
                        messageNode.value += "\n[attachimg]" + res + "[/attachimg]";
                    }
                });
            }
        });
    }
    function doSubmitNewPost() {
        try{
            var message = document.querySelector("textarea[name='postmessage']").value;
            if (mQuote) {
                message = mQuote + message;
            }
            HiPDA.newPost(mCurThread.id, message, mImageAttach, mReply).then(function (res) {
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
