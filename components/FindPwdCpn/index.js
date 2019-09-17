import React, {Fragment, Component} from 'react';
import {Button, Col, Form, Input, Modal, Row, message} from "antd";
import {axiosHttp} from "../../utils/ajax";
import Utils from "../../utils/utils";
import {setAccountInfoAction} from "../../actions";
import {connect} from "react-redux";
import commonFun from "../../utils/commonFun";
import VerificationCodeCpn from '../../components/VerificationCodeCpn'
import "./index.less"

const FormItem = Form.Item;

class ForgetPassword extends Component {
    state = {
        timer: 60,
        forgetPWdFlag: true, //true
        resetSuccessFlag: false, //false
        isSendCodeFlag: false,
        phoneCheckOut: false,
        confirmDirty: false,
        errorInfo: '',
        loginInfo: {},
        phone: ''
    };
    isExistFlag = false;
    pageInfo = {
        myPhone: '',
        mb_verify_code: ''
    };

    checkoutPhoneBlur = (rule, value, callback) => {
        this.pageInfo.myPhone = value;
        if (!value) {
            callback('手机号不能为空！');
        } else if (!/^1[0-9]{10}$/.test(value)) {
            callback('请输入正确的手机号码');
        } else if (/^1[0-9]{10}$/.test(value)) {
            if (this.state.timer !== 60) {
                return
            }
            this.setState({
                isSendCodeFlag: false
            });
            this.checkExistHttp(value).then(res => {
                if (res.code === 200) {
                    this.isExistFlag = false;
                    callback();
                } else {
                    this.isExistFlag = true;
                    callback('手机账号不存在,请注册');
                }
                this.setState({
                    phoneCheckOut: true
                });
            }).catch(e => {

            });

        } else {
            callback();
        }

    };
    checkoutCodeBlur = (rule, value, callback) => {
        if (!value) {
            callback('验证码不能为空');
        } else if (!/^[0-9]{6}$/.test(value)) {
            callback('6位数数字');
        }
        callback();
    };
    checkExistHttp = (phone) => {  // 检查手机号码是否存在
        return new Promise((resolve, reject) => {
            axiosHttp('api/WebSite/Login/CheckExist?phone=' + phone, '', 'GET').then((res) => {
                resolve(res)
            }).catch(e => {
                reject(e)
            });
        })

    };

    verifyCodeHttp = (code) => {  // 忘记密码下一步
        axiosHttp(`api/WebSite/Login/VerifyCode?mb_verify_code=${code}&mobile_phone=${this.pageInfo.myPhone}`, '', 'GET').then((res) => {
            if (res.code === 200) {
                this.setState({
                    forgetPWdFlag: false,
                    errorInfo: ''
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
    forgotPwdHttp = (value) => {  // 重置密码
        const {password} = value;
        const {myPhone, mb_verify_code} = this.pageInfo;
        let params = {
            "mobile_phone": myPhone,
            "mb_verify_code": mb_verify_code,
            "new_password": password,
            "visitor_state": 'web'
        };
        axiosHttp('api/WebSite/Login/ForgotPwd', params).then((res) => {
            if (res.code === 200) {
                message.success('已重置密码，并成功登陆');
                //state 登录成功：1，登录失败：0
                commonFun.storageLoginInfoFun(res.data);
                //type  标识修改事件类型：1、忘记密码 2、账号管理修改密码
                Utils.InsertUpdatePwdRecordHttp(res.data.userId, 1, 1);
                this.props.onCancelPopup();
                this.props.dispatch(setAccountInfoAction(res.data));
            } else {
                let userId = window.sessionStorage.getItem('userId');
                Utils.InsertUpdatePwdRecordHttp(userId, 1, 0, res.msg);
                this.setState({
                    errorInfo: res.msg
                });
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    getMphoneVerifyCodeHttp = () => {  //获取手机验证码--未登录
        axiosHttp(`api/WebSite/GetPhoneVerifyCode/GetMphoneVerifyCode?mPhone=${this.pageInfo.myPhone}&messageType=找回密码`, '', 'GET').then((res) => {
            let userId = window.sessionStorage.getItem('userId');
            if (res.code === 200) {
                Utils.InsertVerifycodeRecordHttp(userId, 2, 1);
                // this.timer = setInterval(() => {
                //     const {timer} = this.state;
                //     if (timer < 1) {
                this.setState({
                    //             isSendCodeFlag: false,
                    timer: 60
                });
                //         clearInterval(this.timer);
                //         return;
                //     }
                //     this.setState({
                //         timer: this.state.timer - 1
                //     })
                // }, 1000);
            } else {
                Utils.InsertVerifycodeRecordHttp(userId, 2, 0, res.msg);
                this.setState({
                    errorInfo: res.msg
                });
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    _handleSendCode = () => { //点击发送手机验证码
        this.setState({
            phone: ''
        });
        if (this.isExistFlag) {
            return;
        }
        if (!/^1[0-9]{10}$/.test(this.pageInfo.myPhone) || this.state.timer !== 60) {
            return
        }
        const {isSendCodeFlag} = this.state;
        if (isSendCodeFlag === true) {
            return
        }
        this.setState({
            isSendCodeFlag: !isSendCodeFlag
        });
        this.getMphoneVerifyCodeHttp();
    };
    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (values.phone) {
                    this.pageInfo.myPhone = values.phone;
                    this.pageInfo.mb_verify_code = values.code;
                    this.verifyCodeHttp(values.code);
                } else {
                    this.forgotPwdHttp(values);
                }

            }
        });
    };
    // _handleSubmitConfirmReset = (e) => {
    //     e.preventDefault();
    //     this.props.form.validateFields((err, values) => {
    //         if (!err) {
    //             this.forgotPwdHttp(values);
    //         }
    //     });
    // };

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (!value) {
            callback('密码不能为空');
        } else if (value && value !== form.getFieldValue('password')) {
            callback('密码输入不一致');
        } else {
            callback();
        }
    };
    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (!value) {
            callback('密码不能为空！');
        } else if (!/^[0-9A-Za-z\S]{8,20}$/.test(value)) {
            callback('密码输入格式有误');
        } else if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], {force: true});
        }
        callback();
    };
    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({confirmDirty: this.state.confirmDirty || !!value});
    };
    _handleNowLogin = () => {
        const {loginInfo} = this.state;
        commonFun.storageLoginInfoFun(loginInfo);
        this.props.onCancelPopup();
        this.props.dispatch(setAccountInfoAction(loginInfo));
    };

    onPhoneChange = (e) => {
        let value = e.target.value;
        this.setState({
            phone: value
        });
    };
    _handleShowLogin = () => {
        this.props.onCancelPopup();
        this.props.onShowLogin();
    };

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    render() {
        const {getFieldDecorator, getFieldError, getFieldsError, getFieldsValue} = this.props.form;
        let disabled = Utils.hasValues(getFieldsValue()) === true || Utils.hasErrors(getFieldsError()) === true;
        const label = function (label, type, hint = '') {
            return (<div className="formLabel">
                <span className="text">{label}</span>
                <em className="placeholder">{hint}</em>
                <i className="error">{(getFieldError(type) || []).join(', ')}</i>
            </div>)
        };
        const style = {
            modal: {
                top: 0, margin: 0,
                padding: '76px 60px 60px'
            }
        };
        const {forgetPWdFlag, resetSuccessFlag, isSendCodeFlag, phoneCheckOut, timer, errorInfo, phone} = this.state;

        const {flag} = this.props;
        return (
            <Modal visible={flag} centered footer={null} width={660} bodyStyle={style.modal} maskClosable={false}
                   iconType='error' onCancel={this.props.onCancelPopup}>
                <div className="form-wrap" id="loginModal">
                    {
                        resetSuccessFlag ?
                            <div className="reset-pwd-success">
                                <i className="icon"/>
                                <p>您已成功重置密码</p>
                                <Button onClick={this._handleNowLogin} className="btn" size="large"
                                        type="primary">马上登录</Button>
                            </div> :
                            <Fragment>
                                <h4 className="title">{forgetPWdFlag ? "找回密码" : "重置密码"}</h4>
                                <Form className="login-form" layout="vertical" onSubmit={this._handleSubmit}>
                                    {
                                        forgetPWdFlag ?
                                            <Fragment>
                                                {/*hasFeedback*/}
                                                <FormItem label={label('输入注册号码', 'phone')}>
                                                    <Row gutter={8}>
                                                        <Col span={18}>
                                                            {getFieldDecorator('phone', {
                                                                initialValue: '',
                                                                rules: [{
                                                                    validator: this.checkoutPhoneBlur
                                                                }],
                                                                validateTrigger: 'onBlur'
                                                            })(
                                                                <Input type="text" onChange={this.onPhoneChange}/>
                                                            )}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Button onClick={this._handleSendCode}
                                                                    className={`sendCode ${phone || (phoneCheckOut && !isSendCodeFlag) ? "active" : ''}`}>{isSendCodeFlag ?
                                                                <VerificationCodeCpn time={timer}/> : "发送验证码"}</Button>
                                                        </Col>
                                                    </Row>
                                                </FormItem>
                                                < FormItem hasFeedback label={label('验证码', 'code')}>
                                                    {getFieldDecorator('code', {
                                                        rules: [
                                                            {
                                                                validator: this.checkoutCodeBlur
                                                            }
                                                        ],
                                                        validateTrigger: 'onBlur'
                                                    })(
                                                        <Input type="text" maxLength={6}/>
                                                    )}

                                                </FormItem>
                                                <FormItem>
                                                    <Button size="large" type="primary"
                                                            htmlType="submit"
                                                            className="login-form-button"
                                                            disabled={disabled}
                                                        // onClick={this._handleSubmitNextStep}
                                                    >下一步</Button>
                                                    {
                                                        errorInfo && <div className="errorInfo">{errorInfo}</div>
                                                    }
                                                    <div className="register">返回到&nbsp;<span
                                                        onClick={this._handleShowLogin}
                                                        className="pointer">登录</span></div>
                                                </FormItem>
                                            </Fragment> :
                                            // 重重密码
                                            <Fragment>
                                                {/*<FormItem>*/}
                                                {/*{getFieldDecorator('phone', {*/}
                                                {/*initialValue: '15811837744'*/}
                                                {/*})(*/}
                                                {/*<Input disabled prefix={<i className="iconfont iconshouji iconPhone"/>}*/}
                                                {/*placeholder="账号(邮箱/手机号)"/>*/}
                                                {/*)}*/}
                                                {/*</FormItem>*/}
                                                <div
                                                    className="cannotEdit">手机号：<span>{this.pageInfo.myPhone}</span>
                                                </div>
                                                <FormItem hasFeedback
                                                          label={label('密码', 'password', '8位以上，数字/英文/符号组合')}>
                                                    {getFieldDecorator('password', {
                                                        initialValue: '',
                                                        rules: [
                                                            {validator: this.validateToNextPassword},
                                                        ],
                                                        validateTrigger: 'onBlur'
                                                    })(
                                                        <Input type="password"/>
                                                    )}
                                                </FormItem>
                                                <FormItem hasFeedback label={label('确认密码', 'confirm')}>
                                                    {getFieldDecorator('confirm', {
                                                        initialValue: '',
                                                        rules: [
                                                            {validator: this.compareToFirstPassword}
                                                        ],
                                                        validateTrigger: 'onBlur'
                                                    })(
                                                        <Input onBlur={this.handleConfirmBlur} type="password"/>
                                                    )}
                                                </FormItem>
                                                <FormItem>
                                                    <Button size="large" type="primary"
                                                            htmlType="submit"
                                                            className="login-form-button"
                                                        // onClick={this._handleSubmitConfirmReset}
                                                            disabled={disabled}>确认重置</Button>
                                                    {
                                                        errorInfo && <div className="errorInfo">{errorInfo}</div>
                                                    }
                                                    <div className="register">返回到&nbsp; <span
                                                        onClick={this._handleShowLogin}
                                                        className="pointer">登录</span>
                                                    </div>
                                                </FormItem>
                                            </Fragment>
                                    }
                                </Form>

                            </Fragment>
                    }
                </div>
            </Modal>
        );
    }
}

const getUserInfo = ({account}) => {
    return {
        userInfo: account.userInfo,
    }
};
export default connect(getUserInfo)(Form.create({})(ForgetPassword));