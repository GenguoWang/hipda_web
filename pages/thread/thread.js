/// <reference path="/js/kingo.js" />
/// <reference path="/js/hipda.js" />
(function () {
    "use strict";
    var mCurThread;
    var mCurPost;
    var mStartPage;
    var mCurPage;
    var mEndPage;
    var mTotalPage;
    var gPreNum = 1;
    var mQueue;
    var mPageDict;
    var mPrefetch;
    var mImageAttach;
    var mQuote;
    var mReply;
    var mMenuDialog;
    var nav = KingoJS.Navigation;
    var gMaxImgWidth = window.innerWidth - 50;
    var gClientHeight = window.innerHeight;
    KingoJS.Page.define("/pages/thread/thread.html", {
        ready: function (element, options) {
            var container = element.querySelector("#postList");
            if (options && options.thread) {
                mQueue = [];
                mPageDict = {};
                mQuote = null;
                mReply = null;
                mCurPost = null;
                mCurThread = options.thread;
                if (options.pageNum) mCurPage = options.pageNum;
                else mCurPage = 1;
                mStartPage = mCurPage;
                mEndPage = mCurPage;
                HiPDA.getPostsFromThread(options.thread.id, mCurPage).then(function (res) {
                    document.addEventListener("scroll", handleScroll, false);
                    document.getElementById("btnReply").addEventListener("click", function () { nav.navigate("/pages/newPost/newPost.html", { thread: mCurThread }); }, false);
                    mPageDict[mCurPage] = { state: "loaded", data: res };
                    mTotalPage = res.totalPage;
                    var info = document.getElementById("pageInfo");
                    info.innerHTML = mCurPage + "/" + mTotalPage;
                    renderPage(res, mCurPage);
                    for (var i = 1; i <= gPreNum; ++i) {
                        mQueue.push(mCurPage + i);
                    }
                    mPrefetch = new KingoJS.Prefetch(mQueue, mPageDict, mTotalPage, getPage, handle);
                    mPrefetch.start();
                });
                document.getElementById("threadSubject").textContent = mCurThread.subject;
                mMenuDialog = new KingoJS.UI.Dialog(document.getElementById("dial"));
                document.getElementById("cmdQuotePost").addEventListener("click", onQuote, false);
                document.getElementById("cmdReplyPost").addEventListener("click", onReply, false);
                document.getElementById("cmdPMAuthor").addEventListener("click", onPMAuthor, false);
            }
        },
        unload: function () {
            document.removeEventListener('scroll', handleScroll, false);
            mPrefetch && mPrefetch.stop();
            mQueue = [];
            mPageDict = {};
        }
    });
    function onQuote() {
        HiPDA.getQuote(mCurThread.id, mCurPost.id).then(function (res) {
            mQuote = res;
            nav.navigate("/pages/newPost/newPost.html", { thread: mCurThread, quote: res });
        });
    }
    function onReply() {
        var post = mCurPost;
        HiPDA.getReply(mCurThread.id, post.id).then(function (res) {
            mReply = {
                noticeauthor: "r|" + post.uid + "|[i]" + post.author + "[/i]",
                noticetrimstr: res,
                noticeauthormsg: post.message
            }
            nav.navigate("/pages/newPost/newPost.html", { thread: mCurThread, reply: mReply });
        });
    }
    function onPMAuthor() {
        nav.navigate("/pages/newPM/newPM.html", { msgto: mCurPost.author })
    }
    function getPage(pageNum) {
        return HiPDA.getPostsFromThread(mCurThread.id, pageNum);
    }

    function handle(index, res) {
        if (index == mEndPage + 1 && index <= mCurPage + gPreNum) {
            mEndPage++;
            renderPage(res, index);
        }
        else if (index == mStartPage - 1 && index >= mCurPage - gPreNum) {
            mStartPage--;
            renderPage(res, index,true);
        }
    }
    function getTop(ele) {
        var init = ele.offsetTop;
        ele = ele.offsetParent;
        while (ele) {
            init += ele.offsetTop;
            init -= ele.scrollTop;
            ele = ele.offsetParent;
        }
        return init - document.documentElement.scrollTop;
    }
    var isHandling = false;
    function handleScroll(event) {
        if (isHandling) return;
        isHandling = true;
        var max = -999999999;
        var nodes = document.querySelectorAll(".thread .pagelabel");
        var len = nodes.length;
        var selected = null;
        for (var i = 0; i < len; ++i) {
            var tt = getTop(nodes[i]);
            if (tt < gClientHeight - 20 && tt > max) {
                max = tt;
                selected = nodes[i];
            }
        }
        if (selected) {
            if (selected.pageNum != mCurPage) {
                pageScrolled(selected.pageNum);
            }
        }
        isHandling = false;
    }
    function pageScrolled(page) {
        if (page > mCurPage) {
            mCurPage = page;
            KingoJS.Promise.timeout(1000).then(function () {
                for (var i = mEndPage + 1; i <= mCurPage + gPreNum; ++i) {
                    mQueue.push(i);
                }
                mPrefetch.start();
            });
        }
        else if (page < mCurPage) {
            mCurPage = page;
            KingoJS.Promise.timeout(1000).then(function () {
                for (var i = mStartPage - 1; i >= mCurPage - gPreNum; --i) {
                    mQueue.push(i);
                }
                mPrefetch.start();
            });
        }
        var info = document.getElementById("pageInfo");
        info.innerHTML = mCurPage + "/" + mTotalPage;
    }
    
    function renderPage(res, pageNum,isBefore) {
        var pageTmp = new KingoJS.Template("#pageTemplate");
        var pageList = document.getElementById("pageList");
        pageTmp.render({ pagelabel: "pagelabel", pageNum: pageNum,pageId:"page"+pageNum }).then(function (page) {
            if (!isBefore) {
                pageList.appendChild(page);
            }
            var tmp = new KingoJS.Template("#postTemplate");
            var list = page.querySelector(".postList");
            var pJoin = [];
            res.post.forEach(function (post) {
                var p = tmp.render(post).then(function (div) {
                    new KingoJS.EventHelper.HoldEvent(div, function (e) {
                        mCurPost = this.post;
                        document.getElementById("dialogTitle").textContent = mCurPost.num + "#";
                        mMenuDialog.show();
                    }).post = post;
                    list.appendChild(div);
                    var imgs = div.querySelectorAll(".message img");
                    var len = imgs.length;
                    for (var i = 0; i < len; ++i) {
                        if (!imgs[i].complete) imgs[i].addEventListener("load", resizeImg, false);
                        else {
                            resizeImg.call(imgs[i]);
                        }
                    }
                    var hrefs = div.querySelectorAll(".message a");
                    len = hrefs.length;
                    for (var i = 0; i < len; ++i) {
                        var text = hrefs[i].textContent.trim();
                        var m = /(.*)#/;
                        var g = text.match(m);
                        if (g) {
                            hrefs[i].addEventListener("click", function (e) {
                                document.querySelector("a[name='" + g[1] + "']").scrollIntoView(true);
                                e.preventDefault();
                            }, false);
                        } else {
                            hrefs[i].addEventListener("click", function (e) {
                                Helper.gotoUrl(this.href);
                                e.preventDefault();
                            }, false);
                        }
                    }
                });
                pJoin.push(p);
            });
            KingoJS.Promise.join(pJoin).then(function () {
                if (isBefore) {
                    var stub = document.getElementById("stub" + mStartPage);
                    if (stub) {
                        pageList.insertBefore(page, stub);
                        pageList.removeChild(stub);
                    }
                    var oldPage = document.getElementById("page" + mEndPage);
                    if (oldPage && mEndPage > mCurPage + gPreNum) {
                        KingoJS.log("remove" + oldPage);
                        oldPage.parentNode && oldPage.parentNode.removeChild(oldPage);
                        mEndPage--;
                    }
                } else {
                    var oldPage = document.getElementById("page" + mStartPage);
                    if (oldPage && mStartPage < mCurPage - gPreNum) {
                        KingoJS.log("remove" + oldPage);
                        var h = oldPage.scrollHeight;
                        var stub = document.createElement("div");
                        stub.style.height = h+"px";
                        stub.style.width = "100%";
                        stub.style.padding = "0";
                        stub.style.margin = "0";
                        stub.id = "stub"+mStartPage;
                        pageList.insertBefore(stub,oldPage);
                        pageList.removeChild(oldPage);
                        mStartPage++;
                    }
                }
            });
        });
    }
    function resizeImg() {
        var p = this.parentNode;
        while (p.clientWidth == 0) p = p.parentNode;
        var width = p.clientWidth;
        if (this.width > width) this.width = width;
    }
})();
