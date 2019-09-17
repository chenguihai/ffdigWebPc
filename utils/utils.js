import React from 'react';
import {Select} from 'antd'
import moment from 'moment'
import {axiosHttp} from "./ajax";

const Option = Select.Option;
export default {
    hasErrors(fieldsError) {
        // console.log(fieldsError);
        return Object.keys(fieldsError).some(field => fieldsError[field]);
    },
    hasValues(value) {
        // console.log(value);
        if (JSON.stringify(value) === "{}") {
            return true
        }
        let item = null;
        return Object.keys(value).some(field => {
            if (value[field] === true) {
                return false
            }
            item = value[field] && value[field].trim(); //undefined ,'  '
            return item === '' || item === undefined; //true
        });
    },
    momentFormat(time, format = 'YYYY-MM-DD HH:mm:ss') {
        return moment(time).format(format);
    },
    obj2FormData(param) {
        const formData = new FormData();
        Object.keys(param).forEach((key) => {
            formData.append(key, param[key]);
        });
        return formData;
    },
    insertLoginRecordHttp(state, userId = '', msg = '') {  //插入登录记录信息
        //state 登录成功：1，登录失败：0
        // type: //平台（M:手机、PC：电脑端、App：App端）
        axiosHttp(`api/Record/UserRecord/InsertLoginRecord?userId=${userId}&state=${state}&type=PC&errorMsg=${msg}`, '', 'get').then((res) => {
        });
    },


    InsertVerifycodeRecordHttp(userId = '', type = 1, state = 0, msg = '') {  //插入发送验证码记录信息
        //state 登录成功：1，登录失败：0
        //type 标识事件：1、注册 2、忘记密码 3、修改手机号
        let param = {
            "userid": userId,
            "vid": window.localStorage.getItem('visitId'),
            "state": state,
            "type": type,
            "errorMsg": msg
        };
        axiosHttp('api/Record/UserRecord/InsertVerifycodeRecord', param).then((res) => {
        });
    },
    InsertUpdatePwdRecordHttp(userId = '', type = 1, state = 0, msg = '') {  //插入修改密码记录信息
        //state 登录成功：1，登录失败：0
        // 标识修改事件类型：1、忘记密码 2、账号管理修改密码
        let param = {
            "userid": userId,
            "vid": window.localStorage.getItem('visitId'),
            "state": state,
            "type": type,
            "errorMsg": msg
        };
        axiosHttp('api/Record/UserRecord/InsertUpdatePwdRecord', param).then((res) => {
        });
    },
    // 注册成功：1，注册失败：0
    insertRegisterRecordHttp(state = 0, userId = '', msg = '') { // 插入注册记录信息
        let recordParam = {};
        try {
            let recodeParam = window.sessionStorage.getItem('recordParam');
            if (recodeParam) {
                recordParam = JSON.parse(recodeParam);
            }
        } catch (e) {

        } finally {
            const {utm_source = '', utm_medium = '', utm_campaign = '', utm_term = '', utm_content = ''} = recordParam;
            let param = {
                "userid": userId,
                "vid": window.localStorage.getItem('visitId'),
                "state": state,
                "utmSouce": utm_source,
                "utmMedium": utm_medium,
                "utmCampaign": utm_campaign,
                "utmTerm": utm_term,
                "utmContent": utm_content,
                "errorMsg": msg
            };
            axiosHttp('api/Record/UserRecord/InsertRegisterRecord', param).then((res) => {
            })
        }
    },
    bouncer(arr) {
        return arr.filter(function (val) {
            return !(!val || val === "");
        });
    },
    byteLen(str) {
        //正则取到中文的个数，然后len*count+原来的长度。不用replace
        str += '';
        var tmp = str.match(/[^\x00-\xff]/g) || [];
        return str.length + tmp.length;
    },
    getMaxlen(str, maxlen) {
        var sResult = '', L = 0, i = 0, stop = false, sChar;
        if (str.replace(/[^\x00-\xff]/g, 'xxx').length <= maxlen) {
            return str;
        }
        while (!stop) {
            sChar = str.charAt(i);
            L += sChar.match(/[^\x00-\xff]/) ? 2 : 1;
            if (L > maxlen) {
                stop = true;
            } else {
                sResult += sChar;
                i++;
            }
        }
        return sResult;
    },
    compositionInput(id, that) {
        let inputLock = false;
        that.timer = setTimeout(() => {
            let nickNameId = document.getElementById(id);
            if (nickNameId) {
                nickNameId.addEventListener('compositionstart', () => {
                    inputLock = true;
                });
                nickNameId.addEventListener('compositionend', () => {
                    inputLock = false;
                    var value = nickNameId.value,
                        maxlength = nickNameId.getAttribute('maxlength');
                    if (this.byteLen(value) > maxlength) {
                        nickNameId.value = this.getMaxlen(value, maxlength);
                    }
                });
                nickNameId.addEventListener('input', () => {
                    if (!inputLock) {
                        var value = nickNameId.value,
                            maxlength = nickNameId.getAttribute('maxlength');
                        if (this.byteLen(value) > maxlength) {
                            nickNameId.value = this.getMaxlen(value, maxlength);
                        }
                    }
                });
            }
        }, 1000);
    },
    base64Function() {    //3.base64封装的函数
        // private property
        let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // public method for encoding
        this.encode = function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = _utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                    _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
            }
            return output;
        };

        // public method for decoding
        this.decode = function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = _utf8_decode(output);
            return output;
        };

        // private method for UTF-8 encoding
        let _utf8_encode = function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }
            return utftext;
        };

        // private method for UTF-8 decoding
        let _utf8_decode = function (utftext) {
            var string = "";
            var i = 0;
            var c = 0, c1 = 0, c2 = 0, c3 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    }
}

