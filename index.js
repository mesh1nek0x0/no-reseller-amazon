'use strict';

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

        let status = yield page.open('https://httpbin.org/');
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
        let child = 2;
        const ipLink = yield page.evaluate(function(s) {
            return document.querySelector(s).innerHTML;
        }, `#manpage > div.mp > ul:nth-child(6) > li:nth-child(${child})`);
        console.log(ipLink);


        /*** you can post data with form. ***/
        status = yield page.open('https://httpbin.org/forms/post');
        console.log(status);
        if (status != 'success') {
            throw new Error('page is not opend');
        }
        console.log('input custname "hoge"');
        yield page.evaluate(function() {
            document.forms[0].custname.value = 'hoge';
            document.querySelector('body > form > p:nth-child(8) > button').click();
            // you can also like beloow
            // document.forms[0].submit();
        });
        // wait 2sec
        yield sleep(2000);
        // it can be accessd
        const custname = yield page.evaluate(function () {
            return JSON.parse(document.querySelector('body > pre').innerHTML).form.custname;
        });
        console.log('your custname:', custname);


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
