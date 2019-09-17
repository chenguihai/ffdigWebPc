import React, {Component, Fragment} from 'react'
import {Row, Col, Form, Input, Button} from 'antd';
import {axiosCookieHttp, axiosHttp} from "../../utils/ajax";
import Utils from "../../utils/utils";
import {JWPLayoutSimple} from "../../components";
import {withRouter} from "next/router";
import {setAccountInfoAction} from "../../actions";
import {connect} from 'react-redux'
import {getClassifyMsgHttp} from "../../utils/exportFun";
import {getHomePageData} from "../../actions/listPageAction";


const FormItem = Form.Item;
// 昵称:1,手机:2,邮箱:3
const NICK_NAME = 1, PHONE = 2;

class AccountManage extends Component {
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
    state = {
        timer: 60, //验证码的倒计时
        nick_nameFlag: false,
        emailFlag: false,
        mobile_phoneFlag: false,
        isChangePhoneFlag: false,
        confirmFlag: false,
        isSendCodeFlag: false,
        confirmDirty: false,

        accountData: {},
        errorInfo: '',
    };
    isExistFlag = false;
    pageInfo = {
        mPhone: ""
    };
    timer = null;
    _handleEditInput = (name) => {
        this.cancelPopup();
        this.isExistFlag = false;
        this.setState({
            [`${name}Flag`]: true
        });
        Utils.compositionInput('nick_name', this);
    };
    cancelPopup = () => {
        this.setState({
            nick_nameFlag: false,
            emailFlag: false,
            mobile_phoneFlag: false,
            confirmFlag: false,
            isChangePhoneFlag: false
        });
    };
    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({confirmDirty: this.state.confirmDirty || !!value});
    };

    componentDidMount() {
        this.getAccountHttp();
    }

    updateAccountHttp = (params) => {  //修改信息
        axiosCookieHttp('api/UserSite/AccountManage/UpdateAccount', params).then((res) => {
            let userId = window.sessionStorage.getItem('userId');
            if (res.code === 200) {
                Utils.InsertUpdatePwdRecordHttp(userId, 2, 1);
                this.setState({
                    isSendCodeFlag: false,
                    timer: 60,
                });
                this.cancelPopup();
                this.getAccountHttp();
            } else {
                Utils.InsertUpdatePwdRecordHttp(userId, 2, 0, res.msg);
                this.setState({
                    errorInfo: res.msg
                });
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    getAccountHttp = () => {  //修改信息
        axiosCookieHttp('api/UserSite/AccountManage/GetAccount', "", "GET").then((res) => {
            if (res.code === 200) {
                this.setState({
                    accountData: res.data
                });
            } else {
                this.setState({
                    errorInfo: res.msg
                });
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log(values);
                const {accountData, isChangePhoneFlag} = this.state;
                if (values.mobile_phone === accountData.mPhone) {
                    if (isChangePhoneFlag === false) {
                        this.setState({
                            mobile_phoneFlag: false
                        });
                    }
                    return
                }
                if (this.isExistFlag === true) {
                    return
                }
                if (values.nick_name) {
                    const {userInfo} = this.props;
                    window.sessionStorage.setItem("nickName", values.nick_name);
                    this.props.dispatch(setAccountInfoAction({...userInfo, nickName: values.nick_name}));
                }
                this.updateAccountHttp(values);
            }
        });
    };
    onPhoneChange = (e) => {
        let value = e.target.value;
        this.pageInfo.mPhone = value;
        const {accountData} = this.state;
        this.setState({
            isChangePhoneFlag: !(value === accountData.mPhone)
        });
    };

    getMphoneVerifyCodeHttp = () => {         // 获取手机验证码
        const {mPhone} = this.pageInfo;
        const {accountData} = this.state;
        if ((!mPhone && mPhone !== accountData.mPhone) || this.isExistFlag) {
            return;
        }
        this.setState({
            isSendCodeFlag: true
        });
        window.sessionStorage.setItem('mPhone', mPhone);
        axiosCookieHttp(`api/WebSite/GetPhoneVerifyCode/GetMphoneVerifyCode?mPhone=${mPhone}&messageType=修改密码`, '', 'GET').then((res) => {
            let userId = window.sessionStorage.getItem('userId');
            if (res.code === 200) {
                Utils.InsertVerifycodeRecordHttp(userId, 3, 1);
                this.timer = setInterval(() => {
                    const {timer} = this.state;
                    if (timer < 1) {
                        this.setState({
                            isSendCodeFlag: false
                        });
                        clearInterval(this.timer);
                        return;
                    }
                    this.setState({
                        timer: this.state.timer - 1
                    })
                }, 1000);
            } else {
                Utils.InsertVerifycodeRecordHttp(userId, 3, 0, res.msg);
                this.setState({
                    errorInfo: res.msg
                });
            }
        }).catch((e) => {
            console.log(e);
        });
    };

    checkExistHttp = (key, type) => {  //检查用户昵称、手机、邮箱是否已存在
        return new Promise((resolve, reject) => {
            axiosCookieHttp(`api/UserSite/AccountManage/CheckExist?key=${key}&keyType=${type}`, "", "GET").then((res) => {
                resolve(res);
            }).catch(e => {
                reject(e)
            }).catch((e) => {
                console.log(e);
            });
        });
    };
    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (!value) {
            callback('确认密码不能为空');
        } else if (value && value !== form.getFieldValue('new_password')) {
            callback('新密码和确认密码不一样!');
        } else {
            callback();
        }
    };
    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (!value) {
            callback('密码不能为空');
        } else if (!/^[0-9A-Za-z\S]{8,20}$/.test(value)) {
            callback('密码格式不对');
        } else if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], {force: true});
        }
        callback();
    };
    checkoutNicknameChange = (rule, value, callback) => {
        value = value.trim();
        if (this.state.errorInfo) {
            this.setState({
                errorInfo: ''
            });
        }
        if (!value) {
            callback('昵称不能为空');
        } else {
            callback();
        }
    };
    checkoutNicknameBlur = (e) => { //验证昵称
        let value = e.target.value.trim();
        this.checkExistHttp(value, NICK_NAME).then(res => {
            if (res.code === 200) {
                this.isExistFlag = false;
            } else {
                this.isExistFlag = true;
                this.setState({
                    errorInfo: res.msg
                });
            }
        }).catch(e => {

        });
    };
    checkoutPhoneBlur = (rule, value, callback) => { //验证手机号码是否存在
        this.setState({
            errorInfo: ''
        });
        let flag = /^1[0-9]{10}$/.test(value);
        if (!value) {
            callback('手机号码不能为空');
        } else if (!flag) {
            callback('11位数字');
        } else if (flag) {
            this.checkExistHttp(value, PHONE).then(res => {
                if (res.code === 200) {
                    this.isExistFlag = false;
                    if (this.state.isSendCodeFlag) {
                        let mPhone = window.sessionStorage.getItem('mPhone');
                        if (value !== mPhone) {
                            callback("收到验证码的号码和输入的号码不一致");
                        } else {
                            callback();
                        }
                    } else {
                        callback();
                    }
                } else {
                    this.isExistFlag = true;
                    callback('手机号码已存在');
                }
            }).catch(e => {

            });
        }
    };

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {router} = this.props;
        const {nick_nameFlag, confirmFlag, emailFlag, mobile_phoneFlag, isSendCodeFlag, timer, accountData, isChangePhoneFlag, errorInfo} = this.state;
        const {nickName = "", email = "", mPhone = ""} = accountData;
        let pathname = router.pathname;
        return (
            <div className='h_percent100'>
                <JWPLayoutSimple {...{pathname, title: '账号管理-火联FFDIG'}}>
                    <div className="accountMngForm">
                        <Form layout="inline" onSubmit={this._handleSubmit}>
                            <Row>
                                {
                                    nick_nameFlag ?
                                        <Col sm={24} className="accountManage">
                                            <div className="accountBox pr">
                                                <span className='errorInfo'>{errorInfo}</span>
                                                <span className="label">昵称</span>
                                                <div>
                                                    <FormItem>
                                                        {getFieldDecorator("nick_name", {
                                                            initialValue: nickName,
                                                            rules: [
                                                                {
                                                                    validator: this.checkoutNicknameChange
                                                                }
                                                            ],
                                                            // validateTrigger: 'onBlur'
                                                        })(
                                                            <Input maxLength={30} className="inputCpn"
                                                                   type="text"
                                                                   onBlur={this.checkoutNicknameBlur}
                                                                   placeholder="15个字以内，中文/英文/数字组合"/>
                                                        )}
                                                    </FormItem>
                                                </div>
                                                <i className="iconfont iconht-gou iconRight pointer"
                                                   onClick={this._handleSubmit}/>
                                                <em className="iconfont iconht-cha iconDelete pointer"
                                                    onClick={this.cancelPopup}/>
                                            </div>

                                        </Col> :
                                        <Col sm={24} className="accountManage">
                                            <div className="accountBox">
                                                <span className="label">昵称</span>
                                                <span className="text">{nickName}</span>
                                                <em className="iconfont icon-edit iconEdit pointer"
                                                    onClick={this._handleEditInput.bind(this, "nick_name")}/>
                                            </div>
                                        </Col>
                                }
                            </Row>
                            <Row>
                                {
                                    emailFlag ? <Col sm={24} className="accountManage">
                                        <div className="accountBox">
                                            <span className="label">邮箱</span>
                                            <FormItem>
                                                {getFieldDecorator("email", {
                                                    initialValue: `${email}`,
                                                    rules: [
                                                        {required: true, message: "邮箱不能为空"},
                                                        {
                                                            pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                                                            message: "邮箱格式输入有误"
                                                        }
                                                    ]
                                                })(
                                                    <Input className="inputCpn" type="text" placeholder="邮箱不能为空"/>
                                                )}
                                            </FormItem>
                                            <i className="iconfont iconht-gou iconRight pointer"
                                               onClick={this._handleSubmit}/>
                                            <em className="iconfont iconht-cha iconDelete pointer"
                                                onClick={this.cancelPopup}/>
                                        </div>
                                    </Col> : <Col sm={24} className="accountManage">
                                        <div className="accountBox">
                                            <span className="label">邮箱</span>
                                            <span className="text">{email}</span>
                                            {/*<em className="iconfont icon-edit iconEdit pointer"*/}
                                            {/*onClick={this._handleEditInput.bind(this, "email")}/>*/}
                                        </div>
                                    </Col>
                                }
                            </Row>
                            <Row>
                                {
                                    mobile_phoneFlag ? <Fragment>
                                            <Col xxl={7} xl={10} lg={24} className="accountManage">
                                                <div className="accountBox pr">
                                                    <span className='errorInfo'>{errorInfo}</span>
                                                    <span className="label">手机号</span>
                                                    <FormItem>
                                                        {getFieldDecorator("mobile_phone", {
                                                            initialValue: `${mPhone}`,
                                                            rules: [
                                                                {
                                                                    validator: this.checkoutPhoneBlur
                                                                }
                                                            ],
                                                            validateTrigger: 'onBlur'
                                                        })(
                                                            <Input className="inputCpn" type="text" placeholder="11位数字"
                                                                   onChange={this.onPhoneChange}/>
                                                        )}
                                                    </FormItem>
                                                    {
                                                        !isChangePhoneFlag && <Fragment>
                                                            <i className="iconfont iconht-gou iconRight pointer"
                                                               onClick={this._handleSubmit}/>
                                                            <em className="iconfont iconht-cha iconDelete pointer"
                                                                onClick={this.cancelPopup}/>
                                                        </Fragment>
                                                    }
                                                </div>
                                            </Col>
                                            {
                                                isChangePhoneFlag &&
                                                <Col xxl={17} xl={14} lg={24} className="accountManage">
                                                    <div className="accountBox">
                                                        <span className="label">验证码</span>
                                                        <FormItem>
                                                            {getFieldDecorator('mb_verify_code', {
                                                                initialValue: '',
                                                                rules: [
                                                                    {required: true, message: '验证码不能为空'},
                                                                    {pattern: /^[0-9]{6}$/, message: "6位数数字"}
                                                                ],
                                                                validateTrigger: 'onBlur'
                                                            })(
                                                                <Input className="inputCpn" type="text" maxLength={6}
                                                                       placeholder="6位数字"/>
                                                            )}
                                                            <Button onClick={this.getMphoneVerifyCodeHttp}
                                                                    disabled={isSendCodeFlag}
                                                                    className={`sendCode ${isSendCodeFlag ? "" : "active"}`}>{isSendCodeFlag ? `剩余 ${timer}(s)` : "发送验证码"}</Button>
                                                        </FormItem>

                                                        <i className="iconfont iconht-gou iconRight pointer"
                                                           onClick={this._handleSubmit}/>
                                                        <em className="iconfont iconht-cha iconDelete pointer"
                                                            onClick={this.cancelPopup}/>
                                                    </div>
                                                </Col>
                                            }
                                        </Fragment>
                                        :
                                        <Col sm={24} className="accountManage">
                                            <div className="accountBox">
                                                <span className="label">手机号</span>
                                                <span className="text">{mPhone}</span><em
                                                className="iconfont icon-edit iconEdit pointer"
                                                onClick={this._handleEditInput.bind(this, "mobile_phone")}/>
                                            </div>
                                        </Col>
                                }
                            </Row>
                            <Row>
                                {
                                    confirmFlag ? <Fragment>
                                            {/*xxl={5} xl={7} lg={12} md={12} sm={24}*/}
                                            <Col sm={24} className="accountManage">
                                                <div className="accountBox pr">
                                                    <span className='errorInfo'>{errorInfo}</span>
                                                    <span className="label">旧密码</span>
                                                    <FormItem>
                                                        {getFieldDecorator('old_password', {
                                                            initialValue: ''
                                                        })(
                                                            <Input className="inputCpn" type="password"
                                                                   placeholder="8位以上，数字/英文/符号组合"/>
                                                        )}
                                                    </FormItem>
                                                </div>
                                            </Col>
                                            {/*xxl={5} xl={7} lg={12} md={12} sm={24}*/}
                                            <Col sm={24} className="accountManage">
                                                <div className="accountBox">
                                                    <span className="label">新密码</span>
                                                    <FormItem>
                                                        {getFieldDecorator('new_password', {
                                                            initialValue: '',
                                                            rules: [
                                                                {validator: this.validateToNextPassword}
                                                            ],
                                                            validateTrigger: 'onBlur'
                                                        })(
                                                            <Input className="inputCpn" type="password"
                                                                   placeholder="8位以上，数字/英文/符号组合"/>
                                                        )}
                                                    </FormItem>
                                                </div>
                                            </Col>
                                            {/*xxl={14} xl={10} lg={24} md={24} sm={24}*/}
                                            <Col sm={24} className="accountManage">
                                                <div className="accountBox">
                                                    <span className="label">确认密码</span>
                                                    <FormItem>
                                                        {getFieldDecorator("confirm", {
                                                            initialValue: "",
                                                            rules: [{validator: this.compareToFirstPassword}],
                                                            validateTrigger: 'onBlur'
                                                        })(
                                                            <Input className="inputCpn" type="password"
                                                                   onBlur={this.handleConfirmBlur}
                                                                   placeholder="8位以上，数字/英文/符号组合"/>
                                                        )}
                                                    </FormItem>
                                                    <i className="iconfont iconht-gou iconRight pointer"
                                                       onClick={this._handleSubmit}/>
                                                    <em className="iconfont iconht-cha iconDelete pointer"
                                                        onClick={this.cancelPopup}/>
                                                </div>
                                            </Col>
                                        </Fragment>
                                        :
                                        <Col sm={24} className="accountManage">
                                            <div className="accountBox">
                                                <span className="label">密码</span>
                                                <span className="text">********</span><em
                                                className="iconfont icon-edit iconEdit pointer"
                                                onClick={this._handleEditInput.bind(this, "confirm")}/>
                                            </div>
                                        </Col>
                                }
                            </Row>
                        </Form>
                    </div>
                </JWPLayoutSimple>
            </div>
        );
    }
}

const getUserInfo = ({account}) => {
    return {
        userInfo: account.userInfo,
    }
};
export default connect(getUserInfo)(Form.create()(withRouter(AccountManage)));