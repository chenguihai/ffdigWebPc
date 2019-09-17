import React, {Component, Fragment} from 'react';
import Header from "../../components/Header";
import JWPFooter from "../../components/Footer";
import {axiosHttp} from "../../utils/ajax";
import {getHomePageData} from "../../actions/listPageAction";
import {getClassifyMsgHttp} from "../../utils/exportFun";
import './index.less'

class UserAgreement extends Component {
    static async getInitialProps({query, reduxStore}) {
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

    render() {
        return (
            <Fragment>
                <Header/>
                <div className="userAgreeBg">
                    <section className="userAgree pr">
                        <h2 className="title">火联网用户协议</h2>
                        <p className="content">欢迎您来到火联网</p>
                        <h6 className="subTitle">一、火联网（ffdig.com）使用协议的接受</h6>
                        <p className="content">
                            通过访问或使用本网站，表示您同意接受本协议的所有条件和条款。火联网（ffdig.com）将依据本协议为您提供服务。如果您不愿接受本协议的任何条件和条款，请停止使用火联网所提供的全部服务。
                        </p>
                        <h6 className="subTitle">二、本协议的变更和修改</h6>
                        <p className="content">
                            火联网运营者有权随时对本协议进行修改，并且一旦发生协议条款的变动，本网站将在相关页面上展示修改后的协议版本；用户如果不同意本协议的修改，可以放弃使用或访问本网站或取消已经获得的服务；如果用户选择在本协议变更后继续访问或使用本网站，则视为用户已经接受本协议的修改。
                        </p>
                        <h6 className="subTitle">三、用户行为规则</h6>
                        <p className="content">
                            1、用户注册成功后，火联网将给予每个用户一个用户账号及相应的密码，该用户账号和密码由用户负责保管；用户应当对以其用户账号进行的所有活动和事件负法律责任；由该等活动所导致的任何损失或损害由用户承担，本网站不承担任何责任。 </p>
                        <p className="content">
                            2、用户须对在火联网的注册信息的真实性、合法性、有效性承担全部责任，用户不得冒充他人，不得利用他人的名义发布任何信息；不得恶意使用他人注册账号或手机号在本网执行业务操作；用户的密码和账号遭到未授权的使用或发生其他任何安全问题时，用户应当立即反馈给火联网的运营者；
                            任何机构或个人注册和使用的互联网用户账号名称，不得有下列情形： </p>
                        <p className="content">
                            （一）违反宪法或法律法规规定的；<br/>
                            （二）危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；<br/>
                            （三）损害国家荣誉和利益的，损害公共利益的；<br/>
                            （四）煽动民族仇恨、民族歧视，破坏民族团结的；<br/>
                            （五）破坏国家宗教政策，宣扬邪教和封建迷信的；<br/>
                            （六）散布谣言，扰乱社会秩序，破坏社会稳定的；<br/>
                            （七）散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；<br/>
                            （八）侮辱或者诽谤他人，侵害他人合法权益的；<br/>
                            （九）含有法律、行政法规禁止的其他内容的。
                        </p>
                        <p className="content">3、用户昵称管理</p>
                        <p className="content">
                            请勿以党和国家领导人或其他名人的真实姓名、字、号、艺名、笔名、头衔等注册和使用昵称（如确为本人，需要提交相关证据并通过审核方可允许使用）；<br/>
                            请勿以国家组织机构或其他组织机构的名称等注册和使用昵称（如确为该机构，需要提交相关证据并通过审核方可允许使用）；<br/>
                            请勿注册和使用与其他网友相同、相仿的名字或昵称；<br/>
                            请勿注册和使用不文明、不健康的ID和昵称；<br/>
                            请勿注册和使用易产生歧义、引起他人误解或带有各种奇形怪状符号的ID和昵称。<br/>
                            用户以虚假信息骗取账号名称注册，或账号头像、简介等注册信息存在违法和不良信息的，火联网将暂停或注销。
                        </p>
                        <p className="content">
                            4、火联网是一个提供信息服务和信息分享传播的平台。用户通过火联网发表的信息为公开的信息，其他第三方均可以通过火联网获取用户发表的信息，用户对任何信息的发表即认可该信息为公开的信息，并单独对此行为承担法律责任；任何用户不愿被其他第三人获知的信息都不应该在火联网上进行发表。
                        </p>
                        <p className="content">
                            5、用户承诺不得以任何方式利用火联网直接或间接从事违反任何国家法律、以及社会公德的行为，火联网有权对违反上述承诺的内容予以删除。</p>
                        <p className="content">
                            6、火联网用户不得利用火联网服务制作、上载、复制、发布、传播或者转载如下内容：</p>
                        <p className="content">
                            · 反对宪法所确定的基本原则的；<br/>
                            · 危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；<br/>
                            · 损害国家荣誉和利益的；<br/>
                            · 煽动民族仇恨、民族歧视，破坏民族团结的；<br/>
                            · 破坏国家宗教政策，宣扬邪教和封建迷信的；<br/>
                            · 散布谣言，扰乱社会秩序，破坏社会稳定的；<br/>
                            · 散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；<br/>
                            · 侮辱或者诽谤他人，侵害他人合法权益的；<br/>
                            · 含有法律、行政法规禁止的其他内容的信息。
                        </p>
                        <p className="content">
                            7、火联网有权对用户使用火联网的情况进行审查和监督，如用户在使用火联网时违反任何上述规定，火联网或其授权的人有权要求用户改正或直接采取一切必要的措施（包括但不限于更改或删除用户张贴的内容、暂停或终止用户使用火联网的权利）以减轻用户不当行为造成的影响。
                        </p>
                        <p className="content">
                            8、若任何第三方通知火联网某用户在火联网上上传的信息违反了法律法规或侵犯了他人的权利，火联网有权删掉该用户上传的信息而不承担任何责任。
                        </p>
                        <h6 className="subTitle">四、用户隐私政策</h6>
                        <p className="content">
                            1、火联网收集哪些信息 </p>
                        <p className="content">
                            1)您创建或者提供给我们的信息 <br/>
                            使用火联网的相关服务，您需创建平台账户，提供账号（邮箱或微信）、用户昵称、手机号码、密码。如果您仅需使用浏览、搜索服务，您不需要注册成为我们的会员及提供上述信息。<br/>
                            2)您在使用平台服务过程中的信息<br/>
                            我们会收集关于您使用我们产品或服务以及使用方式的信息，这些信息包括：<br/>
                            服务日志信息：当您使用火联网站或客户端提供的产品或服务时，我们会自动收集您对我们服务的详细使用情况，作为有关网络日志保存。例如搜索查询内容、IP地址、浏览器的类型、电信运营商、使用的语言、访问日期和时间及您访问的网页记录等<br/>
                            其他相关信息：为了帮助您更好地使用我们的产品或服务，我们会收集相关信息，例如用户收藏分享行为信息。<br/>
                            请您理解，单独的设备信息、日志信息等是无法识别特定自然人身份的信息。除非将这类非个人信息与其他信息结合用于识别特定自然人身份，或者将其与个人信息结合使用，那么在结合使用期间，这类非个人信息将被视为个人信息，我们会将该类个人信息做匿名化、去标识化处理（取得您的授权或法律法规另有规定的情况除外）。<br/>
                        </p>
                        <p className="content">
                            2、 火联网如何使用收集的信息</p>
                        <p className="content">
                            1)向您提供产品或服务<br/>
                            2)改善我们的产品或服务<br/>
                            为以便向您提供更符合您个性化需求的信息展示、搜索及推荐服务，火联网会根据您的浏览及搜索记录、收藏分享行为，提取您的浏览及搜索偏好、行为习惯等特征，基于特征标签进行间接人群画像，并展示、推送信息和可能的商业广告。<br/>
                            火联网可能会对收集的信息进行去标识化地研究、统计分析和预测，用于改善火联网的内容和布局，为商业决策提供产品或服务支撑，以及改进我们的产品和服务（例如使用匿名数据进行机器学习或模型算法训练）。
                            如果您不想接收我们给您发送的商业广告或其他服务，您可通过短信提示回复退订或平台提供的其他方式进行退订。<br/>
                            3)改善信息安全<br/>
                            为提高您使用我们提供服务的安全性，确保操作环境安全与识别会员账号异常状态，保护您或其他用户或公众的人身财产安全免遭侵害，更好地预防钓鱼网站、欺诈、网络漏洞、计算机病毒、网络攻击、网络侵入等安全风险，更准确地识别违反法律法规或火联网相关协议规则的情况，火联网可能使用或整合您的账户信息、设备信息、有关网络日志等综合判断您的平台账户及交易风险、进行身份验证、检测及防范安全事件，并依法采取必要的记录、审计、分析、处置措施。<br/>
                            4）
                            如我们停止运营火联网产品或服务，平台将及时停止继续收集您个人信息的活动，将停止运营的通知以逐一送达或公告的形式通知您，并对平台所持有的与已关停业务相关的个人信息进行删除或匿名化处理。<br/>
                            5）若我们将信息用于本政策未载明的其他用途，或者将基于特定目的收集而来的信息用于其他目的时，会事先征求您的同意。
                        </p>
                        <p className="content"> 3、 免责申明</p>
                        <p className="content">
                            火联网将通过技术手段、强化内部管理等办法充分保护用户的个人隐私信息，除法律或有法律赋予权限的政府部门要求或事先得到用户明确授权等原因外，火联网保证不对外公开或向第三方透露用户个人隐私信息，或用户在使用服务时存储的非公开内容。<br/>
                            1)用户在火联网发表的内容仅表明其个人的立场和观点，并不代表火联网的立场或观点。作为内容的发表者，用户需自行对所发表内容负责，因所发表内容引发的一切纠纷，由该内容的发表者承担全部法律及连带责任。火联网不承担任何法律及连带责任。<br/>
                            2)火联网不保证网络服务一定能满足用户的要求，也不保证网络服务不会中断，对网络服务的及时性、安全性、准确性也都不作保证。<br/>
                            3)对于因不可抗力或火联网不能控制的原因造成的网络服务中断或其它缺陷，火联网不承担任何责任，但将尽力减少因此而给用户造成的损失和影响。
                        </p>
                        <p className="content">4、 协议修改</p>
                        <p className="content">
                            根据互联网的发展和有关法律、法规及规范性文件的变化，或者因业务发展需要，火联网有权对本协议的条款作出修改或变更，一旦本协议的内容发生变动，火联网将会直接在火联网站上公布修改之后的协议内容，该公布行为视为火联网已经通知用户修改内容。火联网也可采用电子邮件或私信的传送方式，提示用户协议条款的修改、服务变更、或其它重要事项。<br/>
                            如果不同意火联网对本协议相关条款所做的修改，用户有权并应当停止使用火联网。如果用户继续使用火联网，则视为用户接受火联网对本协议相关条款所做的修改。
                        </p>
                        <p className="content">您的鼓励是我们前进的动力！</p>
                        <i className="iconfont iconht-cha closeIcon" onClick={() => window.history.back()}/>
                    </section>
                </div>
                <JWPFooter/>
            </Fragment>
        );
    }
}

export default UserAgreement;