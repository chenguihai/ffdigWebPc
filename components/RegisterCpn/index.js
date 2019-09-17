import React, {Component, Fragment} from 'react'
import {Button, Form, Input, Modal, Checkbox, Row, Col} from "antd";
import {connect} from "react-redux";
import Link from "next/link";
import {axiosHttp} from "../../utils/ajax";
import Utils from "../../utils/utils";
import {getUserCollectCountAction, setAccountInfoAction} from "../../actions";
import commonFun from "../../utils/commonFun";
import "./index.less"

const FormItem = Form.Item;

// 昵称:1,手机:2,邮箱:3
const NICK_NAME = 1, PHONE = 2, EMAIL = 3;

class RegisterCpn extends Component {
    state = {
        isSendCodeFlag: false,
        phoneCheckOut: false,
        timer: 60,
        confirmDirty: false,
        errorInfo: '',
        rememberPwd: false,//用户协议
        loading: false, //一次只能提交一次
    };
    pageInfo = {
        mobile_phone: ""
    };
    isExistFlag = false;
    componentDidMount() {
        Utils.compositionInput('nick_name', this);
    }

    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {confirm, ...props} = values;
                if (this.isExistFlag === false) {
                    this.createUserHttp(props);
                }
            }
        });
    };

    handleShowLogin = () => {
        this.props.onCancelPopup();
        this.props.onShowLogin();
    };
    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({confirmDirty: this.state.confirmDirty || !!value});
    };
// {required: true, message: '确认密码不能为空'},
    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
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
    onPhoneChange = (e) => {
        let value = e.target.value;
        this.pageInfo.mobile_phone = value;
        let checkOut = /^1[0-9]{10}$/.test(value);
        this.setState({
            phoneCheckOut: checkOut
        })
    };
    createUserHttp = (params) => {  //注册
        this.setState({
            loading: true
        });
        axiosHttp('api/WebSite/Register/CreateUser', {...params, rgSource: 'web', rgType: 'account'}).then((res) => {
            if (res.code === 200) {
                this.setState({
                    loading: false
                });
                commonFun.storageLoginInfoFun(res.data);
                this.props.onCancelPopup();
                this.props.dispatch(setAccountInfoAction(res.data));
                this.props.dispatch(getUserCollectCountAction());
                Utils.insertRegisterRecordHttp(1, res.data.userId);
            } else {
                this.setState({
                    errorInfo: res.msg,
                    loading: false
                });
                Utils.insertRegisterRecordHttp(0, '', res.msg);
            }

        }).catch((e) => {
            console.log(e);
        })
    };

    getMphoneVerifyCodeHttp = () => {         // 获取手机验证码
        let mobilePhone = this.props.form.getFieldValue('mobile_phone');
        if (!/^1[0-9]{10}$/.test(mobilePhone) || this.isExistFlag) {
            return
        }
        this.setState({
            isSendCodeFlag: true
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
                this.setState({
                    errorInfo: res.msg
                })
            }
        }).catch((e) => {
            console.log(e);
        });
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
    checkoutNicknameBlur = (e) => { //验证昵称
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
    _handleEmailRegisterCheck = (rule, value, callback) => { //验证邮箱
        let flag = /^[A-Z_a-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value);
        if (!value) {
            callback('邮箱不能为空');
        } else if (!flag) {
            callback('邮箱格式输入有误');
        } else if (flag) {
            this.registerCheckHttp(value, EMAIL).then(res => {
                if (res.code === 200) {
                    this.isExistFlag = false;
                    callback();
                } else {
                    this.isExistFlag = true;
                    callback('邮箱已存在');
                }
            }).catch(e => {

            });
        }
    };
    validatorMobilePhone = (rule, value, callback) => { //验证手机号码是否存在
        let flag = /^1[0-9]{10}$/.test(value);
        if (!value) {
            callback('手机号码不能为空');
        } else if (!flag) {
            callback('11位数字');
        } else if (flag) {
            this.registerCheckHttp(value, PHONE).then(res => {
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
    _handleCodeRegisterCheck = (rule, value, callback) => { //验证手机号码是否存在
        let flag = /^[0-9]{6}$/.test(value);
        if (!value) {
            callback('验证码不能为空');
        } else if (!flag) {
            callback('6位数字');
        } else {
            callback();
        }
    };
    _handleShowWeChat = () => {
        this.props.onCancelPopup();
        this.props.onShowWeChat();
    };
    onCheckboxChange = (e) => {
        this.setState({
            rememberPwd: e.target.checked
        })
    };

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    render() {
        const {getFieldDecorator, getFieldError, getFieldsError, getFieldsValue} = this.props.form;
        const {isSendCodeFlag, timer, phoneCheckOut, errorInfo, rememberPwd, loading} = this.state;
        let disabled = Utils.hasValues(getFieldsValue()) === true || Utils.hasErrors(getFieldsError()) === true || !(rememberPwd === true);
        const style = {
            modal: {
                top: 0, margin: 0,
                padding: '32px 60px 14px',
            },
        };
        const {flag} = this.props;
        const label = function (label, type, hint = '') {
            return (<div className="formLabel">
                <span className="text">{label}</span>
                <em className="placeholder">{hint}</em>
                <i className="error">{(getFieldError(type) || []).join(', ')}</i>
            </div>)
        };

        return (
            <Modal visible={flag} centered footer={null} width={660} bodyStyle={style.modal}
                   maskClosable={false}
                   iconType='error' onCancel={this.props.onCancelPopup}>
                <div className="form-wrap" id="loginModal">
                    <h4 className="title">注册</h4>
                    <Form className="login-form" layout="vertical" onSubmit={this._handleSubmit}>
                        <FormItem hasFeedback label={label('用户名', 'nick_name', '15个字以内，中文/英文/数字组合')}>
                            {getFieldDecorator('nick_name', {
                                // initialValue: '',
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
                        <FormItem hasFeedback label={label('邮箱', 'email')}>
                            {getFieldDecorator('email', {
                                // initialValue: '',
                                rules: [
                                    {
                                        validator: this._handleEmailRegisterCheck
                                    }
                                ],
                                validateTrigger: 'onBlur'
                            })(
                                <Input type="text"/>
                            )}
                        </FormItem>
                        <FormItem hasFeedback label={label('密码', 'password', '8位以上，中文/英文/数字组合')}>
                            {getFieldDecorator('password', {
                                // initialValue: '',
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
                                // initialValue: '',
                                rules: [
                                    {validator: this.compareToFirstPassword}
                                ],
                                validateTrigger: 'onBlur'
                            })(
                                <Input type="password" onBlur={this.handleConfirmBlur} autoComplete="off"/>
                            )}
                        </FormItem>
                        {/*hasFeedback*/}
                        <FormItem label={label('手机号', 'mobile_phone')}>
                            <Row gutter={8}>
                                <Col span={18}>
                                    {getFieldDecorator('mobile_phone', {
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
                                    <Button onClick={this.getMphoneVerifyCodeHttp} disabled={isSendCodeFlag}
                                            className={`sendCode ${phoneCheckOut && !isSendCodeFlag ? "active" : ""}`}>{isSendCodeFlag ? `剩余 ${timer}(s)` : "发送验证码"}</Button>
                                </Col>
                            </Row>

                        </FormItem>

                        <FormItem hasFeedback label={label('验证码', 'mb_verify_code')}>
                            {getFieldDecorator('mb_verify_code', {
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
                        <FormItem>
                            {getFieldDecorator('rememberPwd', {
                                valuePropName: 'checked',
                                initialValue: false,
                            })(
                                <Checkbox onChange={this.onCheckboxChange}>我已阅读并接受<Link
                                    href="/userAgreement"><a><span className="linkColor">用户协议</span></a></Link>和
                                    {/*<Link href="/userAgreement"><a>*/}
                                    <span>隐私政策</span>
                                    {/*</a></Link>*/}
                                </Checkbox>
                            )}
                            <Button size="large" type="primary" htmlType="submit"
                                    className="login-form-button" loading={loading}
                                    disabled={disabled}>注册</Button>
                            {
                                errorInfo && <div className="errorInfo">{errorInfo}</div>
                            }
                            <div className="register active">已有账号？&nbsp;去<span className="pointer"
                                                                               onClick={this.handleShowLogin}>登录</span>
                            </div>
                            <i className="weChatImg" onClick={this._handleShowWeChat}/>
                            <div className="weChatName">微信登录</div>
                        </FormItem>
                    </Form>
                </div>
                <style jsx>{`
                    .register.active{
                        margin:16px auto 30px;
                    }
                    .weChatImg {
                      display: block;
                      margin: 0 auto;
                      width: 37px;
                      height: 37px;
                      background: url("../../static/weChat.png") no-repeat center center/100% ;
                    }
                    .weChatImg:hover{
                       background-image: url("../../static/weChatHover.png");
                    }
                    `}

                </style>
            </Modal>
        )
    }
}

const getUserInfo = ({detailPage, headerReducer}) => {
    return {
        isLoginFlag: headerReducer.isLoginFlag,
    }
};
export default connect(getUserInfo)(Form.create({})(RegisterCpn));
