const express = require('express');
const useragent = require('express-useragent');
const mongoose = require('mongoose')
const path = require('path');

const app = express();
const axios = require('axios');

const { Schema } = mongoose;

mongoose.connect('mongodb://127.0.0.1:27017/data',{ autoIndex: true,useNewUrlParser: true ,useFindAndModify: false,useUnifiedTopology: true});


const Log = new Schema({
    ip:  String,
    country: String,
    city:   String,
    updatedAt : Date,
    details: [
        {
            time: Date,
            browser:String,
            os:String,
            isMobile:Boolean,
            isDesktop:Boolean,
            isBot:Boolean

        }
    ],
    counts: Number

});
Log.statics.createLocalLog = function({ip,country,city,time,browser,os,isMobile,isDesktop,isBot}) {

};
const LogModel = mongoose.model('Log', Log);

app.use(useragent.express());


app.use(function (req, res, next) {
    if (req.originalUrl === "/service-worker.js" && !req.useragent.isBot) {
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip = ""
        axios.get("http://ip-api.com/json/" + ip)
            .then(response => {
                var now = new Date();
                var isoString = now.toISOString();
                const filter = {
                    ip: ip,
                }
                LogModel.findOne(filter, {}, {}, (err, doc) => {
                    if (doc == null) {
                        LogModel.create(
                            {
                                ip: ip,
                                country: response.data.country,
                                city: response.data.city,
                                updatedAt:isoString,
                                count: 1,
                                details: [{
                                    time: isoString,
                                    browser: req.useragent.browser,
                                    os: req.useragent.os,
                                    isMobile: req.useragent.isMobile,
                                    isDesktop: req.useragent.isDesktop,
                                    isBot: req.useragent.isBot
                                }]
                            });
                    } else {
                        doc.count = doc.count+1;
                        doc.updatedAt = isoString,
                            doc.details.push({
                                time: isoString,
                                browser: req.useragent.browser,
                                os: req.useragent.os,
                                isMobile: req.useragent.isMobile,
                                isDesktop: req.useragent.isDesktop,
                                isBot: req.useragent.isBot
                            })
                        doc.save()
                    }
                })
            })
    }
    next();
});



app.use(express.static(path.join(__dirname, 'build')));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.listen(8000);
