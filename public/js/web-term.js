"use strict";

if (typeof require === "function") {
    var $ = require("./jquery.min"),
        Terminal = require("./term");
}

(function ($) {
    var EventEmitter = Terminal.EventEmitter;

    blm("Do you really want to leave? You will lose this terminal session.");

    // Text size plugin
    $.fn.textSize = function () {
        var $self = this;

        function getOuterDimensions(elementDOM, row) {
            row = row || elementDOM;
            var boundingBox = elementDOM.getBoundingClientRect(),
                rowBouding = row.getBoundingClientRect(),
                width = boundingBox.width,
                height = rowBouding.height,
                computed = getComputedStyle(elementDOM),
                computedRow = getComputedStyle(row);

            width = width + parseInt(computed.marginRight) + parseInt(computed.marginLeft);
            height = height + parseInt(computedRow.marginTop) + parseInt(computedRow.marginBottom);

            return {
                width: width,
                height: height
            };
        }

        var row = $(".terminal > div:eq(1)");
        if (row.length && row.height() < 30) {
            row = row.get(0);
        } else {
            row = null;
        }

        var span = document.createElement("span");
        var newContent = document.createTextNode("o");
        span.appendChild(newContent);
        var domEl = $self.get(0);
        domEl && domEl.children && domEl.children.length && domEl.children[0].appendChild(span);

        var charSize = getOuterDimensions(span, row);
        var targetSize = getOuterDimensions($self.get(0));

        span.remove();

        return {
            x: Math.floor(targetSize.width / charSize.width),
            y: Math.floor(targetSize.height / charSize.height)
        };
    };

    // Web Term plugin
    $.fn.webTerm = function () {
        var $self = this;
        var term = new EventEmitter();
        var inherits = Terminal.inherits;

        term.updateSize = function () {
            var tSize = $(".terminal").textSize();
            //term.w.cols = tSize.x || Terminal.geometry[0];
             term.w.cols = 99;
            //term.w.rows = tSize.y || Terminal.geometry[1]; 
	     term.w.rows =24; //GC 13082016
            term.socket.emit("resize", term.w.cols, term.w.rows);
            term.tab.resize(term.w.cols, term.w.rows);
        };

        var _resizeTimer = null;
        $(window).on("resize", function () {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(term.updateSize, 100);
        });

        function openTerm(options) {
            term.socket = io.connect();

            // Initialize ui
            /// Create the window
            var win = term.w = new EventEmitter();
            win.$ = $self;
            win.$.addClass("webTerm-window");

            win.bind = function () {
                win.$.on("mousedown", function (ev) {
                    term.tab.focus();
                });
            };

            var $bar = $("<div>").addClass("bar");
            var $button = $("<div>").addClass("grip");
            var $title = $("<div>").addClass("title");

            $self.append($bar);
            $bar.append($title);

            /// Create the tab
            var colors = options.colors;
            colors.palette[16] = colors.background || '#000000';
            colors.palette[17] = colors.foreground || '#f0f0f0';
            var tab = term.tab = Terminal.call(term, {
                cols: win.cols,
                rows: win.rows,
                colors: colors.palette,
                boldAsBright: options.general.boldAsBright || false
            });

            // Create the terminal
            //term.socket.emit("create", win.cols, win.rows, function (err, data) {
	    term.socket.emit("create", win.cols, win.rows, function (err, data) {
                if (err) return self._destroy();
                term.emit("open tab", term);
                term.emit("open");
                term.updateSize();
            });

            // Listen for connect
            term.socket.on("connect", function () {
                term.emit("connect");
            });

            // Listen for data
            term.socket.on("data", function (data) {
                tab.write(data);
            });

            // Listen for kill event
            term.socket.on("kill", function () {
                window.close();
            });

            function updateSettings(err, settings) {
                // TODO Update colors
                $(".terminal").css("font-size", settings.general.font_size);
                term.updateSize();
            }

            term.socket.on("terminalSettings", updateSettings);

            tab.open(win.$.get(0));
            tab.focus();
            tab.on("data", function (data) {
                term.socket.emit("dataToServer", data);
            });

            win.bind();

            term.emit("load");
            term.emit("open");
            updateSettings(null, options);
        }

        // Open the terminal
        //$.getJSON("/api/settings/get", function (options) {
            //openTerm(options);
            openTerm({
  "general": {
    "font_size": 11,
    "shell": "bash",
    "start_command": ""
  },
  "colors": {
    "background": "#000000",
    "foreground": "#f0f0f0",
    "palette": [
      "#2e3436",
      "#cc0000",
      "#4e9a06",
      "#c4a000",
      "#3465a4",
      "#75507b",
      "#06989a",
      "#d3d7cf",
      "#555753",
      "#ef2929",
      "#8ae234",
      "#fce94f",
      "#729fcf",
      "#ad7fa8",
      "#34e2e2",
      "#eeeeec"
    ]
  }
})
        //});
    };
})($);

$(document).ready(function () {
    $(".term-container").webTerm();
});