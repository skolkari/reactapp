var containerId = "content";
var CurrentSelection = {};
var selectedTexts = [];
var currentSelectedText = '';
var isRightMB = false;
var startTime = '';
var endTime = '';
var allParagraphs = [];
var currentParaIndex = 0;
var sessionExpireTimeout;
var setIntervalTimer;
var sessionExpireTimeoutSeconds = 4;

var loggedinUserID = null;

var timerStarted = false;
var timeStart = false;
var isIdle = true;
var isSessionExpiredDisplayed = false;
var sessionEndTime = new Date().toString();
/** Idle time to session  waring when no document interaction happen*/
var idleCount = 5;
/** Count down Time for Session Expiry and logout */
var timeOut = 2;
var isExpiring = false;
var idleInterval;
var activeInterval;
var timeouts = [];
var intervals = [];

if (!window.CurrentSelection) {
    CurrentSelection = {}
}

CurrentSelection.Selector = {}

//get the current selection
CurrentSelection.Selector.getSelected = function () {
    var sel = '';
    if (window.getSelection) {
        sel = window.getSelection()
    } else if (document.getSelection) {
        sel = document.getSelection()
    } else if (document.selection) {
        sel = document.selection.createRange()
    }
    return sel
}
//function to be called on mouseup
CurrentSelection.Selector.mouseup = function (e) {
    console.log('mouseup event => ', e);

    e = e || window.event;
    isRightMB = false;

    if ("which" in e) // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3;
    else if ("button" in e) // IE, Opera 
        isRightMB = e.button == 2;

    if (isRightMB) {
        return;
    }

    var st = CurrentSelection.Selector.getSelected();
    console.log('set st => ', st);
    console.log('set st rangeCount => ', st.rangeCount);
    console.log('set st anchorOffset => ', st.anchorOffset);
    if (st && st.rangeCount == 0) {
        return;
    }
    if (document.selection && !window.getSelection) {
        var range = st;
        console.log('range.htmlText=> ', range.htmlText);
    } else {
        var range = st.getRangeAt(0);
        console.log('range => ', range);
        console.log('range content => ', range.toString());

        if (range.endOffset - range.startOffset == 0 || range.toString().trim() == '') {
            return;
        }

        var s = window.getSelection();
        var node = s.anchorNode;

        try {
            while (range.toString().indexOf(' ') != 0) {
                range.setStart(node, (range.startOffset - 1));
            }

            range.setStart(node, range.startOffset + 1);

            do {
                range.setEnd(node, range.endOffset + 1);
            } while (range.toString().substring(range.toString().length - 1).trim() != '')
        } catch (error) {

        }

        var newNode = document.createElement("span");
        newNode.setAttribute("class", "selectedText");
        try {
            range.surroundContents(newNode);
        } catch (error) {
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            } else if (document.selection) {
                document.selection.empty();
            }
        }

        var title = newNode.innerHTML;
        newNode.setAttribute("title", title);
        console.log('title => ', title);

        if (title.indexOf('selectedText') > -1) {
            currentSelectedText = '';
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            } else if (document.selection) {
                document.selection.empty();
            }
            return;
        }

        if (title) {
            currentSelectedText = title;
        }

        if (selectedTexts.length === 0) {
            $("table tbody").html('');
        }
        console.log('length => ', currentSelectedText.length)

        if (currentSelectedText.length > 0) {
            selectedTexts.push(currentSelectedText);
            var markup = "<tr><td>" + currentSelectedText + "</td><td class='text-center' id='delete-td' ><i class='fa fa-trash-alt' style='color:red'></i></td></tr>";
            $("table tbody").append(markup);
        }

        if (selectedTexts.length === 1) {
            $('#delete-all-keywords').removeAttr('disabled');
        }

        currentSelectedText = '';

        //Remove Selection: To avoid extra text selection in IE  
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    }
}

CurrentSelection.Selector.mousedown = function (e) {
    console.log('event => ', e);

    e = e || window.event;
    isRightMB = false;

    if ("which" in e) // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3;
    else if ("button" in e) // IE, Opera 
        isRightMB = e.button == 2;

    if (isRightMB) {
        return;
    }

    console.log('mousedown fired');
    console.log('elements => ', $(document).find('span.selectedText'));
    console.log('selectedTexts => ', selectedTexts);
    $.each($('span.selectedText'), function (index, value) {
        console.log(index + ':' + $(value).text());
        if (selectedTexts.indexOf($(value).text()) == -1) {
            if (!$(value).text()) {
                $("#" + containerId).html($("#" + containerId).html().replace('<span class="selectedText" title=""></span>', $(value).text()))
            } else {
                console.log('not found => ', $('span.selectedText')[index]);
                console.log('str => ', ($('span.selectedText')[index]).outerHTML);
                var eleOuterHTML = '<span class="selectedText" title="' + $(value).text() + '">' + $(value).text() + '</span>'
                $("#" + containerId).html($("#" + containerId).html().replace(eleOuterHTML, $(value).text()))
            }
        }
    });
}

/**
 * Run the app.
 */
$(document).ready(function () {
    console.log('document is ready');
    $('#login-panel').css('height', window.innerHeight + 'px');
    $('.bg-img').css('height', window.innerHeight + 'px');
    $('#main-panel').addClass('hide');

    $('#reset-upload').attr('disabled', 'true');
    $('#submit-btn').attr('disabled', 'true');
    $('#delete-all-keywords').attr('disabled', 'true');
    $('#prev-btn').attr('disabled', 'true');
    $('#next-btn').attr('disabled', 'true');
    $('#textPanel').addClass('disabled-content');
    $('#content').html('No content to display <br> Please upload file');

    $('.sesstion-timer').html(5);

    var markup = "<tr><td class='text-center border-0' colspan='2'>No Keywords Selected</td></tr>";
    var forms = document.getElementsByClassName('needs-validation');

    $("table tbody").append(markup);
    $('#validatedCustomFile').bind('change', getFile);
    menu = document.querySelector("#context-menu");

    $("#categoryName").on('change keyup paste', function () {
        if (selectedTexts.length > 0 && $('#categoryName').val().length > 0) {
            $('#submit-btn').removeAttr('disabled');
        } else {
            $('#submit-btn').attr('disabled', 'true');
        }
    });

    $('#submit-btn').on('click', () => {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            if (form.id == 'category-form') {
                // form.addEventListener('submit', function (event) {
                console.log('form.checkValidity => ', form.checkValidity());
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    $('#loadingModal').modal('show');
                    endTime = new Date();
                    var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
                    var resultInMinutes = Math.round(difference / 60000);
                    console.log('resultInMinutes => ', resultInMinutes);
                    var keywords = 'Category Name: ' + $('#categoryName').val() + '\n\n';
                    keywords = keywords + 'Total time: ' + resultInMinutes + ' Minutes' + '\n\n' + selectedTexts.join(',');
                    download(keywords, $('#categoryName').val(), 'text/plain');
                    selectedTexts = [];
                    // $("#" + containerId).html('');
                    $("table tbody").html("");
                    $('#submit-btn').attr('disabled', 'true');
                    $('#delete-all-keywords').attr('disabled', 'true');
                    $("table tbody").append(markup);
                    $('#categoryName').val('');

                    $('#para-' + currentParaIndex).addClass('hide');
                    currentParaIndex = currentParaIndex + 1;
                    if (currentParaIndex == allParagraphs.length - 1) {
                        $('#next-btn').attr('disabled', 'true');
                    }
                    $('#para-' + currentParaIndex).removeClass('hide');
                    form.classList.remove('was-validated');

                    setTimeout(() => {
                        $('#loadingModal').modal('hide');
                    }, 1000);
                }
                // form.classList.add('was-validated');
                // }, false);
            }
        });
    });

    $('.keywords-table-section').on("click", "#keywordsTable tr td", function (e) {
        if (this.id == 'delete-td') {
            console.log('this => ', this);
            var col = this.cellIndex,
                row = this.parentNode.rowIndex;
            console.log("row no:" + row + "col no :" + col);
            $(this).closest("tr").remove();

            var keyword = selectedTexts[row - 1];

            var eleOuterHTML = '<span class="selectedText" title="' + keyword + '">' + keyword + '</span>'
            $("#" + containerId).html($("#" + containerId).html().replace(eleOuterHTML, keyword))

            selectedTexts.splice((row - 1), 1);

            if (selectedTexts.length === 0) {
                $('#submit-btn').attr('disabled', 'true');
                $('#delete-all-keywords').attr('disabled', 'true');
                $("table tbody").append(markup);
            }
        }
    });

    $('#delete-all-keywords').on('click', () => {
        selectedTexts.forEach(keyword => {
            var eleOuterHTML = '<span class="selectedText" title="' + keyword + '">' + keyword + '</span>'
            $("#" + containerId).html($("#" + containerId).html().replace(eleOuterHTML, keyword))
        });
        selectedTexts = [];
        if (selectedTexts.length === 0) {
            $("table tbody").html("");
            $('#submit-btn').attr('disabled', 'true');
            $('#delete-all-keywords').attr('disabled', 'true');
            $("table tbody").append(markup);
        }
    });

    $('#prev-btn').on('click', () => {
        $('#para-' + currentParaIndex).addClass('hide');
        currentParaIndex = currentParaIndex - 1;
        if (currentParaIndex == 0) {
            $('#prev-btn').attr('disabled', 'true');
        } else {
            $('#next-btn').removeAttr('disabled', 'true');
        }
        $('#para-' + currentParaIndex).removeClass('hide');
    });

    $('#next-btn').on('click', () => {
        console.log('allParagraphs 12=> ', allParagraphs);

        if($('#categoryName').val().length == 0) {
            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            var forms = document.getElementsByClassName('needs-validation');
            // Loop over them and prevent submission
            var validation = Array.prototype.filter.call(forms, function (form) {
                if (form.id == 'category-form') {
                    // form.addEventListener('submit', function (event) {
                    console.log('form.checkValidity => ', form.checkValidity());
                    if (form.checkValidity() === false) {
                        form.classList.add('was-validated');
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            });
        } else {
            $('#para-' + currentParaIndex).addClass('hide');
            currentParaIndex = currentParaIndex + 1;
            if (currentParaIndex == allParagraphs.length - 1) {
                $('#next-btn').attr('disabled', 'true');
            } else {
                $('#prev-btn').removeAttr('disabled', 'true');
            }
            $('#para-' + currentParaIndex).removeClass('hide');
        }
    });

    $('#login-btn').on('click', () => {
        loadJSON(function (response) {
            // Parse JSON string into object
            var actual_JSON = JSON.parse(response);
            console.log('actual_JSON => ', actual_JSON);
            const loginData = actual_JSON.loginData;
            const loginId = $('#userid').val();
            const loginPwd = $('#pwd').val();
            if (loginData.filter(x => x.userid == loginId && x.password == loginPwd).length > 0) {
                loggedinUserID = loginId;
                setCookie(loginId, 1); // change time here
                $('#main-panel').removeClass('hide');
                $('#login-panel').addClass('hide');
                $(".userid-display-label").html('Welcome ' + loginId);
                $('#userid').val('');
                $('#pwd').val('');
                Array.prototype.filter.call(forms, function (form) {
                    if (form.id == 'login-form') {
                        form.classList.remove('was-validated');
                    }
                });
                // setSessionTimeout();
                // first param - total valid session time in seconds
                // before how many seconds alert needs to be displayed
                initSessionConfig(180, 15)
                initiateSession();
            } else {
                if (loginId && loginPwd) {
                    $('#invalid-login').css('display', 'block');
                }
                Array.prototype.filter.call(forms, function (form) {
                    if (form.id == 'login-form') {
                        form.classList.add('was-validated');
                    }
                });
            }
        });
    });

    $('#logout-btn').on('click', () => {
        logout();
    });

    $('#test-btn').on('click', () => {
        writeJSON();
    });

    $("#" + containerId).bind("mouseup", CurrentSelection.Selector.mouseup);
    $("#" + containerId).bind("mousedown", CurrentSelection.Selector.mousedown);
    checkCookie();
});

function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'logins.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function getFile(event) {
    const input = event.target
    if ('files' in input && input.files.length > 0) {
        placeFileContent(input.files[0]);
    }
}

function placeFileContent(file) {
    $('.custom-file-label').html(file.name);
    readFileContent(file).then(content => {
        startTime = new Date();
        $('#textPanel').removeClass('disabled-content');
        $('#reset-upload').removeAttr('disabled', 'true');
        console.log('length => ', content.length);
        $('#para-0').removeClass('hide');
        $('#next-btn').removeAttr('disabled', 'true');
    }).catch(error => console.log(error));
}

function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = (event) => {
            $("#" + containerId).html('');
            const content = event.target.result;
            allParagraphs = content.split(/\r\n|\n/);
            allParagraphs = allParagraphs.filter(x => x != '');
            // Reading line by line
            allParagraphs.forEach((line, i) => {
                console.log(line);
                // const containerHTML = $("#" + containerId).html();
                // $("#" + containerId).html(containerHTML + '<br>' + line);

                var node = document.createElement("div");
                node.id = 'para-' + i;
                node.className = 'hide';
                var textnode = document.createTextNode(line);
                node.appendChild(textnode);
                $("#" + containerId).append(node);
            });
            console.log('allParagraphs 1=> ', allParagraphs);
            resolve(allParagraphs);
        };

        reader.onerror = (event) => {
            reject(event.target.error.name);
        };

        reader.readAsText(file);
    });
}

function download(data, filename, type) {
    var file = new Blob([data], {
        type: type
    });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function logout() {
    document.cookie = "sessionCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    $('#login-panel').css('height', window.innerHeight + 'px');
    $('.bg-img').css('height', window.innerHeight + 'px');
    $('#sessionModal').modal('hide')
    $('#main-panel').addClass('hide');
    $('#login-panel').removeClass('hide');
    $('#reset-upload').attr('disabled', 'true');
    $('#submit-btn').attr('disabled', 'true');
    $('#delete-all-keywords').attr('disabled', 'true');
    $('#prev-btn').attr('disabled', 'true');
    $('#next-btn').attr('disabled', 'true');
    $('#textPanel').addClass('disabled-content');
    $('#content').html('No content to display <br> Please upload file');
    clearTimeout(sessionExpireTimeout);
    
    $( "#main-panel" ).unbind();
    isSessionExpiredDisplayed = true;
    removeIsUserActive();
    removeLocalStorage();
    stopIdle();
    stopTimer();
}

const debounce = (func, delay) => { 
    let debounceTimer 
    return function() { 
        const context = this
        const args = arguments 
            clearTimeout(debounceTimer) 
                debounceTimer 
            = setTimeout(() => func.apply(context, args), delay) 
    } 
}

function initiateSession() {
    $( "#main-panel" ).bind(`
        keydown 
        click 
        wheel 
        mousemove 
        DOMMouseScroll 
        mousewheel 
        mousedown 
        scroll 
        touchstart 
        touchmove 
        `, 
        debounce(function() { 
            console.log('trigger active');
            resetTimer();
        }, 500)
    );
}

function initSessionConfig(isessionTimeout, isessionTimeOutAfter) {

    let sessionTimeout = isessionTimeout >= 30 ? isessionTimeout/60 : 0.5; // 0.5 min default
    let sessionTimeOutAfter = isessionTimeOutAfter/60; //5 min
    //Since we have to show the timeout alert 'sessionTimeOutAfter'(for ex: 5min) before the actual 'sessionTimeout' (for ex: 30 min)
    let sessionTimeoutDelta;
    if (sessionTimeout > sessionTimeOutAfter) {
      sessionTimeoutDelta = sessionTimeout - sessionTimeOutAfter;  
    }
    else {
      //if the sessionTimeout is less than 5 min, then the counter will appear in sessionTimeout/2 min
      if (sessionTimeout >= 0.5) {
        sessionTimeOutAfter = sessionTimeout/2;
        sessionTimeoutDelta = sessionTimeout - sessionTimeOutAfter;
      }
    }

    let expiryTime = (new Date()).toString();
    idleCount = sessionTimeoutDelta;
    timeOut = sessionTimeOutAfter;
    removeLocalStorage();
    reset(true, expiryTime, loggedinUserID);
    setTimerClosed(true);
    setTimerStart(false);
}

function resetTimer() {
    console.log('active');
    if (timerStarted || isSessionExpiredDisplayed) {
      console.log('returning');
      return;
    }
    // checking if user is in active state, otherwise, it should start calculate session timer.
    if(!getIsUserActive()) {
      console.log('active 1');
      setIsUserActive(true);
    }

    idleInterval = setInterval(() => {
        console.log('idle interval');
        removeIsUserActive();
        const dt = new Date().toString();
        setTimerClosed(true);
        reset(true, dt, loggedinUserID);
    }, 1000);
}

function getIsUserActive() {
    return localStorage.getItem('expiryDetails.isUserActive.' + loggedinUserID);
}

function setIsUserActive(isActive) {
    localStorage.setItem('expiryDetails.isUserActive.' + loggedinUserID, isActive);
}

function removeIsUserActive() {
    localStorage.removeItem('expiryDetails.isUserActive.' + loggedinUserID);
}

function removeLocalStorage() {
    for (let i = 0, len = localStorage && localStorage.length; i < len; ++i) {
        let matchStorage = localStorage.key(i) ? localStorage.key(i).match(new RegExp(`^expiryDetail`)): '';
        if (matchStorage && matchStorage.length > 0) {
            localStorage.removeItem(localStorage.key(i));
        }
    }
}

function setLocalStorage(time, userId, timerStart = false) {
    setSessionEndTime(time);
    let obj = {
        startTime: new Date(),
        expiryTime: new Date(time),
        timerStart: timerStart == undefined ? timeStart : timerStart,
        isTimerClosed: isIdle
    }
    localStorage.setItem('expiryDetails.' + userId, JSON.stringify(obj));
}

function setSessionTimeout() {
    var sessionCookie = JSON.parse(getCookie("sessionCookie"));
    var expiresAt = (sessionCookie && sessionCookie.expires) ? sessionCookie.expires : null;
    console.log('expiresAt => ', expiresAt);

    if (!expiresAt) {
        return;
    }

    var expireTime = new Date(expiresAt).toISOString();
    var currentTime = new Date().toISOString();

    var parsedExpireTime = Date.parse(expireTime);
    var parsedCurrentTime = Date.parse(currentTime);

    var convertedExpireTime = new Date(parsedExpireTime);
    var convertedCurrentTime = new Date(parsedCurrentTime);

    var diff = (convertedCurrentTime.getTime() - convertedExpireTime.getTime()) / 1000;
    diff /= 60;
    var diffinMin = Math.abs(Math.round(diff));

    var timeoutInMS = diffinMin * 60 * 1000;

    sessionExpireTimeout = setTimeout(() => {
        $('#sessionModal').modal({
            keyboard: false,
            backdrop: 'static'
        });

        setIntervalTimer = setInterval(() => {
            $('.sesstion-timer').html(sessionExpireTimeoutSeconds);
            sessionExpireTimeoutSeconds = sessionExpireTimeoutSeconds - 1;
            if (sessionExpireTimeoutSeconds == 0) {
                setTimeout(() => {
                    clearInterval(setIntervalTimer);
                    logout();
                }, 1000);
            }
        }, 1000);
    }, timeoutInMS);
}

function setSessionEndTime(time) {
    sessionEndTime = time;
}

function keepAlive(shouldAddTime, expiryTime = '', userId = '') {
    console.log('keepAlive');
    let date = expiryTime ? expiryTime : new Date();
    let sessionEndTime = shouldAddTime ? new Date(new Date(date).getTime() + timeOut * 60000 + idleCount * 60000) : new Date(date);
    setLocalStorage(sessionEndTime, userId ? userId: loggedinUserID, false);
}

function reset(shouldAddTime, expiryTime, userId) {
    keepAlive(shouldAddTime, expiryTime, userId);
    isExpiring = false;
    timerStarted = false;
    stopIdle();
    stopTimer();
    processIdle(0);
}

function stopIdle() {
    console.log('stop idle called');
    if (idleInterval) {
        clearInterval(idleInterval);
        idleInterval = undefined;
        console.log('idle interval cleared');
    }

    if (activeInterval) {
        clearInterval(activeInterval);
        activeInterval = undefined;
        console.log('active interval cleared');
    }
}

function stopTimer() {
    setTimerStarted(false);
}

function processIdle(n) {
    if (n == 0) {
        console.log('session is idle');
    }
    if (getExpiryData()) {
        isSessionExpiredDisplayed = false;
        pulseTimer();
    }
}

function pulseTimer() {
    let duration = Math.floor(timeOut * 60);
    console.log('pulse timer');
    activeInterval = setInterval(() => {
        console.log('hit');
        if (!getIsUserActive()) {
            console.log('hittu');
            const currentTime = (new Date()).getTime();
            let expiryDetails = getExpiryData();
            let expiryDate = (new Date(expiryDetails.expiryTime)).getTime();
            // let timerStart = JSON.parse(expiryDetails.timerStart);
            let diff_sec = Math.round((new Date(expiryDate).getTime() - currentTime) / 1000);
            let startSessionTimerAt = expiryDate - timeOut * 60 * 1000;
            
            // preventing from timer to be negative
            if (currentTime > startSessionTimerAt && diff_sec >= 0) {
                console.log('hit 1');

                if (!getIsExpire()) {
                    setTimerStarted(true);
                    let lastReqTime = getExpiryData() && getExpiryData().expiryTime;

                    if ((new Date(lastReqTime).getTime()) != (new Date(getSessionEndTime())).getTime()) {
                        setSessionEndTime(lastReqTime);
                        reset(false, lastReqTime, this.userDetails.dsId);
                    }

                    $('#sessionModal').modal({
                        keyboard: false,
                        backdrop: 'static'
                    });
                    setIsExpire(true);
                }

                // display session timeout dialog here
                let n = duration - diff_sec;
                let d = duration;

                $('.sesstion-timer').html((d - +n));

                if ((d - +n) == 0) {
                    var logoutTimer = setTimeout(() => {
                        clearTimeout(logoutTimer);
                        logout();
                    }, 1000);
                }

                console.log('test 2 => ', (d - +n));
                
                  
                // setTimerStarted(true)
                // telling timer is started but not closed yet
                setTimerClosed(false);
                setTimerStart(true);
            } else if (currentTime >= expiryDate) { // When expiry date is passed it should display session expired message.
                console.log('hit 2');
                clearInterval(activeInterval);
                // logout here
            }
        }
    }, 1000);
}

function setTimerStarted(timerStart) {
    timerStarted = timerStart;
}

function getExpiryData() {
    if (JSON.parse(localStorage.getItem('expiryDetails.' + loggedinUserID))) {
        return JSON.parse(localStorage.getItem('expiryDetails.' + loggedinUserID));
    } else {
        console.log('keeping alive from here');
        keepAlive(true);
        return JSON.parse(localStorage.getItem('expiryDetails.' + loggedinUserID));
    }
}

function setTimerClosed(val) {
    isIdle = val;
    let expiryDetails = getExpiryData();
    expiryDetails.isTimerClosed = val;
    localStorage.setItem('expiryDetails.' + loggedinUserID, JSON.stringify(expiryDetails));
}

function setTimerStart(val) {
    let expiryDetails = getExpiryData();
    expiryDetails.timerStart = val;
    timeStart = val;
    localStorage.setItem('expiryDetails.' + loggedinUserID, JSON.stringify(expiryDetails));
}

function setCookie(userid, minutes) {
    var d = new Date();
    d.setTime(d.getTime() + (minutes * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    console.log('expires => ', expires);
    var sessionCookie = {
        'userid': userid,
        'expires': d.toGMTString()
    }
    document.cookie = "sessionCookie=" + JSON.stringify(sessionCookie) + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "{}";
}

function checkCookie() {
    var sessionCookie = JSON.parse(getCookie("sessionCookie"));
    if (sessionCookie && sessionCookie.userid) {
        $('#main-panel').removeClass('hide');
        $('#login-panel').addClass('hide');
        document.getElementById("category-form").reset();
        selectedTexts = [];
        $("#" + containerId).html('');
        $(".userid-display-label").html('Welcome ' + sessionCookie.userid);
        setSessionTimeout();
    }
}

function getIsExpire() {
    return isExpiring;
}

function setIsExpire(isExpire) {
    isExpiring = isExpire;
}

function getSessionEndTime() {
    return sessionEndTime;
}
