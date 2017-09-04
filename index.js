'use strict';

const aws = require('aws-sdk');
const lambda = new aws.Lambda({region: 'us-east-1'});
const Promise = require('bluebird');
const phantom = require('phantom');
const sleep = require('sleep-promise');
const numeral = require('numeral');

module.exports.handler = (event, context, callback) => {
    return Promise.coroutine(processEvent)(event, context, callback);
}

function *processEvent(event, context, callback) {
    console.log('lambda is started');
    // to quit finally
    let instance;

    Promise.coroutine(function* () {
        instance = yield phantom.create();
        const page = yield instance.createPage();
        page.setting(
            'userAgent',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'
        );

        let status = yield page.open(process.env.TARGET_ITEM_LINK);
        console.log(status);
        if (status != 'success') {
            throw new Error('page is not opend');
        }

        /*** page.evaluate return element data to nodejs scope ***/
        const title = yield page.evaluate(function() {
            return document.title;
        });
        console.log(title);

        /*** you can pass node js variable to evaluating by Template Literals.
        (notice) coulud't pass normal variable. ***/
        let element = '#merchant-info > a';
        const seller = yield page.evaluate(function(s) {
            return document.querySelector(s).text;
        }, `${element}`);
        console.log(seller);

        element = '#priceblock_ourprice';
        const price = yield page.evaluate(function(s) {
            return document.querySelector(s).innerHTML;
        }, `${element}`);
        console.log(price.split(' ')[1]);

        if (seller === "Amazon.co.jp" || numeral(price.split(' ')[1]).value() < process.env.TARGET_ITEM_PRICE_MAX) {
            var message = {
                channel: process.env.SLACK_CHANNEL,
                emoji: process.env.SLACK_EMOJI,
                message: `<${process.env.TARGET_ITEM_LINK}|${process.env.NOTIFY_MESSAGE}>`,
                attachments: [{
                    color: 'good',
                    fields: [
                        {'title': 'seller', 'value': seller},
                        {'title': 'price', 'value': price}
                    ]
                }]
            };
            var awParam = {
                FunctionName: "notify-slack",
                InvokeArgs: JSON.stringify(message),
            };
            lambda.invokeAsync(awParam, function(err, data) {
                if(err) {
                    console.log('invoke notify-slack is fail');
                    throw err;
                }
            });
        }


    })().then(() => {
        console.log('lambda will ended with success');
        callback(null, 'done success');
    }).catch((err) => {
        console.error(err.stack);
        console.log('lambda will ended with failure');
        callback('done failure');
    }).finally(() => {
        console.log('finally is started');
        Promise.coroutine(function *() {
            yield instance.exit();
        })().then(() => {
            console.log('lambda is closed');
        });
    });
};
