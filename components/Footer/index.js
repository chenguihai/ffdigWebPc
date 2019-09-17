import React from 'react'
import Link from 'next/link'
import './index.less'

export default function JWPFooter() {
    return (
        <footer className="footer pr">
            <ul className="footerItem">
                <li className="footerLi">
                    <Link prefetch href="/aboutMe">
                        <a>关于我们</a>
                    </Link>
                </li>
                {/*<li className="footerLi">我的账户</li>*/}
                {/*<li className="footerLi">我要反馈</li>*/}
                {/*<li className="footerLi">*/}
                    {/*<Link prefetch href="/userAgreement">*/}
                        {/*<a>用户协议</a>*/}
                    {/*</Link>*/}
                {/*</li>*/}
                {/*<li className="footerLi">隐私政策</li>*/}
            </ul>
            <p className="version"><span>版权所有Copyright © 2019 云查科技</span>
                <em className="line">|</em>
                <span>粤ICP备19046837号-1</span>
                <em className="line">|</em>
                <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44030502004049"
                   className="gonanIcon" style={{backgroundImage: "url('../../../static/dibu-icongonan.png')"}}>粤公网安备
                    44030502004049号</a>
            </p>
            <div className="codeWrap">
                <img className="codeImg"
                     src="../../static/home/index-sq.jpg" alt="微信公众号二维码"/>
                <p className="text">关注微信公众号</p>
            </div>
        </footer>
    )
}
