(function () {

    "use strict";


    /**
     * Variables.
     */
    var contextMenuLinkClassName = "context-menu__link";
    var contextMenuActive = "context-menu--active";

    var containerClassName = "content";
    var containerId = "content";
    var containerInContext;

    var clickCoords;
    var clickCoordsX;
    var clickCoordsY;

    var menu = document.querySelector("#context-menu");
    var menuState = 0;
    var menuWidth;
    var menuHeight;

    var windowWidth;
    var windowHeight;


    /**
     * Function to check if we clicked inside an element with a particular class
     * name.
     * 
     * @param {Object} e The event
     * @param {String} className The class name to check against
     * @return {Boolean}
     */
    function clickInsideElement(e, className) {
        var el = e.srcElement || e.target;

        if (el.classList.contains(className)) {
            return el;
        } else {
            while (el = el.parentNode) {
                if (el.classList && el.classList.contains(className)) {
                    return el;
                }
            }
        }

        return false;
    }

    /**
     * Get's exact position of event.
     * 
     * @param {Object} e The event passed in
     * @return {Object} Returns the x and y position
     */
    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //
    // C O R E    F U N C T I O N S
    //
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Initialise our application's code.
     */
    function init() {
        contextListener();
        clickListener();
        keyupListener();
        resizeListener();
    }

    /**
     * Listens for contextmenu events.
     */
    function contextListener() {
        document.addEventListener("contextmenu", function (e) {
            console.log('context menu called');
            containerInContext = clickInsideElement(e, containerClassName);
            console.log('containerInContext => ', containerInContext);
            if (containerInContext) {
                e.preventDefault();
                toggleMenuOn();
                positionMenu(e);
            } else {
                containerInContext = null;
                toggleMenuOff();
            }
        });
    }

    /**
     * Listens for click events.
     */
    function clickListener() {
        document.addEventListener("click", function (e) {
            var clickeElIsLink = clickInsideElement(e, contextMenuLinkClassName);

            if (clickeElIsLink) {
                e.preventDefault();
                menuItemListener(clickeElIsLink);
            } else {
                var button = e.which || e.button;
                if (button === 1) {
                    toggleMenuOff();
                }
            }
        });
    }

    /**
     * Listens for keyup events.
     */
    function keyupListener() {
        window.onkeyup = function (e) {
            if (e.keyCode === 27) {
                toggleMenuOff();
            }
        }
    }

    /**
     * Window resize event listener
     */
    function resizeListener() {
        window.onresize = function (e) {
            toggleMenuOff();
        };
    }

    /**
     * Turns the custom context menu on.
     */
    function toggleMenuOn() {
        if (menuState !== 1) {
            menuState = 1;
            menu.classList.add(contextMenuActive);
        }
    }

    /**
     * Turns the custom context menu off.
     */
    function toggleMenuOff() {
        if (menuState !== 0) {
            menuState = 0;
            menu.classList.remove(contextMenuActive);
        }
    }

    /**
     * Positions the menu properly.
     * 
     * @param {Object} e The event
     */
    function positionMenu(e) {
        clickCoords = getPosition(e);
        clickCoordsX = clickCoords.x;
        clickCoordsY = clickCoords.y;

        menuWidth = menu.offsetWidth + 4;
        menuHeight = menu.offsetHeight + 4;

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        if ((windowWidth - clickCoordsX) < menuWidth) {
            menu.style.left = windowWidth - menuWidth + "px";
        } else {
            menu.style.left = clickCoordsX + "px";
        }

        if ((windowHeight - clickCoordsY) < menuHeight) {
            menu.style.top = windowHeight - menuHeight + "px";
        } else {
            menu.style.top = clickCoordsY + "px";
        }
    }



    /**
     * Dummy action function that logs an action when a menu item link is clicked
     * 
     * @param {HTMLElement} link The link that was clicked
     */
    function menuItemListener(link) {
        if (selectedTexts.length === 0) {
            $("table tbody").html('');
        }
        console.log('currentSelectedText => ', currentSelectedText);
        if (!currentSelectedText || (currentSelectedText && !currentSelectedText.match(/[a-zA-Z0-9]/g))) {
            toggleMenuOff();
            return;
        }

        if (selectedTexts.length === 0) {
            $("table tbody").html('');
        }

        selectedTexts.push(currentSelectedText);

        if (selectedTexts.length === 1) {
            $('#submit-btn').removeAttr('disabled');
            $('#delete-all-keywords').removeAttr('disabled');
        }

        var markup = "<tr><td>" + currentSelectedText + "</td><td class='text-center' id='delete-td' ><i class='fa fa-trash-alt' style='color:red'></i></td></tr>";
        $("table tbody").append(markup);

        currentSelectedText = '';
        console.log("Task ID - " + containerInContext.getAttribute("data-id") + ", Task action - " + link.getAttribute("data-action"));
        toggleMenuOff();
    }

})();