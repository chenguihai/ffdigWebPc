import {axiosCookieHttp} from "./ajax";
import {getUserMarkLabel} from "../actions/listPageAction";
import {getProductCollectSiteAndCatActive} from "../actions";

export default {
    lazyLoadImgFun() { //懒加载图片
        // console.log('lazyLoadImgFun');
        let detailImage = document.querySelectorAll(".lazyLoad");
        for (let i = 0; i < detailImage.length; i++) {
            if (detailImage[i].getAttribute("data-isLoading") === null) {
                let rect = detailImage[i].getBoundingClientRect();
                if (rect.top <= window.innerHeight) {
                    detailImage[i].setAttribute("src", detailImage[i].getAttribute("data-src"));
                    detailImage[i].setAttribute("data-isLoading", 1);
                }
            }
        }
    },
    lazyLoadBgImgFun() { //懒加载背景图片
        // console.log('lazyLoadBgImgFun');
        let detailImage = document.querySelectorAll(".lazyLoadBg");
        for (let i = 0; i < detailImage.length; i++) {
            if (detailImage[i].getAttribute("data-isLoading") === null) {
                let rect = detailImage[i].getBoundingClientRect();
                if (rect.top <= window.innerHeight) {
                    detailImage[i].style.backgroundImage = `url('${detailImage[i].getAttribute("data-src")}')`;
                    detailImage[i].setAttribute("data-isLoading", 1);
                }
            }
        }
    },
    storageLoginInfoFun(data) {
        const {token, nickName, headImgurl, userId} = data,
            storage = window.sessionStorage;
        storage.setItem('nickName', nickName);
        storage.setItem('authorization', token);
        storage.setItem('headImgUrl', headImgurl || '');
        storage.setItem('userId', userId || '');
    },
    setMetaAboutSeoFun(data) {
        let description = document.querySelector('meta[name="description"]'),
            keywords = document.querySelector('meta[name="keywords"]');
        description["content"] = data.summary;
        keywords["content"] = data.keyword;
        if (data.title) {
            document.title = data.title;
        }
    },
    getMarkLabelHttp(that) { //获取用户打标数据
        axiosCookieHttp('api/WebSite/ProductCollect/GetUserMarkLabel', '', "GET").then((res) => {
            if (res.code === 200) {
                that.props.dispatch(getUserMarkLabel(res.data ? res.data.split(',') : []));
            }
        }).catch((e) => {
            console.log(e);
        })
    },
    getProductCollectSiteAndCatHttp(that) { //获取平台和分类
        axiosCookieHttp("api/WebSite/ProductCollect/GetProductCollectSiteAndCat", '', 'GET').then((res) => {
            let param = {};
            if (res.code === 200) {
                param = res.data;
            } else {
                param = {
                    SiteList: [],
                    CatList: [],
                    TagList: [],
                };
            }
            that.props.dispatch(getProductCollectSiteAndCatActive(param));
        }).catch((e) => {
            console.log(e);
        })
    },
}