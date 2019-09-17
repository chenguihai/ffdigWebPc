import Document, {Head, Main, NextScript} from 'next/document'
import React from "react";

export default class MyDocument extends Document {
    render() {
        return (
            <html>
            <Head>
                <meta charSet="UTF-8"/>
                <meta name="baidu-site-verification" content="69NI24ztpX"/>
                <title>火联-网罗全球优品</title>
                <meta name="description"
                      content="火联ffdig—网罗全球优品，精选热卖产品，供跨境电商产品垂直选品、时尚前沿新品设计提供参考。2700个细分品类，涵括女装、男装、童装、珠宝首饰、包包鞋子、家居生活，云集了海量知名品牌受欢迎的多元素产品，旨在为用户提供优质电商选品服务，挖掘和设计市场最具潜力价值产品。"
                />
                <meta name="keywords" content="火联,ffdig,dig,垂直选品,细分品类,新品设计,选品服务,跨境电商,电商产品"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/static/favicon.ico"/>
                <link rel="stylesheet" href="/static/iconfont/iconfont.css"/>
            </Head>
            <body>
            <Main/>
            <NextScript/>
            <script src="http://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js"/>
            </body>
            </html>
        )
    }
}