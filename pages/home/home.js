/// <reference path="/js/helper.js" />
/// <reference path="/js/kingo.js" />
/// <reference path="/js/hipda.js" />
(function () {
    "use strict";
    var mCurForumId;
    var mStartPage;
    var mCurPage;
    var mEndPage;
    var mTotalPage;
    var mQueue;
    var mPageDict;
    var mPrefetch;
    var mImageAttach;
    var mSort;
    var mMenuDialog;
    var nav = KingoJS.Navigation;
    var gPreNum = 1;
    var gHistoryDict = null;
    var gClientHeight = window.innerHeight;
    function restoreHistory(id) {
        var history = gHistoryDict;
        mCurForumId = history.mCurForumId;
        mStartPage = history.mStartPage;
        mCurPage = history.mCurPage;
        mEndPage = history.mEndPage;
        mTotalPage = history.mTotalPage;
        mQueue = history.mQueue;
        mPageDict = history.mPageDict;
        mPrefetch = history.mPrefetch;
        document.getElementById("pageHistory").textContent = "";
        document.getElementById("pageHistory").appendChild(history.pageList);
        document.documentElement.scrollTop = history.scrollTop;
        document.body.scrollTop = history.scrollTop;
        var info = document.getElementById("pageInfo");
        info.innerHTML = mCurPage + "/" + mTotalPage;
        initListener();
    }
    function pushHistory(id) {
        var history = {}
        gHistoryDict = history;
        history.mCurForumId = mCurForumId;
        history.mStartPage = mStartPage;
        history.mCurPage = mCurPage;
        history.mEndPage = mEndPage;
        history.mTotalPage = mTotalPage;
        history.mQueue = mQueue;
        history.mPageDict = mPageDict;
        history.mPrefetch = mPrefetch;
        history.pageList = document.getElementById("pageList");
        history.scrollTop = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
    }
    function initListener() {

        document.addEventListener("scroll", handleScroll, false);
        document.getElementById("cmdNewThread").addEventListener("click", function () { nav.navigate("/pages/newThread/newThread.html", { forumId: mCurForumId}); }, false);
        document.getElementById("cmdAutoList").addEventListener("click", function () { nav.navigate("/pages/autoList/autoList.html"); }, false);
        document.getElementById("cmdPanel").addEventListener("click", function () {
            togglePanel("forumPanel");
        }, false);
        document.getElementById("cmdMenu").addEventListener("click", function () {
            mMenuDialog.show();
        },false);
        document.getElementById("cmdGotoLast").addEventListener("click", function () {
            nav.clearHistory();
            nav.navigate("/pages/home/home.html",{forumId:mCurForumId,pageNum:mTotalPage});
        },false);
        document.getElementById("cmdGotoFirst").addEventListener("click", function () {
            nav.clearHistory();
            nav.navigate("/pages/home/home.html",{forumId:mCurForumId,pageNum:1});
        },false);
        document.getElementById("cmdGotoPage").addEventListener("click", function () {
            var toPage = document.getElementById("txtToPage").value.trim();
            if(!toPage) {
                Helper.showMsg("页码不能为空");
                return;
            }
            toPage = parseInt(toPage);
            if(toPage<1 || toPage > mTotalPage) {
                Helper.showMsg("页码无效");
                return;
            }
            nav.clearHistory();
            nav.navigate("/pages/home/home.html",{forumId:mCurForumId,pageNum:toPage});
        },false);
    }
    var gTogglePanelScroll;
    function togglePanel(id) {
    try{
        var panel = document.getElementById(id);
        if (panel.classList.contains("ui-panel-closed")) {
            panel.classList.remove("ui-panel-closed");
            panel.classList.add("ui-panel-open");
            var wrapper = document.getElementById("panelWrapper");
            wrapper.classList.add("ui-panel-content-wrap-open");
            var fixeds = document.getElementsByClassName("ui-panel-content-fixed-toolbar");
            var len = fixeds.length;
            for (var i = 0; i < len; ++i) fixeds[i].classList.add("ui-panel-content-fixed-toolbar-open");
            gTogglePanelScroll = document.body.scrollTop||document.documentElement.scrollTop;
            window.scrollTo(0,0);
        } else {
            panel.classList.add("ui-panel-closed");
            panel.classList.remove("ui-panel-open");
            var wrapper = document.getElementById("panelWrapper");
            wrapper.classList.remove("ui-panel-content-wrap-open");
            var fixeds = document.getElementsByClassName("ui-panel-content-fixed-toolbar");
            var len = fixeds.length;
            for (var i = 0; i < len; ++i) fixeds[i].classList.remove("ui-panel-content-fixed-toolbar-open");
            window.scrollTo(0,gTogglePanelScroll);
        }
        }catch(e){
        window.log(e.message);
        }
    }
    function initNavbar() {
        document.getElementById("navForum").addEventListener("click", function (e) { nav.clearHistory();nav.navigate("/pages/home/home.html"); }, false);
        document.getElementById("navPM").addEventListener("click", function (e) { nav.navigate("/pages/pm/pm.html"); }, false);
        document.getElementById("navFavorites").addEventListener("click", function (e) { nav.navigate("/pages/favorites/favorites.html"); }, false);
        document.getElementById("navSetting").addEventListener("click", function (e) { nav.navigate("/pages/setting/setting.html"); }, false);
    }
    function onForumClick(event) {
        HiPDA.defaultForumId = this.forumId;
        HiPDA.defaultTitle = this.textContent.trim();
        nav.navigate("/pages/home/home.html", { forumId: this.forumId, title: this.textContent.trim() });
    }
    function initForumPanel() {
        HiPDA.getForums().then(function (res) {
            try {
                var navContainer = document.getElementById("forumUl");
                var itemTemplate = new KingoJS.Template("#forumItemTemplate");
                var preGroup = null;
                res.group.forEach(function (group) {
                    var groupDiv = document.createElement("li");
                    groupDiv.className = "ui-li ui-li-divider ui-bar-d";
                    groupDiv.innerHTML = group.title;
                    navContainer.appendChild(groupDiv);
                    if (preGroup) preGroup.nextGroup = groupDiv;
                    preGroup = group;
                });
                res.group.forEach(function (group) {
                    group.forum.forEach(function (forum) {
                        itemTemplate.render(forum).then(function (item) {
                            item.forumId = forum.id;
                            item.addEventListener("click", onForumClick, false);
                            if (group.nextGroup) navContainer.insertBefore(item, group.nextGroup);
                            else navContainer.appendChild(item);
                        });
                    });
                });
            } catch (e) {
                KingoJS.log && KingoJS.log(e.message);
            }
        });
    }
    KingoJS.Page.define("/pages/home/home.html", {
        ready: function (element, options, isBack) {
            mSort = Options.sort;
            mMenuDialog = new KingoJS.UI.Dialog(document.getElementById("dialMenu"));
            if (options === undefined || options.forumId === undefined) {
                options = { forumId: HiPDA.defaultForumId, title: HiPDA.defaultTitle };
            }
            if (options.title) document.getElementById("forumTitle").textContent = options.title;
            if (isBack && gHistoryDict && gHistoryDict.mCurForumId == options.forumId) {
                restoreHistory(options.forumId);
                mPrefetch.start();
            }
            else {
                gHistoryDict = null;
                mCurForumId = options.forumId;
                if (options.pageNum) mCurPage = options.pageNum;
                else mCurPage = 1;
                mStartPage = mCurPage;
                mEndPage = mCurPage;
                mPageDict = {};
                mQueue = [];
                HiPDA.getThreadsFromForum(mCurForumId, mCurPage,mSort).then(function (res) {
                    mPageDict[mCurPage] = { state: "loaded", data: res };
                    mTotalPage = res.totalPage;
                    var info = document.getElementById("pageInfo");
                    info.innerHTML = mCurPage + "/" + mTotalPage;
                    renderPage(res, mCurPage);
                    for (var i = 1; i <= gPreNum; ++i) {
                        mQueue.push(mCurPage + i);
                    }
                    mPrefetch = new KingoJS.Prefetch(mQueue, mPageDict, mTotalPage, getPage, handle, mCurPage);
                    mPrefetch.start();
                    initListener();
                });
            }
            initNavbar();
            initForumPanel();
        },
        unload: function () {
            pushHistory(mCurForumId);
            document.removeEventListener('scroll', handleScroll, false);
            mPrefetch && mPrefetch.stop();
            mCurForumId = undefined;
            mStartPage = undefined;
            mCurPage = undefined;
            mEndPage = undefined;
            mTotalPage = undefined;
            mQueue = undefined;
            mPageDict = undefined;
            mPrefetch = undefined;
        }
    });

    function getPage(pageNum) {
        return HiPDA.getThreadsFromForum(mCurForumId, pageNum,mSort);
    }
    function handle(index, res) {
        if (index == mEndPage + 1 && index <= mCurPage + gPreNum) {
            mEndPage++;
            renderPage(res, index);
        }
        else if (index == mStartPage - 1 && index >= mCurPage - gPreNum) {
            mStartPage--;
            renderPage(res, index, true);
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
        var nodes = document.querySelectorAll(".homepage .pagelabel");
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

    function renderPage(res, pageNum, isBefore) {
        if(pageNum == mTotalPage){
            document.getElementById("loadingIcon").style.display = "none";
        }
        var pageTmp = new KingoJS.Template("#pageTemplate");
        var pageList = document.getElementById("pageList");
        pageTmp.render({ pagelabel: "pagelabel", pageNum: pageNum, pageId: "page" + pageNum }).then(function (page) {
            if (!isBefore) {
                pageList.appendChild(page);
            }
            var pJoin = [];
            var tmp = new KingoJS.Template("#threadTemplate");
            var list = page.querySelector(".threadList");
            KingoJS.log("oo"+Options.stickthread);
            if (pageNum == 1 && Options.stickthread=="true") {
                res.stickthread.forEach(function (thread) {
                    if(HiPDA.isInBlacKList(thread.author)) return;
                    var p = tmp.render(thread).then(function (dd) {
                        dd.thread = thread;
                        dd.addEventListener("click", function () {
                            Helper.gotoDetail(["Thread", this.thread]);
                        }, false);
                        list.appendChild(dd);
                    });
                    pJoin.push(p);
                });
            }
            res.normalthread.forEach(function (thread) {
                if(HiPDA.isInBlacKList(thread.author)) return;
                var p = tmp.render(thread).then(function (dd) {
                    dd.thread = thread;
                    dd.addEventListener("click", function () {
                        Helper.gotoDetail(["Thread", this.thread]);
                    }, false);
                    list.appendChild(dd);
                });
                pJoin.push(p);
            });
            KingoJS.Promise.join(pJoin).then(function () {
                if (isBefore) {
                    var stub = document.getElementById("stub" + mStartPage);
                    if (stub) {
                        KingoJS.log("replace stub");
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
                        stub.style.height = h + "px";
                        stub.style.width = "100%";
                        stub.style.padding = "0";
                        stub.style.margin = "0";
                        stub.id = "stub" + mStartPage;
                        pageList.insertBefore(stub, oldPage);
                        pageList.removeChild(oldPage);
                        mStartPage++;
                    }
                }
            });
        });
    }
})();
