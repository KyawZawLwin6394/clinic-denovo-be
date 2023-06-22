const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require('../../config/db');
const uri = config.uploadsURI;

function getRandomText() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 3; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "img") {
            cb(null, './uploads/cherry-k/img');
        } else if (file.fieldname === "history") {
            cb(null, './uploads/cherry-k/history');
        } else if (file.fieldname === "phistory") {
            cb(null, './uploads/cherry-k/phistory');
        } else if (file.fieldname === "consent") {
            cb(null, './uploads/cherry-k/consent');
        } else if (file.fieldname === "payment") {
            cb(null, './uploads/cherry-k/payment');
        }

    },
    filename: function (req, file, cb) {
        let name = file.originalname.split(".")[0];
        let ext = file.originalname.split(".")[1];
        const randomText = getRandomText();
        if (file.fieldname === "img") {
            cb(null, name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "history") {
            cb(null, "TH-" + name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "phistory") {
            cb(null, "PH-" + name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "consent") {
            cb(null, "CS-" + name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "payment") {
            cb(null, "PY-" + name + randomText + Date.now() + "." + ext)
        }


    },
});

exports.upload = multer({
    fileFilter: function (req, file, cb) {
        for (let i = 0; i < uri.length; i++) {
            if (!fs.existsSync(uri[i])) {
                fs.mkdirSync(uri[i], { recursive: true });
            }
        }
        let filetypes = /jpeg|jpg|png|pdf/;
        let mimetype = filetypes.test(file.mimetype);
        const randomText = getRandomText();
        let extname = filetypes.test(
            path
                .extname(file.originalname + randomText + Date.now())
                .toLowerCase()
        );
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(
            "Error: File upload only supports the following filetypes - " +
            filetypes
        );
    },
    storage: storage,
}).fields(
    [
        {
            name: 'img',
            maxCount: 1
        },
        {
            name: 'history',
            maxCount: 3
        },
        {
            name: 'phistory',
            maxCount: 2
        },
        {
            name: 'consent',
            maxCount: 1
        },
        {
            name: 'payment',
            maxCount: 1
        }   
    ]
);
