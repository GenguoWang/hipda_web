/// <reference path="/js/helper.js" />
/// <reference path="/js/kingo.js" />
/// <reference path="/js/hipda.js" />
(function () {
    "use strict";
    var nav = KingoJS.Navigation;
    KingoJS.Page.define("/pages/newPM/newPM.html", {
        ready: function (element, options) {
            if (options && options.msgto) {
                document.getElementById("txtMsgto").value = options.msgto;
            }
            document.getElementById("btnNewPM").addEventListener("click", doSubmitNewPM, false);
            document.getElementById("btnCancelNewPM").addEventListener("click", function () { nav.back(); }, false);
        },

        unload: function () {
        }
    });
    function doSubmitNewPM() {
        var msgto = document.getElementById("txtMsgto").value;
        var message = document.getElementById("txtPMMessage").value;
        HiPDA.sendPM(msgto, message).then(function (res) {
            nav.back();
        });
    }
})();
