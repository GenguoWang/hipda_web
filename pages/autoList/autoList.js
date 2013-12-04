/// <reference path="/js/kingo.js" />
/// <reference path="/js/hipda.js" />
(function () {
    "use strict";
    var nav = KingoJS.Navigation;
    KingoJS.Page.define("/pages/autoList/autoList.html", {
        ready: function (element, options) {
            Helper.getAutoList().then(function (data) {
                document.getElementById("loadingIcon").style.display = "none";
                var tmp = new KingoJS.Template("#threadItemTemplate");
                var list = document.getElementById("threadList");
                data.forEach(function (item) {
                    var config = JSON.parse(item["config"]);
                    tmp.render(config).then(function (node) {
                        list.appendChild(node);
                        node.querySelector(".nd-subject").addEventListener("click", function () {
                            Helper.gotoDetail(["Thread", {id:config.tid,subject:config.subject}]);
                        }, false);
                        node.querySelector(".nd-delete").addEventListener("click", function () {
                            Helper.deleteAutoPost(item.id).then(function(res){
                                if(res=="success"){
                                    node.style.display = "none";
                                }
                                else{
                                    Helper.showMsg("删除失败");
                                }
                            });
                        }, false);
                    });
                });
            });
        },

        unload: function () {
            // TODO: 响应导航到其他页。
        }
    });
})();
