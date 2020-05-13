function ChatterController(chatter, printer) {
    this.chatter = chatter;
    this.printer = printer;
    this.currentLanguage = navigator.language || navigator.userLanguage || navigator.languages;//chatter.userLanguage;
    this.liveAgent = false;
    this.systemName = null;

    if (this.currentLanguage != "zh-CHS")
        this.currentLanguage = this.currentLanguage.split("-")[0]; 

}

ChatterController.prototype.sendMessage = function (label, question, display, language, showAnswer = true) {

    if (question != '') {
        //$('#txtQuestion').prop("disabled", true);
        if (display) {
            this.printer.createDivMessage(this.chatter.systemName, this.chatter.userInfo.userName, label);
        }

        if (!this.liveAgent && showAnswer)
            this.statusConversation("writing");
            
        this.chatter.userText = question;
        this.chatter.botText = "";
        this.chatter.userLanguage = language;

        var formData = new FormData();

        if (showAnswer) {
            $.ajax({
                url: rootDir + 'GetConversation',
                cache: false,
                data: this.chatter,
                method: "POST",
                context: this,
                //success: function () {
                //    clearInterval(intervalId);
                //    intervalId = setInterval(receiveTimeout, 500);
                //},
                error: function (error) {
                    this.statusConversation("offline");
                    console.log("Error getting answer of the question. Error: " + error);
                }
            });
        }
        else {
            $.ajax({
                url: rootDir + 'Respond',
                cache: false,
                contentType: "application/json; charset=utf-8",
                data: `{"sessionID":"${this.chatter.sessionId}","userInput":"${question}","language":"${language}"}`,
                datatype: "json",
                method: "POST",
                error: function (error) {
                    this.statusConversation("offline");
                    console.log("Error getting answer of the question. Error: " + error);
                }
            });
        }
        if ($("#LiveAgentBtnStart")) {
            if (this.liveAgent)
                showEndBtn();
            else
                showStartBtn();
        }
    }
};

ChatterController.prototype.receiveMessage = function (data) {

    this.chatter.botText = data.botText.replace("[c:skypestarted]","");
    this.chatter.userLanguage = data.userLanguage;
    this.liveAgent = (/true/i).test(data.liveAgent);
    this.pw = false;

    // Check if talk with live Agent
    if (data.agentName && !this.systemName) {
        this.systemName = this.chatter.systemName;
        this.chatter.systemName = data.agentName;
    }
    else if (!data.agentName && this.systemName) {
        this.chatter.systemName = this.systemName;
        this.systemName = null;
    }

    if (controller.chatter.botText != '') {

        //text = this.chatter.botText;
        var commands = [];

        commands.push(new PhoneCommand(controller));
        commands.push(new LinkCommand(this));
        commands.push(new NewLineCommand(this));
        commands.push(new ImgCommand(this));
        commands.push(new PasswordCommand(this));
        commands.push(new UploadCommand(this));
        commands.push(new MultiSelectCommand(controller));

        var poscommands = [];

        //comandos antes da resposta
        for (var i = 0; i < commands.length; i++)
            if (commands[i].isMyCommand())
                commands[i].execute();
    }

    this.chatter.botText.split("[c:newdialog]").forEach(function (item) {

        if (item.indexOf("[@user@]") > 0) {
            if (item.indexOf("[@user@]startup") == -1) {
                var userResp = item.replace("[@user@]", "");
                controller.printer.createDivMessage(controller.chatter.systemName, "user", userResp, controller.pw);
            }
        } else {
            if (item.trim() != "")
                controller.printer.createDivMessage(controller.chatter.systemName, "bot", item, controller.pw);
        }
    });

    if (this.chatter.userLanguage !== this.currentLanguage) {
        this.refreshLanguage();
    }

    this.statusConversation("online");
    checkForAgent();
}

ChatterController.prototype.statusConversation = function (text) {
    if (text == "writing") {
        this.printer.createWritingDiv();
        this.updateStatusView(this.chatter.systemName + translation[this.currentLanguage]['isWriting']);        
    }
    else if (text == "online") {
        this.printer.removeWritingDiv();
        this.updateStatusView(translation[this.currentLanguage]['pleaseType']);        
    }
    else if (text == "sending") {
        this.printer.removeWritingDiv();
        this.updateStatusView(translation[this.currentLanguage]['sending']);
    }
    else {
        this.printer.removeWritingDiv();
        this.updateStatusView(translation[this.currentLanguage]['isOffline']);
    }
}

ChatterController.prototype.updateStatusView = function (status) {
    $('div[data-chatter="bot-status"]').text(status);
}

ChatterController.prototype.timeoutCall = function () {
    this.sendMessage('timeoutcall', 'timeoutcall', false);
}

ChatterController.prototype.refreshLanguage = function () {
    //this.currentLanguage = this.chatter.userLanguage;
    //this.currentLanguage = this.userLang;

    if (this.currentLanguage in translation) {
        $('#headerTitle').text(translation[this.currentLanguage]['title']);
        $('#btnSend').text(translation[this.currentLanguage]['send']);
        $('#txtQuestion').attr("placeholder", translation[this.currentLanguage]['questionPlaceHolder']);
        $('#h6Logoff').html(translation[this.currentLanguage]['logoff']);
        $('#h6TitleChatter').html(translation[this.currentLanguage]['title']);
    }
    else
        this.currentLanguage = 'en';

}