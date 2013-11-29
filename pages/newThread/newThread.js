﻿/// <reference path="/js/helper.js" />
/// <reference path="/js/kingo.js" />
/// <reference path="/js/hipda.js" />
(function () {
    "use strict";
    var nav = KingoJS.Navigation;
    var mCurForumId;
    var mImageAttach;
    KingoJS.Page.define("/pages/newThread/newThread.html", {
        ready: function (element, options) {
            if (!options || !options.forumId) {
                return;
            }
            mCurForumId = options.forumId;
            mImageAttach = null;
            document.getElementById("txtSubject").focus();
            initListener();
        },

        unload: function () {
        }

    });
    function initListener() {
        document.getElementById("btnNewThread").addEventListener("click", doSubmitNewThread, false);
        document.getElementById("btnCancelNewThread").addEventListener("click", doClickCancelNewThread, false);
        document.getElementById("btnTakePhoto").addEventListener("click", doTakePhotoe, false); btnChoosePhoto
        document.getElementById("btnChoosePhoto").addEventListener("click", doChoosePhoto, false);
    }
    function doChoosePhoto() {
        Helper.choosePhoto().then(function (res) {
            if (res == "success") {
                HiPDA.uploadImage("a.jpg", "image/jpg", "a").then(function (res) {
                    if (res != "error" && parseInt(res) > 0) {
                        mImageAttach = res;
                        var messageNode = document.querySelector("textarea[name='message']");
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
                        var messageNode = document.querySelector("textarea[name='message']");
                        messageNode.value += "\n[attachimg]" + res + "[/attachimg]";
                    }
                });
            }
        });
    }
    function doClickCancelNewThread() {
        nav.back();
    }
    function doSubmitNewThread() {
        var subject = document.querySelector("input[name='subject']").value;
        var message = document.querySelector("textarea[name='message']").value;
        HiPDA.newThread(mCurForumId, subject, message, mImageAttach).then(function (res) {
            if (res == "success") {
                nav.navigate("/pages/home/home.html", { forumId: mCurForumId });
            }
        });
    }
})();
