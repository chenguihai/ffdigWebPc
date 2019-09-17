import React, {Component, Fragment} from 'react';
import Header from "../../components/Header";
import JWPFooter from "../../components/Footer";
import Head from '../../components/head'
import commonFun from "../../utils/commonFun";
import {axiosHttp} from "../../utils/ajax";
import {getHomePageData} from "../../actions/listPageAction";
import {getClassifyMsgHttp} from "../../utils/exportFun";
import './index.less'

let defaultImg = '../../static/loading.gif';
const metaSeoData = [{
    summary: '火联ffdig—网罗全球优品，云集了海量的时尚品类、知名品牌商如Boden、ZALORA、LOFT、Zappos，NET-A-PORTER等、设计师产品等，产品元素多元化，致力于服务电商产品开发者或设计师，电商运营者，时尚产品爱好者。2700个细分品类，涵括女装、男装、童装、珠宝首饰、包包鞋子、家居生活多个领域，供跨境电商产品垂直选品、时尚前沿新品设计提供选品或设计灵感。',
    keyword: '火联,ffdig,dig,Boden,ZALORA,LOFT,NET-A-PORTER,设计师产品,产品开发,细分品类,垂直选品,跨境电商'
}, {
    summary: '火联ffdig—网罗全球优品，精选热卖产品，供跨境电商产品垂直选品、时尚前沿新品设计提供参考。2700个细分品类，涵括女装、男装、童装、珠宝首饰、包包鞋子、家居生活，云集了海量知名品牌受欢迎的多元素产品，旨在为用户提供优质电商选品服务，挖掘和设计市场最具潜力价值产品。',
    keyword: '火联,ffdig,dig,垂直选品,细分品类,新品设计,选品服务,跨境电商,电商产品'
}];

class AboutMe extends Component {
    static async getInitialProps({reduxStore}) {
        let cmi_cat = [];
        try {
            const resp = await axiosHttp("api/WebSite/Classify/GetClassifyMsg", '', "GET");
            cmi_cat = resp.data
        } catch (e) {
            console.error(e)
        }
        let cmi_catData = getClassifyMsgHttp(cmi_cat);
        await reduxStore.dispatch(getHomePageData(cmi_catData));
        return {cmi_cat: cmi_catData}
    }

    componentDidMount() {
        commonFun.setMetaAboutSeoFun(metaSeoData[0]);
    }


    componentWillUnmount() {
        commonFun.setMetaAboutSeoFun(metaSeoData[1]);
    }

    render() {
        return (
            <Fragment>
                <Head title="火联-关于我们"/>
                <Header/>
                <section className="aboutMe"
                         style={{backgroundImage: "url('../../static/aboutMe/w-banner.png')"}}>
                    <img className="img" src="../../static/svglogobai.svg" alt="logo图片"/>
                    <h6 className="subTitle">火联ffdig，致力于网罗全球优质、市场前沿产品</h6>
                    <p className="desc">为电商运营或开发人员、产品设计师等用户提供产品精选服务，</p>
                    <p className="desc"> 激发产品设计灵感，帮助用户发掘吻合自己需求或最具市场潜力价值产品。</p>
                </section>
                <section className="elementMe">
                    <h6 className="title">产品元素多元化</h6>
                    <p className="desc">平台云集了海量的时尚品类、知名品牌商、设计师产品等，产品元素多元化。</p>
                    <ul className="itemWrap">
                        <li className="item">
                            <img className="itemImg lazyLoad" data-src="../../static/aboutMe/ssple.png" src={defaultImg}
                                 alt="时尚品类"/>
                            <h6 className="itemDesc">时尚品类</h6>
                        </li>
                        <li className="item">
                            <img className="itemImg lazyLoad" data-src="../../static/aboutMe/zmpp.png" src={defaultImg}
                                 alt="知名品牌商"/>
                            <h6 className="itemDesc">知名品牌商</h6>
                        </li>
                        <li className="item">
                            <img className="itemImg lazyLoad" data-src="../../static/aboutMe/sjs.png" src={defaultImg}
                                 alt="设计师产品"/>
                            <h6 className="itemDesc">设计师产品</h6>
                        </li>
                    </ul>
                </section>
                <div className="objectTitle">服务对象多样化</div>
                <section className="objectMe">
                    <ul className="objectWrap">
                        <li className="objectItem">
                            <img className="objectImg lazyLoad" data-src="../../static/aboutMe/chanpinkaifa.png"
                                 src={defaultImg}
                                 alt="产品开发者或设计师"/>
                            <h6 className="subTitle">产品开发者或设计师</h6>
                            <p className="objectDesc">可以有效帮助您深度挖掘组合产品信息 <br/>
                                从中获取灵感</p>
                        </li>
                        <li className="objectItem">
                            <img className="objectImg lazyLoad" data-src="../../static/aboutMe/diansjangyunying.png"
                                 src={defaultImg}
                                 alt="电商运营者"/>
                            <h6 className="subTitle">电商运营者</h6>
                            <p className="objectDesc">
                                容 “七分选品，三分运营” <br/>
                                选择市场适销、潮流品牌风向标的产品开展 <br/>
                                电商业务，再配套灵活有效的运营策略， <br/>
                                可以助您最大化业务效益
                            </p>
                        </li>
                        <li className="objectItem">
                            <img className="objectImg lazyLoad" data-src="../../static/aboutMe/shishangaihao.png"
                                 src={defaultImg}
                                 alt="时尚产品爱好者"/>
                            <h6 className="subTitle">时尚产品爱好者</h6>
                            <p className="objectDesc">
                                云集诸多知名品牌和潮流前线产品 <br/>
                                可为您构建品质生活，<br/>
                                提供多元丰富的信息服务
                            </p>
                        </li>
                    </ul>
                    <div className="contactUs">
                        <span className="label">联系我们</span>
                        <span className="text">我们的邮箱：serveinfo@ffdig.com</span>
                    </div>
                </section>
                <JWPFooter/>
            </Fragment>
        );
    }
}

export default AboutMe;