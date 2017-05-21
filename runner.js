$.fn.extend({
    runner: function () {
        var $container = this[0],
            $tabClass = "tab rows",
            $subTabClass = "sub-tab",

            $navClass = "nav",
            $subNavClass = "sub-nav",

            $navBtnClass = "nav-btn",
            $navLinkClass = "nav-link",
            $activeClass = "active",
            $div = document.createElement("div"),
            $caretNode = $div.cloneNode();

        $container.id = "Runner";

        // var $caret = {
        //     node: $caretNode,
        //     top: 0,
        //     left: 0,
        //     charSize: 0
        // }

        var $caret = (function () {
            var caretNode = document.createElement('div'),
                caretClass = "caret",
                charWeight,
                caretX;

            function getCaretX() {
                return +caretNode.style.left.replace("px", "");
            }

            function caretIndex() {
                var elementX = getCaretX()
                return Math.round(elementX / charWeight) - 1;
            }

            function getLineUnderCaret() {
                var bounds = caretNode.getBoundingClientRect();
                var elementsUnderCaret = document.elementsFromPoint(bounds.left, bounds.top + 5);
                var line;

                var i = 0;
                while (true) {
                    if (elementsUnderCaret[i].className === "code-line") {
                        line = elementsUnderCaret[i];
                        break;
                    }

                    if (i == elementsUnderCaret.length - 1) {
                        break;
                    }

                    i++;
                }

                var charsInLine = Math.floor(line.clientWidth / charWeight);
                var text = line.getElementsByTagName("pre")[0];
                var linesCount = Math.ceil(text.innerText.replace(/\n+$/g, '').length / charsInLine);
                var lineHeight = line.offsetHeight / linesCount;

                return {
                    node: text,
                    lineNode: line,
                    innerText: text.innerText.replace(/\n+$/g, ''),
                    height: lineHeight,
                    count: linesCount
                }
            }

            function insert(key) {
                var line = getLineUnderCaret();
                var lineText = line.innerText.replace(/\n+$/g, '');
                var index = caretIndex();
                var linArray = lineText.split("");
                linArray.splice(index + 1, 0, key);
                line.node.innerHTML = formatLine(linArray.join(""));
                moveRight();
            }

            function caretBackspace() {
                var line = getLineUnderCaret();
                var lineText = line.innerText;
                var index = caretIndex();

                var linArray = lineText.split("");
                if (index + 1 > linArray.length) {
                    moveHorizontal(linArray.length - (index + 1), 0, 0)
                    index = linArray.length - 1;
                }

                if (index > 0) {
                    linArray.splice(index, 1);
                    line.lineNode.innerHTML = formatLine(linArray.join(""));
                    moveLeft();
                } else if (index === 0) {
                    line.lineNode.innerHTML = formatLine("&#8203;");
                    moveLeft();
                } else {
                    var previousLine = line.lineNode.previousSibling;

                    if (!previousLine || previousLine.className !== "code-line") {
                        if (index === -1)
                            return;

                        if (linArray.length > 1) {
                            linArray.splice(index, 1);
                            line.lineNode.innerHTML = formatLine(linArray.join(""));
                            moveLeft();
                        } else {
                            line.lineNode.innerHTML = formatLine("&#8203;");
                            moveLeft();
                        }

                        return;
                    }

                    var prevText = previousLine.getElementsByTagName("pre")[0];
                    var combidedLine = prevText.innerText.replace(/(\n\r|\n|\r)+$/g, '') + lineText;


                    moveUp();
                    moveToEnd();
                    line.lineNode.parentNode.removeChild(line.lineNode);
                    previousLine.innerHTML = formatLine(combidedLine);
                }
            }

            function caretDelete() {
                var line = getLineUnderCaret();
                var index = caretIndex();
                if (index === line.innerText.length - 1) {
                    var nextLine = line.node.nextSibling;

                    if (!nextLine || nextLine.className !== "code-line")
                        return;

                    var combidedLine = line.innerText + nextLine.innerText;
                    line.node.innerHTML = formatLine(combidedLine);

                    nextLine.parentNode.removeChild(nextLine);
                } else {
                    var linArray = line.innerText.split("");
                    linArray.splice(index + 1, 1);
                    line.node.innerHTML = formatLine(linArray.join(""));
                }
            }

            function moveUp() {
                var line = getLineUnderCaret();
                var prevLine = line.lineNode.previousSibling;
                if (prevLine && prevLine.className === "code-line") {
                    caretNode.style.top = prevLine.offsetTop + "px";
                }
            }

            function moveDown() {
                var line = getLineUnderCaret();
                if (line.count > 1) {
                    moveVertical(line.height)
                } else {
                    var nextLine = line.node.nextSibling;
                    if (nextLine && nextLine.className === "code-line") {
                        caretNode.style.top = nextLine.offsetTop + "px";
                    }
                }
            }

            function moveLeft() {
                var i = caretIndex();
                if (i < 0) {
                    moveUp();
                    moveToEnd();
                } else {
                    var left = caretNode.style.left.replace("px", "");
                    caretNode.style.left = (+left - +charWeight) + "px";
                }
            }

            function moveRight() {
                var left = caretNode.style.left.replace("px", "");
                caretNode.style.left = (+left + +charWeight) + "px";
            }

            function moveVertical(pxStep = 0, to = 0) {
                var caretTop = 0;
                var top = +caretNode.style.top.replace("px", "");

                if (pxStep !== 0) {
                    caretTop = top + pxStep;
                } else if (to !== 0) {
                    caretTop = to;
                }

                caretNode.style.top = caretTop + "px";
            }

            function moveHorizontal(char = 1, pxStep = 0, to = 0) {
                var caretLeft = 0;
                var left = +caretNode.style.left.replace("px", "");

                if (char !== 0) {
                    caretLeft = left + (char * charWeight);
                } else if (pxStep !== 0) {
                    caretLeft = left + pxStep;
                } else if (to !== 0) {
                    caretLeft = to;
                }

                caretNode.style.left = caretLeft + "px";
            }

            function moveToStart() {
                moveHorizontal(0);
            }

            function moveToEnd() {
                var line = getLineUnderCaret();
                moveHorizontal(0, 0, (line.innerText.length) * charWeight);
            }

            function caretEvent(e) {
                var codeRunner = document.getElementById("Runner");
                if (!codeRunner || caretNode.className != caretClass)
                    return;

                e = e || window.event;

                var keycode = e.keyCode || e.which;
                if (keycode == 16 || e.ctrlKey)
                    return;
                //console.log(keycode)
                switch (true) {
                    case keycode === 37:
                        moveLeft();
                        break;
                    case keycode === 39:
                        moveRight();
                        break;
                    case keycode === 38:
                        moveUp();
                        break;
                    case keycode === 40:
                        moveDown();
                        break;
                    case keycode === 8:
                        caretBackspace();
                        break;
                    case keycode === 46:
                        caretDelete();
                        break;
                    case keycode === 32 || keycode === 90 || (keycode < 90 && keycode > 32) || (keycode >= 186 && keycode <= 222):
                        insert(e.key);
                        break;
                }
            }

            function getElementStyle(ele) {
                if (ele.currentStyle) { // sort of, but not really, works in IE
                    return ele.currentStyle;
                } else if (document.defaultView) { // works in Opera and FF
                    return document.defaultView.getComputedStyle(ele, null);
                } else {
                    return null;
                }
            }

            function initCaret(tab) {
                caretNode.style.top = $caret.top + "px";
                caretNode.style.left = $caret.left + "px";

                tab.appendChild(caretNode);
            }

            function setCaret(e) {
                e.stopImmediatePropagation();
                var codeTab = e.target.closest("div.tab");

                if (!codeTab) {
                    $caret.node.className = "";
                    return;
                }

                var row = e.target.closest("div.code-line");
                if (!row) {
                    return;
                }

                var textDiv = row.getElementsByTagName("pre")[0];

                caretNode.className = caretClass;

                var bounds = row.getBoundingClientRect();
                var clickPosition = e.clientX - bounds.left,
                    text = textDiv.innerText;

                moveVertical(0, row.offsetTop - 1);

                var style = getElementStyle(e.target);
                var c = document.createElement('canvas');
                var ctx = c.getContext('2d');
                ctx.font = style.fontSize + " " + style.fontFamily;
                var tabStyle = getElementStyle(codeTab);
                var lineStyle = getElementStyle(textDiv);
                var testStr = "",
                    offset = +tabStyle.borderWidth.replace("px", ""),
                    length;
                if (text.length == 0) {
                    $caret.left = 0;
                    initCaret(codeTab);
                }

                var left;
                for (var i = 0; i < text.length; i++) {
                    testStr += text[i];
                    var l = ctx.measureText(testStr).width;
                    charWeight = l / (i + 1);
                    if (l > clickPosition || l == clickPosition) {
                        left = l - charWeight;
                        return;
                    } else {
                        length = l - offset;
                    }

                    if (i == text.length - 1 && l < clickPosition) {
                        left = text.length * charWeight;
                    }
                }

                initCaret(codeTab);
                moveHorizontal(0, 0, left);
            }

            document.addEventListener("keydown", caretEvent, false);

            return {
                setCaret: setCaret,
                charWeight: charWeight
            }
        }());

        var kw = ["function", "var", "let"]; //"[ .*(\]":"Fn"  
        var htmlOperators = ["<", ">", "></", "</"];


        function testFunc() {
            var t = "Hello world!";

            function showAlert(msg) {
                alert(msg);
            }

            showAlert(t);
        }

        function formatLine(line, i) {
            var regex = new RegExp(kw.join("|"), "g");//.replace(/ /g, '\u00a0')
            var htmlRegex = new RegExp(htmlOperators.join("|"), "g")
            var codeLine = line;
            codeLine = line.replace(/(\n\r|\n|\r)+$/g, '')
                .replace(htmlRegex, function (match, i, v) { return "<span class=\"fgf\">" + match + "</span>" })
                .replace(regex, function (match, i, v) { return "<span class=\"Kw\">" + match + "</span>" });

            return "<div class=\"line-number\"><div>1</div></div><pre><span>" + codeLine + "</span></pre>";
        }

        function formatLines(lines) {

        }

        var defaults = {
            tabs: [{
                name: "javascript",
                btn: "JS",
                sourse: testFunc.toString(),//"function httpGet(theUrl)\n{\n    if (window.XMLHttpRequest)\n    {\n        // code for IE7+, Firefox, Chrome, Opera, Safari\n        xmlhttp=new XMLHttpRequest();\n    }\n    else\n    {\n        // code for IE6, IE5\n        xmlhttp=new ActiveXObject(\"Microsoft.XMLHTTP\");\n    }\n    xmlhttp.onreadystatechange=function()\n    {\n        if (xmlhttp.readyState==4 && xmlhttp.status==200)\n        {\n            createDiv(xmlhttp.responseText);\n        }\n    }\n    xmlhttp.open(\"GET\", theUrl, false);\n    xmlhttp.send();    \n}",
                sourseUrl: "default.js",
                id: "JsPanel"
            },
            {
                name: "style sheet",
                btn: "CSS",
                sourse: "css",
                sourseUrl: "",
                id: "CssPanel"
            },
            {
                name: "html",
                btn: "HTML",
                sourse: "<button>click</button>",
                sourseUrl: "",
                id: "HtmlPanel"
            }],
            subTabs: ["Result", "Console"],
            resize: true
        }

        function ruCode() {
            var result = $container.querySelector("#Result");
            result.innerHTML = "";
            var iframe = document.createElement("iframe");
            result.appendChild(iframe);
            var iframe = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;

            var body = document.createElement("body")
            body.innerHTML = $container.querySelector("#HtmlPanel").innerText;

            iframe.document.body.parentNode.replaceChild(body, iframe.document.body);

            var script = document.createElement("script")
            script.type = "text/javascript";
            script.text = "//<![CDATA[\nwindow.onload=function(){" + $container.querySelector("#JsPanel").innerText + "}//]]> ";

            iframe.document.head.appendChild(script);
        }

        if (defaults.tabs.length > 0) {
            var $nav = $div.cloneNode();
            $nav.className = $navClass;

            var $runBtn = $div.cloneNode();
            $runBtn.className = $navBtnClass;
            $runBtn.style.float = "left";
            $runBtn.style.marginLeft = "2px";
            $runBtn.innerText = "RUN";

            $runBtn.addEventListener("click", ruCode, false);

            var $copyLink = $div.cloneNode();
            $copyLink.className = $navLinkClass;
            $copyLink.innerText = "Copy";

            $container.appendChild($nav);
            $nav.appendChild($runBtn);
            $nav.appendChild($copyLink);
        }

        for (var i = 0; i < defaults.tabs.length; i++) {
            var className = i == 0 ? $activeClass : "";

            var $btn = $div.cloneNode();
            $btn.className = className + " " + $navBtnClass;
            $btn.innerText = defaults.tabs[i].btn;
            $btn.dataset.targetTab = i;
            $nav.appendChild($btn);

            var $code = $div.cloneNode();

            $code.className = className + " " + $tabClass;
            $code.id = defaults.tabs[i].id;

            $code.dataset.tab = i;
            var lines = defaults.tabs[i].sourse.split("\n");
            for (var e = 0; e < lines.length; e++) {
                var $line = $div.cloneNode();
                $line.innerHTML = formatLine(lines[e]);
                $line.className = "code-line";
                $code.appendChild($line);
                document.addEventListener("click", $caret.setCaret);
            }

            $container.appendChild($code);

            $btn.addEventListener("click", function (e) {
                var currentActive = $nav.getElementsByClassName($activeClass + " " + $navBtnClass);
                for (var j = 0; j < currentActive.length; j++) {
                    currentActive[j].className = currentActive[j].className.replace($activeClass, "").trim("")
                }

                var targetTab = this.dataset.targetTab;
                this.className += " " + $activeClass;

                var tabs = $container.getElementsByClassName($tabClass);
                for (var g = 0; g < tabs.length; g++) {
                    tabs[g].className = tabs[g].className.replace($activeClass, "").trim("");
                    if (tabs[g].dataset.tab == targetTab) {
                        tabs[g].className += " " + $activeClass;
                    }
                }
            });
        }

        if (defaults.subTabs.length > 0) {
            var $subNav = $div.cloneNode();
            $subNav.className = $subNavClass;
            $container.appendChild($subNav);

            if (defaults.resize) {
                var $resizer = $div.cloneNode();
                $resizer.className = "resizer";
                $container.appendChild($resizer);
                $resizer.addEventListener('mousedown', initResize, false);

                function initResize(e) {
                    window.addEventListener('mousemove', Resize, false);
                    window.addEventListener('mouseup', stopResize, false);
                }
                function Resize(e) {
                    var $element = $container.getElementsByClassName("tab active")[0];
                    $element.style.height = (e.clientY - $element.offsetTop - 60) + 'px';
                }
                function stopResize(e) {
                    window.removeEventListener('mousemove', Resize, false);
                    window.removeEventListener('mouseup', stopResize, false);
                }
            }

            for (var h = 0; h < defaults.subTabs.length; h++) {
                var $btn = $div.cloneNode();
                $btn.className = $navBtnClass;
                $btn.innerText = defaults.subTabs[h];
                $btn.dataset.subTargetTab = h;
                $subNav.appendChild($btn);

                var $tab = $div.cloneNode();
                $tab.className = $subTabClass;
                $tab.id = defaults.subTabs[h];

                $tab.innerText = defaults.subTabs[h];
                $tab.dataset.subTab = h;
                $container.appendChild($tab);

                $btn.addEventListener("click", function (e) {
                    var targetTab = this.dataset.subTargetTab;

                    var tabs = $container.getElementsByClassName($subTabClass);
                    for (var g = 0; g < tabs.length; g++) {
                        if (tabs[g].dataset.subTab == targetTab) {
                            if (tabs[g].className.includes($activeClass)) {
                                tabs[g].className = tabs[g].className.replace($activeClass, "").trim("");
                                this.className = this.className.replace($activeClass, "").trim("");
                            } else {
                                this.className += " " + $activeClass;
                                tabs[g].className += " " + $activeClass;
                            }
                        }
                    }
                });
            }
        }
    }
});