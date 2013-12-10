/*      ps.insert\((.*),(.*)\);
        ps.push({Key:$1,Value:$2});
*/
/// <reference path="/js/kingo.js" />
(function (window) {
    "use strict";
    if (window.HiPDA) return;
    function hipda() {
        var baseUrl = "http://www.hi-pda.com/forum/";
        var loginUrl = baseUrl + "logging.php?action=login&loginsubmit=yes&inajax=1";
        var postUrl = baseUrl + "post.php";
        var postImageUrl = baseUrl + "misc.php?action=swfupload&operation=upload&simple=1&type=image";
        var logUrl = "http://blog.hifiwiki.net/hipda/log.php";
        var forumUrl = baseUrl + "forumdisplay.php";
        var threadUrl = baseUrl + "viewthread.php";
        var userUrl = baseUrl + "space.php";
        var pmUrl = baseUrl + "pm.php";
        var avatarUrl = baseUrl + "uc_server/data/avatar/";
        var httpClient = new HttpHandle();
        var permissionDict = {
            "1": { "role": "管理猿", "perm": "allow" },
            "2": { "role": "超级版主", "perm": "allow" },
            "3": { "role": "版主", "perm": "allow" },
            "4": { "role": "不能发言的群众", "perm": "allow" },
            "5": { "role": "无法访问的群众", "perm": "deny" },
            "6": { "role": "非法IP的群众", "perm": "deny" },
            "7": { "role": "游览的群众", "perm": "deny" },
            "8": { "role": "待验证的群众", "perm": "deny" },
            "16": { "role": "初级会员", "perm": "allow" },
            "17": { "role": "初级会员", "perm": "allow" },
            "18": { "role": "中级会员", "perm": "allow" },
            "19": { "role": "高级会员", "perm": "allow" },
            "20": { "role": "超级会员", "perm": "allow" },
            "30": { "role": "无法访问", "perm": "deny" },
            "31": { "role": "初级会员", "perm": "allow" },
            "32": { "role": "商家", "perm": "allow" },
        };
        this.blackList = null;
        this.enableBlackList = null;
        this.uid = null;
        this.username = null;
        this.formhash = null;
        this.hash = null;
        this.forum = null;
        this.permission = null;
        this.defaultForumId = "2";
        this.defaultTitle = "Discovery";
        this.tailMessage = "Web客户端";
        this.tailFormat = "    [size=1][color=#48d1cc][url=http://www.hi-pda.com/forum/viewthread.php?tid=1308131]%s[/url][/color][/size]";
        function makeUrl(url) {
            url = url.trim();
            if (url.indexOf("http") === 0) return url;
            if (url[0] == "/") {
                return "http://www.hi-pda.com" + url;
            } else {
                return "http://www.hi-pda.com/forum/" + url;
            }
        }
        this.log = function (event, message) {
            var ps = [];
            if (!message) message = "";
            ps.push({ Key: "name", Value: HiPDA.username });
            ps.push({ Key: "event", Value: event });
            ps.push({ Key: "message", Value: "Web dev:"+message });
            return httpClient.httpPost(logUrl, ps);
        }
        this.login = function (username, password) {
            this.uid = null;
            this.username = null;
            this.formhash = null;
            this.hash = null;
            this.forum = null;
            this.permission = null;
            this.defaultForumId = "2";
            this.defaultTitle = "Discovery";
            var ps = [];
            ps.push({ Key: "username", Value: username });
            ps.push({ Key: "password", Value: password });
            return httpClient.httpPost(loginUrl, ps).then(function (res) {
                var resXml = new DOMParser().parseFromString(res, "text/xml");
                if (res.indexOf("错误") === -1 && res.indexOf("失败") === -1 && res.indexOf("欢迎") !== -1) {
                    HiPDA.username = username;
                    if (!HiPDA.username) { HiPDA.log("error", "v1"); }
                    HiPDA.log("login");
                    return "success";
                } else {
                    return resXml.getElementsByTagName("root")[0].textContent;
                }
            });
        }
        this.testIsLogin = function(){
            return httpClient.httpGet(baseUrl).then(function(res){
                if(res.indexOf("欢迎回来") !== -1){
                    var doc = document.implementation.createHTMLDocument("example");
                    doc.documentElement.innerHTML = res;
                    HiPDA.username = doc.querySelector("#header cite a").textContent;
                    if(!HiPDA.username){HiPDA.log("error","v2");}
                    HiPDA.log("login");
                    return "success";
                }
                else{
                    return "error";
                }
            });
        }
        this.logout = function () {
            var url = baseUrl + "logging.php?action=logout&formhash=" + HiPDA.formhash;
            return httpClient.httpGet(url);
        }
        this.uploadImage = function (filename, filetype, buffer) {
            try {
                if (HiPDA.hash && HiPDA.uid) {
                    var ps = [];
                    ps.push({ Key: "uid", Value: HiPDA.uid });
                    ps.push({ Key: "hash", Value: HiPDA.hash });
                    return httpClient.httpPostFile(postImageUrl, ps, filename, filetype, "Filedata", buffer).then(function (res) {
                        if (res.match(/(.*\|){3}/)) return res.split("|")[2];
                        else return res;
                    });
                } else {
                    return HiPDA.getHash().then(function () {
                        var ps = [];
                        ps.push({ Key: "uid", Value: HiPDA.uid });
                        ps.push({ Key: "hash", Value: HiPDA.hash });
                        return httpClient.httpPostFile(postImageUrl, ps, filename, filetype, "Filedata", buffer).then(function (res) {
                            if (res.match(/(.*\|){3}/)) return res.split("|")[2];
                            else return res;
                        });
                    });
                }
            }
            catch (e) {
                KingoJS.log && KingoJS.log(e.message);
            }
        }
        this.uploadImageFile = function (file) {
            try {
                if (HiPDA.hash && HiPDA.uid) {
                    var ps = [];
                    ps.push({ Key: "uid", Value: HiPDA.uid });
                    ps.push({ Key: "hash", Value: HiPDA.hash });
                    return httpClient.httpPostFileField(postImageUrl, ps, "Filedata", file).then(function (res) {
                        if (res.match(/(.*\|){3}/)) return res.split("|")[2];
                        else return "error";
                    });
                } else {
                    return HiPDA.getHash().then(function () {
                        var ps = [];
                        ps.push({ Key: "uid", Value: HiPDA.uid });
                        ps.push({ Key: "hash", Value: HiPDA.hash });
                        return httpClient.httpPostFileField(postImageUrl, ps, "Filedata", file).then(function (res) {
                            if (res.match(/(.*\|){3}/)) return res.split("|")[2];
                            else return "error";
                        });
                    });
                }
            }
            catch (e) {
                KingoJS.log && KingoJS.log(e.message);
            }
        }
        this.getForum = function (fid, page,sort) {
            if(!sort) sort = "lastpost";
            return httpClient.httpGet(forumUrl + "?fid=" + fid + "&orderby="+sort+"&page=" + page + "&seed=" + Math.random()).then(function (res) {
                var doc = document.implementation.createHTMLDocument("doc");
                doc.documentElement.innerHTML = res;
                HiPDA.uid = doc.querySelector("#header cite a").getAttribute("href").split("=")[1];
                HiPDA.username = doc.querySelector("#header cite a").textContent;
                if(!HiPDA.username){HiPDA.log("error","v3");}
                HiPDA.formhash = doc.getElementById("umenu").children[7].getAttribute("href").match(/formhash=(\w*)/)[1].trim();
                return doc;
            });
        }
        this.getThread = function (tid, page) {
            return httpClient.httpGet(threadUrl + "?tid=" + tid + "&page=" + page + "&seed=" + Math.random()).then(function (res) {
                var doc = document.implementation.createHTMLDocument("doc");
                doc.documentElement.innerHTML = res;
                HiPDA.uid = doc.querySelector("#header cite a").getAttribute("href").split("=")[1];
                HiPDA.username = doc.querySelector("#header cite a").textContent;
                if(!HiPDA.username){HiPDA.log("error","v4");}
                HiPDA.formhash = doc.getElementById("umenu").children[7].getAttribute("href").match(/formhash=(\w*)/)[1].trim();
                return doc;
            });
        }
        this.getHash = function () {
            return httpClient.httpGet(postUrl + "?action=newthread&seed="+Math.random()+"&fid=" + HiPDA.defaultForumId).then(function (res) {
                var doc = document.implementation.createHTMLDocument("example");
                doc.documentElement.innerHTML = res;
                HiPDA.uid = doc.querySelector("#header cite a").getAttribute("href").split("=")[1];
                HiPDA.username = doc.querySelector("#header cite a").textContent;
                if(!HiPDA.username){HiPDA.log("error","v5");}
                HiPDA.formhash = doc.querySelector("input[name=formhash]").value;
                HiPDA.hash = doc.querySelector("input[name=hash]").value;
            });
        }
        this.getForums = function () {
            if (HiPDA.forum) {
                return KingoJS.Promise.as(HiPDA.forum);
            }
            return httpClient.httpGet(baseUrl + "faq.php?action=grouppermission").then(function (res) {
                var data = {};
                data.group = [];
                var group = { title: null, forum: [] };
                try {
                    var doc = document.implementation.createHTMLDocument("doc");
                    doc.documentElement.innerHTML = res;
                    HiPDA.uid = doc.querySelector("#header cite a").getAttribute("href").split("=")[1];
                    HiPDA.username = doc.querySelector("#header cite a").textContent;
                    HiPDA.permission = permissionDict[doc.querySelector(".right").value];
                    if(!HiPDA.username){HiPDA.log("error","v6");}
                    HiPDA.formhash = doc.getElementById("umenu").children[7].getAttribute("href").match(/formhash=(\w*)/)[1].trim();
                    var list = doc.querySelectorAll("#list_forumoptions tr");
                    var len = list.length;
                    for (var i = 1; i < len; ++i) {
                        if (list[i].children.length == 1) {
                            group = { title: list[i].textContent.trim(), forum: [] };
                            data.group.push(group);
                        } else {
                            var title = list[i].querySelector("a");
                            group.forum.push({ title: title.textContent, id: title.getAttribute("href").split("=")[1] });
                        }
                    }
                    /*
                    //keep for not login
                    var groups = doc.getElementsByClassName("mainbox");
                    var groupSize = groups.length;
                    for (var i = 0; i < groupSize; ++i) {
                        var group = {};
                        group.forum = [];
                        var head = groups[i].querySelector("h3 a");
                        if (head) {
                            group.title = head.textContent;
                            group.id = head.getAttribute("href").split("=")[1];
                        }
                        var nodes = groups[i].querySelectorAll("tr");
                        var fSize = nodes.length;
                        if (fSize > 0) {
                            for (var j = 0; j < fSize; ++j) {
                                var forum = {};
                                var title = nodes[j].querySelector("a");
                                forum.title = title.textContent;
                                forum.id = title.getAttribute("href").split("=")[1];
                                forum.message = nodes[j].querySelector("p").textContent;
                                group.forum.push(forum);
                            }
                            data.group.push(group);
                        }
                    }*/
                }
                catch (e) {
                    KingoJS.log && KingoJS.log(e.message);
                }
                HiPDA.forum = data;
                return data;
            });
        }
        this.getPM = function (pmUid) {
            var url = pmUrl;
            if (pmUid) url += "?uid=" + pmUid + "&filter=privatepm&daterange=5&seed=" + Math.random();
            else url += "?filter=privatepm&seed=" + Math.random();
            return httpClient.httpGet(url).then(function (res) {
                var data = {
                    pm: []
                };
                try {
                    var doc = document.implementation.createHTMLDocument("doc");
                    doc.documentElement.innerHTML = res;
                    var lis = doc.querySelectorAll(".pm_list li");
                    var len = lis.length;
                    for (var i = 0; i < len; ++i) {
                        if (lis[i].className == "pm_date") continue;
                        var author = lis[i].querySelector("cite").textContent;
                        if (!pmUid) {
                            var uid = lis[i].querySelector("cite a").getAttribute("href").split("=")[1];
                        }
                        else if (lis[i].classList.contains("self")) {
                            var uid = HiPDA.uid;
                        }
                        else {
                            var uid = pmUid;
                        }
                        var cite = lis[i].querySelector(".cite").childNodes;
                        var postTime = cite[2].nodeValue.trim();
                        var isNew = false;
                        if (cite.length > 3) isNew = true;
                        var message = lis[i].querySelector(".summary").textContent;
                        data.pm.push({ author: author, uid: uid, postTime: postTime, message: message,isNew:isNew });
                    }
                }
                catch (e) {
                    KingoJS.log && KingoJS.log(e.message);
                }
                return data;
            });
        }
        this.sendPM = function (msgto, message) {
            var ps = [];
            ps.push({ Key: "formhash", Value: HiPDA.formhash });
            ps.push({ Key: "msgto", Value: msgto });
            ps.push({ Key: "pmsubmit", Value: "true" });
            ps.push({ Key: "message", Value: message });
            var url = pmUrl + "?action=send&pmsubmit=yes&infloat=yes&sendnew=yes";
            return httpClient.httpPost(url, ps).then(function (res) {
                if (res.indexOf("成功") != -1) {
                    return "success";
                } else {
                    return "发送失败";
                }
            });
        }
        this.replayPM = function (uid, message) {
            var ps = [];
            ps.push({ Key: "formhash", Value: HiPDA.formhash });
            ps.push({ Key: "handlekey", Value: "pmreply" });
            ps.push({ Key: "message", Value: message });
            var url = pmUrl + "?action=send&uid=" + uid + "&pmsubmit=yes&infloat=yes&inajax=1";
            return httpClient.httpPost(url, ps).then(function (res) {
                if (res.indexOf("成功") != -1) {
                    return "success";
                } else {
                    return "发送失败";
                }
            });
        }
        this.getThreadsFromFavorites = function () {
            return httpClient.httpGet(baseUrl + "my.php?item=favorites&type=thread&seed="+Math.random()).then(function (res) {
                var doc = document.implementation.createHTMLDocument("doc");
                doc.documentElement.innerHTML = res;
                var data = [];
                var list = doc.querySelectorAll("tbody tr");
                var len = list.length - 1;
                for (var i = 0; i < len; ++i) {
                    var titleA = list[i].querySelector("a");
                    var subject = titleA.textContent;
                    var id = titleA.getAttribute("href").match(/tid=(\d*)&/)[1];
                    data.push({ subject: subject, id: id });
                }
                return data;
            });
        }
        this.getThreadsFromForum = function (fid, page,sort) {
            return this.getForum(fid, page,sort).then(function (res) {
                var data = {};
                data.uid = -1;
                data.normalthread = [];
                data.stickthread = [];
                data.totalPage = 1;
                try {
                    data.uid = res.querySelector("#header cite a").getAttribute("href").split("=")[1];
                    var pages = res.querySelector(".pages");
                    if (pages) {
                        pages = pages.children;
                        var i = pages.length - 1;
                        while (i >= 0 && pages[i].textContent.indexOf("下一页") >= 0) i--;
                        data.totalPage = parseInt(pages[i].textContent.replace(/\D*/g, ""));
                    }
                    var tbody = res.getElementsByTagName("tbody");
                    var size = tbody.length;
                    for (var i = 0; i < size; i++) {
                        if (tbody[i].id.indexOf("stickthread") >= 0 || tbody[i].id.indexOf("normalthread") >= 0) {
                            var thread = {};
                            thread.id = tbody[i].id.trim().split("_")[1];
                            var nodes = tbody[i].getElementsByTagName("tr")[0];
                            thread.subject = nodes.children[2].getElementsByTagName("span")[0].textContent;
                            var regex = /^[\s\S]*uid=(\d*).*">(.*)<\/a>[\s\S]*<em>(\S*)<\/em>[\s\S]*$/m
                            var author = nodes.children[3].innerHTML.trim().match(regex);
                            if (author) {
                                thread.uid = author[1];
                                thread.author = author[2];
                                thread.avatar = getAvatarUrl(thread.uid);
                                thread.postTime = author[3];
                            } else {
                                thread.uid = -1;
                                thread.author = "匿名";
                                thread.avatar = "/images/noavatar.jpg";
                                thread.postTime = "xxxx";
                            }
                            var replay = nodes.children[4].textContent.trim().split("/");
                            thread.replyNum = replay[0];
                            thread.viewNum = replay[1];
                            if (tbody[i].id.indexOf("stickthread") >= 0) {
                                data.stickthread.push(thread);
                            } else if (tbody[i].id.indexOf("normalthread") >= 0) {
                                data.normalthread.push(thread);
                            }
                        }
                    }
                }
                catch (e) {
                    KingoJS.log && KingoJS.log(e.message);
                }
                return data;
            });
        }
        this.getPostsFromThread = function (tid, page) {
            return this.getThread(tid, page).then(function (res) {
                var data = {};
                data.post = [];
                data.uid = -1;
                data.totalPage = 1;
                try {
                    var pages = res.querySelector(".pages");
                    if (pages) {
                        pages = pages.children;
                        var i = pages.length - 1;
                        while (i >= 0 && pages[i].textContent.indexOf("下一页") >= 0) i--;
                        data.totalPage = parseInt(pages[i].textContent.replace(/\D*/g, ""));
                    }
                    var postlist = res.getElementById("postlist").children;
                    var size = postlist.length;
                    for (var i = 0; i < size; i++) {

                        var post = {};
                        post.id = postlist[i].id.split("_")[1];
                        post.num = postlist[i].querySelector(".postinfo em").textContent;
                        var profile = postlist[i].querySelector(".profile");
                        post.point = profile.childNodes[5].textContent.trim();
                        post.regTime = profile.childNodes[7].textContent.trim();
                        //var message = postlist[i].getElementsByClassName("t_msgfontfix")[0];
                        var message = postlist[i].getElementsByClassName("postmessage")[0];
                        if (!message) continue;//todo, 作者被禁止或删除
                        var hrefs = message.getElementsByTagName("a");
                        var hSize = hrefs.length;
                        for (var j = 0; j < hSize; ++j) {
                            var url = hrefs[j].attributes["href"];
                            if (url) {
                                hrefs[j].href = makeUrl(url.value);
                            }
                        }
                        var imgs = message.getElementsByTagName("img");
                        var iSize = imgs.length;
                        for (var j = 0; j < iSize; ++j) {
                            if (imgs[j].attributes["file"]) {
                                imgs[j].src = baseUrl + imgs[j].attributes["file"].value;
                            }
                            else if (imgs[j].attributes["src"]) {
                                imgs[j].src = makeUrl(imgs[j].attributes["src"].value);
                            }
                        }
                        post.message = toStaticHTML(message.innerHTML);
                        var postTime = postlist[i].getElementsByClassName("authorinfo")[0].getElementsByTagName("em")[0].textContent;
                        postTime = postTime.split(" ");
                        post.postTime = postTime[1] + " " + postTime[2];
                        post.author = postlist[i].getElementsByClassName("postinfo")[0].textContent.trim();
                        var profile = postlist[i].getElementsByClassName("profile")[0];
                        post.uid = profile.children[1].textContent.trim();
                        post.avatar = getAvatarUrl(post.uid);
                        data.post.push(post);

                    }
                }
                catch (e) {
                    KingoJS.log && KingoJS.log('getPostsFromThread: ' + e.message);
                }
                return data;
            });
        }
        this.getQuote = function (tid, postId) {
            var url = postUrl + "?action=reply&tid=" + tid + "&repquote=" + postId;
            return httpClient.httpGet(url).then(function (res) {
                var doc = document.implementation.createHTMLDocument("example");
                doc.documentElement.innerHTML = res;
                return doc.querySelector("textarea").value;
            });
        }
        this.getReply = function (tid, postId) {
            var url = postUrl + "?action=reply&tid=" + tid + "&reppost=" + postId;
            return httpClient.httpGet(url).then(function (res) {
                var doc = document.implementation.createHTMLDocument("example");
                doc.documentElement.innerHTML = res;
                return doc.querySelector("textarea").value;
            });
        }
        this.newThread = function (fid, subject, message, imageAttach) {
            if (this.tailMessage) message += this.tailFormat.replace("%s", this.tailMessage);
            var ps = [];
            ps.push({ Key: "formhash", Value: HiPDA.formhash });
            ps.push({ Key: "wysiwyg", Value: "1" });
            ps.push({ Key: "iconid", Value: "14" });
            ps.push({ Key: "subject", Value: subject });
            ps.push({ Key: "message", Value: message });
            ps.push({ Key: "tags", Value: "" });
            ps.push({ Key: "attention_add", Value: "1" });
            ps.push({ Key: "usesig", Value: "1" });
            if (imageAttach) {
                ps.push({ Key: "attachnew[" + imageAttach + "][description]:", Value: "" });
            }
            return httpClient.httpPost(postUrl + "?action=newthread&fid=" + fid + "&extra=&topicsubmit=yes", ps).then(function (res) {
                return "success";
            });
        }
        this.newPost = function (tid, message, imageAttach, reply) {
            if (this.tailMessage) message += this.tailFormat.replace("%s", this.tailMessage);
            var ps = [];
            if (reply) {
                message = reply.noticetrimstr + message;
                ps.push({ Key: "noticeauthor", Value: reply.noticeauthor });
                ps.push({ Key: "noticetrimstr", Value: reply.noticetrimstr });
                ps.push({ Key: "noticeauthormsg", Value: reply.noticeauthormsg });
            }
            ps.push({ Key: "formhash", Value: HiPDA.formhash });
            ps.push({ Key: "subject", Value: "" });
            ps.push({ Key: "usesig", Value: "1" });
            ps.push({ Key: "message", Value: message });
            if (imageAttach) {
                ps.push({ Key: "attachnew[" + imageAttach + "][description]:", Value: "" });
            }
            return httpClient.httpPost(postUrl + "?action=reply&tid=" + tid + "&replysubmit=yes&infloat=yes&handlekey=fastpost&inajax=1", ps).then(function (res) {
                if (res.indexOf("您的回复已经发布") != -1) {
                    return "success";
                } else {
                    return new DOMParser().parseFromString(res, "text/xml").getElementsByTagName("root")[0].textContent.replace(/<script[\s\S\n]*script>/g, "");
                }
            });
        }
        this.addToFav = function(tid){
            var url = baseUrl + "my.php?item=favorites&tid="+tid+"&inajax=1&ajaxtarget=favorite_msg";
            return httpClient.httpGet(url).then(function(res){
                if(res.indexOf("成功")!==-1){
                    return "success";
                }
                else{
                    return "failed";
                }
            });
        }
        this.isInBlacKList = function(name){
            if(!this.blackList || !this.enableBlackList) return false;
            for(var i=0; i<this.blackList.length;++i){
                if(this.blackList[i] == name) return true;
            }
            return false;
        }
        function getAvatarUrl(uid) {
            uid = parseInt(uid);
            var s = [];
            for (var i = 0; i < 9; ++i) {
                s[i] = uid % 10;
                uid = (uid - s[i]) / 10;
            }
            return avatarUrl + s[8] + s[7] + s[6] + "/" + s[5] + s[4] + "/" + s[3] + s[2] + "/" + s[1] + s[0] + "_avatar_middle.jpg";
        }
        this.getAvatarUrl = getAvatarUrl;
    };
    try {
        window.HiPDA = new hipda();
    } catch (e) {
        KingoJS.log && KingoJS.log(e.message);
    }
})(window);
