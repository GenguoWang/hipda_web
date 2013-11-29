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
    function onLogin() {
        var password = document.getElementById("txtPassword").value;
        var username = document.getElementById("txtUsername").value;
        document.getElementById("btnLogin").disabled = true;
        login(username, password);
    }
    KingoJS.Page.define("/pages/login/login.html", {
        ready: function (element, options) {
            document.getElementById("btnLogin").addEventListener("click", onLogin, false);
        },

        unload: function () {
        }
    });
})();
