import React from 'react'
import App, {Container} from 'next/app'
import {Provider} from 'react-redux'
import withReduxStore from '../lib/with-redux-store'
import NProgress from 'nprogress'
import Router from 'next/router'
import {axiosHttp} from "../utils/ajax";
import '../assets/main.less'
import commonFun from "../utils/commonFun";

var _hmt = _hmt || [];
Router.events.on('routeChangeStart', url => {
    // todo
    // _hmt.push(['_trackPageview', url]);
    NProgress.start()
});
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

class MyApp extends App {
    timer = null;
    scrollTop = 0;

    componentDidMount() {
        if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) { //路径重定向
            window.location.href = "http://m.ffdig.com/";
        }
        let visitId = window.localStorage.getItem('visitId');
        if (!visitId) {
            this.createWebSiteVidHttp(); //获取访客唯一id
        }
        this.getUrlSearchParam();
        // todo
        // var _hmt = _hmt || [];
        // (function () {
        //     var hm = document.createElement("script");
        //     hm.src = "https://hm.baidu.com/hm.js?751cefc3a06217ea0d9a3d992503913e";
        //     var s = document.getElementsByTagName("script")[0];
        //     s.parentNode.insertBefore(hm, s);
        // })();
        commonFun.lazyLoadImgFun();
        commonFun.lazyLoadBgImgFun();
        window.addEventListener('scroll', this.commonHeadScroll)
    }

    commonHeadScroll = () => {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            let {pathname} = this.props.router;
            commonFun.lazyLoadImgFun();
            commonFun.lazyLoadBgImgFun();
            if (pathname === '/' || pathname === '/trendTheme' || pathname === '/articleContent' || pathname === '/dig-products' || pathname === '/searchPage') {
                return;
            }
            let scrollTop = document.body.scrollTop || document.documentElement.scrollTop,
                headBottomId = document.getElementById('headBottomId'),
                dropDownIconId = document.getElementById('dropDownIconId');
            if (scrollTop <= 100) { //到顶部一百的时候不显示
                headBottomId.classList.remove('active');
                dropDownIconId.classList.remove('active');
            } else if (scrollTop + 100 < this.scrollTop) { //向上
                headBottomId.classList.add('active');
                dropDownIconId.classList.add('active');
            } else if (scrollTop + 100 > this.scrollTop) { //向下
                headBottomId.classList.remove('active');
                dropDownIconId.classList.remove('active');
            }
            this.scrollTop = scrollTop;
            clearTimeout(this.timer)
        }, 100);
    };

    createWebSiteVidHttp = () => { // 获取访客唯一id
        axiosHttp('api/Record/UserRecord/CreateWebSiteVid', '', 'get').then((res) => {
            if (res.code === 200) {
                window.localStorage.setItem('visitId', res.data || '');
            }
        })
    };
    getUrlSearchParam = () => {
        let {search} = window.location;
        if (search.indexOf('utm_campaign') < 0) {
            return
        }
        let obj = {}, searchArr = search.substring(1,).split('&');
        for (let i = 0; i < searchArr.length; i++) {
            let [name, value] = searchArr[i].split('=');
            obj[name] = value;
        }
        window.sessionStorage.setItem('recordParam', JSON.stringify(obj));
    };

    componentWillUnmount() {
        clearTimeout(this.timer);
        window.removeEventListener('scroll', this.commonHeadScroll);
    }

    render() {
        const {Component, pageProps, reduxStore} = this.props;
        return (
            <Container>
                <Provider store={reduxStore}>
                    <Component {...pageProps} />
                </Provider>
            </Container>
        )
    }
}

export default withReduxStore(MyApp)
