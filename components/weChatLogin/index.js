import React, {Component, Fragment} from 'react';
import {Button, Row, Col, Form, Input, message, Modal} from 'antd';
import {axiosHttp} from "../../utils/ajax";
import Utils from "../../utils/utils";
import {setAccountInfoAction} from "../../actions";
import {connect} from 'react-redux'
import {withRouter} from 'next/router'
import DeleteModal from "../DeleteModal";
import commonFun from "../../utils/commonFun";
import "./index.less"

const FormItem = Form.Item;
// 昵称:1,手机:2,邮箱:3
const NICK_NAME = 1;

class WeChatLogin extends Component {
    state = {
        isSendCodeFlag: false,
        phoneCheckOut: false,
        confirmDirty: false,
        isLoginFlag: true, // true
        timer: 60,
        errorInfo: '',
        weChatData: {},
        visible: false
    };
    pageInfo = {
        mobile_phone: ""
    };
    isExistFlag = false;

    componentDidMount() {
        const {weChatData} = this.props;
        let wcParams = window.sessionStorage.getItem("wcParams");
        if (wcParams) {
            // this.webUserAuthHttp(wcParams);
            this.props.form.setFieldsValue({nickname: weChatData.nickname});
        }
    }

    // webUserAuthHttp = (wcParams) => {  //web微信用户授权
    //     axiosHttp('api/WeiXin/WeixinLogin/WebUserAuth' + wcParams, '', 'GET').then((res) => {
    //         const {pathname} = this.props.router;
    //         if (res.code === 200) {
    //             let data = JSON.parse(res.data);
    //             if (data.errcode === 41001) {
    //                 this.setState({
    //                     retryFlag: true,
    //                 });
    //             } else {
    //                 this.setState({
    //                     weChatData: data,
    //                     weChatSuccessFlag: true
    //                 });
    //                 window.sessionStorage.setItem('weChatData', data);
    //             }
    //         } else if (res.code === 210) {//已授权，直接扫码登录
    //             window.sessionStorage.removeItem("wcParams");
    //             this.loginCommonFun(res.data);
    //         }
    //     }).catch((e) => {
    //         console.log(e);
    //     });
    // };
    onPhoneChange = (e) => {
        let value = e.target.value.trim();
        this.pageInfo.mobile_phone = value;
        let checkOut = /^1[0-9]{10}$/.test(value);
        this.setState({
            phoneCheckOut: checkOut
        })
    };

    _handleNicknameRegisterCheck = (rule, value, callback) => { //验证昵称
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
    checkoutNicknameBlur = (e) => {
        let value = e.target.value.trim();
        this.registerCheckHttp(value, NICK_NAME).then(res => {
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
    validatorMobilePhone = (rule, value, callback) => { //验证手机号码是否存在
        value = value.trim();
        let flag = /^1[0-9]{10}$/.test(value);
        if (!value) {
            callback('手机号码不能为空');
        } else if (!flag) {
            callback('11位数字');
        } else {
            callback();
        }
    };
    _handleCodeRegisterCheck = (rule, value, callback) => { //验证手机号码是否存在
        value = value.trim();
        let flag = /^[0-9]{6}$/.test(value);
        if (!value) {
            callback('验证码不能为空');
        } else if (!flag) {
            callback('6位数字');
        } else {
            callback();
        }
    };

    registerCheckHttp = (key, type) => {  // 检查用户昵称、手机、邮箱是否已存在
        return new Promise((resolve, reject) => {
            axiosHttp(`api/WebSite/Register/Check?key=${key}&keyType=${type}`, '', 'GET').then((res) => {
                resolve(res);
            }).catch(e => {
                reject(e)
            })
        });
    };
    getMphoneVerifyCodeHttp = () => {         // 获取手机验证码
        let mphone = this.props.form.getFieldValue('mphone');
        if (!/^1[0-9]{10}$/.test(mphone)) {
            return;
        } else if (this.isExistFlag) {
            return;
        }
        this.setState({
            isSendCodeFlag: true,
            visible: false
        });
        const {mobile_phone} = this.pageInfo;
        window.sessionStorage.setItem('mPhone', mobile_phone);
        axiosHttp(`api/WebSite/GetPhoneVerifyCode/GetMphoneVerifyCode?mPhone=${mobile_phone}&messageType=注册`, '', 'GET').then((res) => {
            let userId = window.sessionStorage.getItem('userId');
            if (res.code === 200) {
                Utils.InsertVerifycodeRecordHttp(userId, 1, 1);
                this.timer = setInterval(() => {
                    const {timer} = this.state;
                    if (timer < 1) {
                        this.setState({
                            isSendCodeFlag: false,
                            timer: 60
                        });
                        clearInterval(this.timer);
                        return;
                    }
                    this.setState({
                        timer: this.state.timer - 1
                    })
                }, 1000);
            } else {
                Utils.InsertVerifycodeRecordHttp(userId, 1, 0, res.msg);
                message.warning(res.msg);
            }
        }).catch((e) => {
            console.log(e);
        });
    };

    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (this.state.isLoginFlag) {
                    this.wxCtMphoneHttp(values);
                } else {
                    this.webInsertUserHttp(values);
                }
            }
        });
    };
    wxCtMphoneHttp = (params) => {  //微信关联手机流程
        this.setState({loading: true});
        // let weChatData = window.sessionStorage.getItem('weChatData'), param = {};
        // if (weChatData) {
        //     param = JSON.parse(weChatData);
        // }
        const {weChatData} = this.props;

        axiosHttp('api/WeiXin/WeixinLogin/WxCtMphone', {...params, ...weChatData, visitor_state: 'web'}).then((res) => {
            this.setState({loading: false});
            if (res.code === 200) {
                this.setState({
                    isLoginFlag: false,
                    weChatData: res.data
                });
                Utils.compositionInput('nick_name', this);
            } else if (res.code === 210) {
                this.loginCommonFun(res.data);
                Utils.insertLoginRecordHttp(1, res.data.userId);
            } else {
                this.setState({
                    errorInfo: res.msg
                });
                Utils.insertLoginRecordHttp(0, '', res.msg);
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    webInsertUserHttp = (params) => { // 微信关联注册
        this.setState({loading: true});
        axiosHttp('api/WeiXin/WeixinLogin/WxInsertUser', {
            ...params, ...this.state.weChatData, rgSource: 'web',
            rgType: 'wechat'
        }).then((res) => {
            this.setState({loading: false});
            if (res.code === 200) {
                this.loginCommonFun(res.data);
            } else {
                this.setState({
                    data: {}
                });
                Utils.insertRegisterRecordHttp(0, '', res.msg);
            }
        }).catch((e) => {
            console.log(e);
        });
    };
    loginCommonFun = (data) => {
        commonFun.storageLoginInfoFun(data);
        Utils.insertRegisterRecordHttp(1, data.userId);
        this.props.onCancelPopup();
        this.props.dispatch(setAccountInfoAction(data));
    };
    checkExistHttp = () => {  // 检查手机号码是否存在
        axiosHttp(`api/WebSite/Login/CheckExist?phone=${this.pageInfo.mobile_phone}&wx=true`, '', 'GET').then((res) => {
            if (res.code === 6100) {
                this.setState({
                    visible: true
                })
            } else {
                this.getMphoneVerifyCodeHttp();
            }
        })
    };
    jumpLoginCpn = () => {
        this.setState({
            visible: false
        })
    };
    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({confirmDirty: this.state.confirmDirty || !!value});
    };
    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('pass_word')) {
            callback('密码输入不一致');
        } else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (!value) {
            callback('密码不能为空');
        } else if (!/^[0-9A-Za-z\S]{8,20}$/.test(value)) {
            callback('8位以上，数字/英文/符号组合');
        } else if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], {force: true});
        }
        callback();
    };

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const {getFieldDecorator, getFieldError, getFieldsError, getFieldsValue} = this.props.form;
        let disabled = Utils.hasValues(getFieldsValue()) === true || Utils.hasErrors(getFieldsError()) === true;

        const {
            errorInfo, isSendCodeFlag, phoneCheckOut, timer, isLoginFlag, visible, weChatData
        } = this.state;
        const style = {
            modal: {top: 0, paddingBottom: 0, margin: 0},
        };
        const label = function (label, type) {
            return (<div className="formLabel">
                <span className="text">{label}</span>
                <em className="placeholder"/>
                <i className="error">{(getFieldError(type) || []).join(', ')}</i>
            </div>)
        };
        return (
            <div className="form-wrap" id="loginModal">
                <h3 className="title">微信登录ffdig平台</h3>
                < Form className="login-form" layout="vertical" onSubmit={this._handleSubmit}>
                    {
                        isLoginFlag ? <Fragment>
                            <FormItem label={label('手机号', 'mphone')}>
                                <Row gutter={8}>
                                    <Col span={18}>
                                        {getFieldDecorator('mphone', {
                                            // initialValue: '',
                                            rules: [
                                                {validator: this.validatorMobilePhone}
                                            ],
                                            validateTrigger: 'onBlur'
                                        })(
                                            <Input type="text" name="mPhone" onChange={this.onPhoneChange}/>
                                        )}
                                    </Col>
                                    <Col span={6}>
                                        <Button onClick={this.checkExistHttp} disabled={isSendCodeFlag}
                                                className={`sendCode ${phoneCheckOut && !isSendCodeFlag ? "active" : ""}`}>{isSendCodeFlag ? `剩余 ${timer}(s)` : "发送验证码"}</Button>
                                    </Col>
                                </Row>

                            </FormItem>
                            {/*hasFeedback*/}
                            <FormItem label={label('验证码', 'verify_code')}>
                                {getFieldDecorator('verify_code', {
                                    rules: [
                                        {
                                            validator: this._handleCodeRegisterCheck
                                        }
                                    ],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input type="text" maxLength={6}/>
                                )}
                            </FormItem>
                        </Fragment> : <Fragment>
                            <FormItem hasFeedback label={label('昵称', 'nickname', '昵称6个字以内，中文/英文/数字组合')}>
                                {getFieldDecorator('nickname', {
                                    initialValue: (weChatData.nickname || ''),
                                    rules: [
                                        {
                                            validator: this._handleNicknameRegisterCheck
                                        }
                                    ],
                                    // validateTrigger: 'onBlur'
                                })(
                                    <Input maxLength={30} type="text" onBlur={this.checkoutNicknameBlur}/>
                                )}
                            </FormItem>
                            <FormItem hasFeedback label={label('密码', 'pass_word')}>
                                {getFieldDecorator('pass_word', {
                                    rules: [
                                        {validator: this.validateToNextPassword}
                                    ],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input type="password" autoComplete="off"/>
                                )}
                            </FormItem>
                            <FormItem hasFeedback label={label('确认密码', 'confirm')}>
                                {getFieldDecorator('confirm', {
                                    rules: [
                                        {validator: this.compareToFirstPassword}
                                    ],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input type="password" onBlur={this.handleConfirmBlur} autoComplete="off"/>
                                )}
                            </FormItem>
                        </Fragment>
                    }
                    <FormItem>
                        <Button size="large" type="primary" htmlType="submit"
                                className="login-form-button"
                                disabled={disabled}>{isLoginFlag ? '下一步' : '马上登录'}</Button>
                        {
                            errorInfo && <div className="errorInfo">{errorInfo}</div>
                        }
                    </FormItem>
                </Form>
                <div className="wxBtnGroup">
                    <div className="btn" onClick={this.props.onShowLogin}>账号登录</div>
                    <div className="dividingLine"/>
                    <div className="btn" onClick={this.props.onshowRegister}>账号注册</div>
                </div>
                {/*<Modal  wrapClassName="cancelCollect"*/}
                {/*title="提示"  style={style.modal}*/}
                {/*visible={visible}  okText='确定' cancelText='取消'  maskClosable={false}*/}
                {/*onOk={this.getMphoneVerifyCodeHttp}*/}
                {/*onCancel={this.jumpLoginCpn}*/}
                {/*>*/}
                {/*<p>手机号码已注册，并已绑定其他微信，是否更换绑定微信</p>*/}
                {/*</Modal>*/}

                <DeleteModal visible={visible} title="提示" content="手机号码已注册，并已绑定其他微信，是否更换绑定微信"
                             hide={this.jumpLoginCpn}
                             sure={this.getMphoneVerifyCodeHttp}/>
            </div>
        );
    }
}

const getUserInfo = ({account}) => {
    return {
        userInfo: account.userInfo,
    }
};
export default connect(getUserInfo)(Form.create({})(withRouter(WeChatLogin)));