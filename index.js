'use strict';

const aws = require('aws-sdk');
const lambda = new aws.Lambda({region: 'us-east-1'});
const Promise = require('bluebird');
const phantom = require('phantom');
const sleep = require('sleep-promise');

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

        if (seller === "Amazon.co.jp") {
            var message = {
                channel: process.env.SLACK_CHANNEL,
                message: `<${process.env.TARGET_ITEM_LINK}|Amazonのイカ>が入荷されたよ!!!`
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
