const fetch = require("node-fetch");

var io = null;

module.exports = {
    onMessage: (msg) => {
        if (msg.content.startsWith("!funnynumber")) {
            setTimeout(() => {
                fetch(
                        "https://konalt.us.to:4930/flaps_api/funnynumber/" +
                        msg.content.split(" ").slice(1).join(" ")
                    )
                    .then((r) => r.text())
                    .then((res) => {
                        io.emit("recieve_message", {
                            author: "flaps chelton",
                            content: res,
                        });
                    });
            }, 500);
            return msg.content;
        } else if (msg.content.startsWith("<")) {
            fetch(
                    "https://konalt.us.to:4930/flaps_api/userdata/" +
                    msg.content.split(" ")[0].substring(1)
                )
                .then((r) => r.text())
                .then((res) => {
                    if (res == "FlapsAPIUnknownUser") {
                        io.emit("recieve_message", {
                            author: msg.author,
                            content: msg.content,
                        });
                    } else {
                        io.emit("recieve_message", {
                            author: res,
                            content: msg.content.split(" ").slice(1).join(" "),
                        });
                    }
                });
            return "";
        }
    },
    init: (io2) => {
        io = io2;
    },
};