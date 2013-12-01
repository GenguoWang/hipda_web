(function () {
    "use strict";
    var nav = KingoJS.Navigation;
    function login(username, password) {
        HiPDA.login(username, password).then(function (res) {
            if (res != "success") {
                document.getElementById("btnLogin").disabled = false;
                alert(res);
                return;
            }
            Options.isLogin = true;
            localStorage["password"] = password;
            localStorage["username"] = username;
            HiPDA.getForums();
            nav.clearHistory();
            nav.navigate("/pages/home/home.html", { forumId: HiPDA.defaultForumId });
        });
    }
    function onLoginStr(){
        var cookiestr = document.getElementById("cookiestr").value;
        Options.agent = document.getElementById("agent").value;
        Options.cookiestr = cookiestr;
        HiPDA.testIsLogin().then(function(res){
            if (res != "success") {
                document.getElementById("btnLogin").disabled = false;
                alert(res);
                Options.agent = "";
                Options.cookiestr = "";
                return;
            }
            Options.isLogin = true;
            HiPDA.getForums();
            nav.clearHistory();
            nav.navigate("/pages/home/home.html", { forumId: HiPDA.defaultForumId });
        });
    }
    function onLogin() {
        var password = document.getElementById("txtPassword").value;
        var username = document.getElementById("txtUsername").value;
        document.getElementById("btnLogin").disabled = true;
        login(username, password);
    }
    KingoJS.Page.define("/pages/login/login.html", {
        ready: function (element, options) {
            Options.agent = "";
            Options.cookiestr = "";
            localStorage["password"] = "";
            localStorage["username"] = "";
            document.getElementById("btnLogin").addEventListener("click", onLogin, false);
            document.getElementById("btnLoginStr").addEventListener("click", onLoginStr, false);
        },

        unload: function () {
        }
    });
})();
