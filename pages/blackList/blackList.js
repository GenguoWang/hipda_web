/// <reference path="/js/kingo.js" />
/// <reference path="/js/hipda.js" />
(function () {
    "use strict";
    var nav = KingoJS.Navigation;
    KingoJS.Page.define("/pages/blackList/blackList.html", {
        ready: function (element, options) {
            document.getElementById("txtBlackList").focus();
            document.getElementById("btnSave").addEventListener("click", function(){
                var str = document.getElementById("txtBlackList").value;
                if(str && str[str.length-1] != "\n"){
                    str += "\n";
                }
                Options.blackList = str;
                nav.back();
            }, false);
            document.getElementById("btnCancel").addEventListener("click",function(){
                nav.back();
            },false);
            if(Options.blackList)document.getElementById("txtBlackList").value = Options.blackList ;
        },

        unload: function () {
        }
    });
})();
