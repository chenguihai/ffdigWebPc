import axios from "axios";
import config from "../config/config";
import Router from "next/router";
// import {connect} from 'react-redux'
import {
    getUserCollectCount,
    setAccountInfoAction
} from '../actions'

// import {message} from "antd";

export function axiosHttp(api, params = null, methods = "POST", url = false) {
    // var token = window.sessionStorage.getItem("vfCode") || "";
    // var authorization = this.props.userInfo.nickName || "";
    // let loading = document.getElementById('ajaxLoading');
    // loading.style.display = 'block';
    // 添加响应拦截器
// 401：缺少Authorization请求头或令牌值为空！
// 403：访问令牌已过期，请重新登录！
// 500: 未知异常
//     axios.interceptors.response.use(function (response) {
//         // console.log("对响应数据做点什么",response);
//         // 对响应数据做点什么
//         return response;
//     }, function (error) {
//         // 对响应错误做点什么
//         console.log("对响应错误做点什么",error);
//         return Promise.reject(error);
//     });
    return new Promise((resolve, reject) => {
        axios({
            method: methods,
            url: config.baseUrl + api,
            data: params,
            timeout: 12 * 1000,
            withCredentials: true,
            headers: {
                // "Authorization": "bearer " + authorization,
                // "Content-Type": 'application/x-www-form-urlencoded'
                "Content-Type": 'application/json'
            }
        }).then(res => {
            // loading.style.display = 'none';
            if (res.data.code === 403 || res.data.code === 401) {
                window.sessionStorage.clear();
                this.props.router.push({
                    pathname: '/',
                });
                this.props.dispatch(setAccountInfoAction(
                    {
                        token: '',
                        nickName: '',
                        headImgurl: ''
                    }));
                this.props.dispatch(getUserCollectCount(0));
            }
            resolve(res.data);
        }).catch(err => {
            // console.log(54, err.msg);
            // loading.style.display = 'none';
            reject(err);
            // message.error(err.msg);
        });
    })
}

export function axiosCookieHttp(api, params = null, methods = "POST", url = false) {
    // var token = window.sessionStorage.getItem("vfCode") || "";
    var authorization = window.sessionStorage.getItem('authorization') || "";
    // let loading = document.getElementById('ajaxLoading');
    // loading.style.display = 'block';
    // 添加响应拦截器
// 401：缺少Authorization请求头或令牌值为空！
// 403：访问令牌已过期，请重新登录！
// 500: 未知异常
//     axios.interceptors.response.use(function (response) {
//         // console.log("对响应数据做点什么",response);
//         // 对响应数据做点什么
//         return response;
//     }, function (error) {
//         // 对响应错误做点什么
//         console.log("对响应错误做点什么",error);
//         return Promise.reject(error);
//     });
    return new Promise((resolve, reject) => {
        axios({
            method: methods,
            url: config.baseUrl + api,
            data: params,
            timeout: 12 * 1000,
            withCredentials: true,
            headers: {
                "Authorization": "bearer " + authorization,
                // "Content-Type": 'application/x-www-form-urlencoded'
                "Content-Type": 'application/json'
            }
        }).then(res => {
            // console.log(50, res);
            // loading.style.display = 'none';
            if (res.data.code === 403 || res.data.code === 401) {
                window.sessionStorage.clear();
                this.props.router.push({
                    pathname: '/',
                });
                // window.localStorage.clear();
                // window.location.href = '/'
                this.props.dispatch(setAccountInfoAction(
                    {
                        token: '',
                        nickName: '',
                        headImgurl: ''
                    }));
                this.props.dispatch(getUserCollectCount(0));
            }
            resolve(res.data);
        }).catch(err => {
            // window.sessionStorage.clear();
            // window.localStorage.clear();
            // Router.replace('/');
            // loading.style.display = 'none';
            reject(err);
            // message.error(err.msg);
        });
    })
}
