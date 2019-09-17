import React, {Component} from 'react'
import {Button, Form, Input, Modal, Checkbox} from "antd";
import Utils from "../../utils/utils";
import {getUserCollectCountAction, setAccountInfoAction} from '../../actions'
import {connect} from 'react-redux'
import {axiosCookieHttp, axiosHttp} from "../../utils/ajax";
import {getHomePageSearch} from "../../actions/listPageAction";
import commonFun from "../../utils/commonFun";
import Svglogoblack from '../../static/svglogoblack.svg'
import "./index.less"

const FormItem = Form.Item;

class LoginModal extends Component {
    state = {
        errorInfo: '',  // 请求的错误信息
        pass_word: '',
        user_name: '',
        loading: false,
    };
    rememberPwd = false;
    local = null;

    componentDidMount() {
        this.base64 = new Utils.base64Function();
        this.local = window.localStorage;
        let params = this.local.getItem('loginInfo');
        if (params) {
            let account = JSON.parse(params);
            const {pass_word, user_name, rememberPwd, date} = account;
            let current = new Date().getTime();
            this.rememberPwd = true;

            if (current - date > 1000 * 60 * 60 * 24 * 7) {
                this.local.clear();
            } else {
                this.props.form.setFieldsValue({
                    pass_word: this.base64.decode(pass_word),//解密
                    user_name: user_name,
                    rememberPwd: rememberPwd
                });
                this.props.form.validateFields();
            }
        }
    }

    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.userLoginHttp(values);
            }
        });
    };
    userLoginHttp = (params) => {  //用户登录
        const {dispatch, form, name} = this.props;
        let {rememberPwd, ...props} = params;
        this.setState({
            loading: true
        });
        axiosHttp('api/WebSite/Login/UserLogin', props).then(res => {
            if (res.code === 200) {
                this.setState({
                    loginFlag: false,
                    errorInfo: '',
                    loading: false
                });
                if (rememberPwd === true) {
                    const {pass_word, user_name, rememberPwd} = params;
                    let param = {
                        pass_word: this.base64.encode(pass_word),//加密
                        user_name,
                        rememberPwd,
                        date: new Date().getTime()
                    };
                    this.local.setItem('loginInfo', JSON.stringify(param));
                }
                commonFun.storageLoginInfoFun(res.data);
                dispatch(setAccountInfoAction(res.data)); //保存登录信息
                dispatch(getUserCollectCountAction()); //获取用户收藏数量
                this.checkIsCollectHttp(); //登录之后核对有哪些是收藏了的
                Utils.insertLoginRecordHttp(1, res.data.userId);
                this.props.onCancelPopup();
            } else {
                this.setState({
                    errorInfo: res.msg,
                    loading: false
                });
                Utils.insertLoginRecordHttp(0, '', res.msg);
            }
        }).catch((e) => {
            console.log(e);
        });
    };

    checkUsername = (rule, value, callback) => {
        var regPhone = /^1[0-9]{10}$/,
            // regEmail = /^([a-z0-9+_]|\\-|\\.)+@(([a-z0-9_]|\\-)+\\.)+[a-z]{2,6}\$/i;
            regEmail = /^[A-Z_a-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        if (!value) {
            callback('请输入账号(邮箱/手机号)！');
        } else if (!regPhone.test(value) && !regEmail.test(value)) {
            callback('请输入正确的账号！');
        } else {
            callback();
        }
    };
    checkPassword = (rule, value, callback) => {
        if (!value) {
            callback('密码不能为空');
        } else if (!/^[0-9A-Za-z\S]{8,20}$/.test(value)) {
            callback('密码格式不对');
        } else {
            callback();
        }
    };
    handleShowRegister = () => {
        this.props.onCancelPopup();
        this.props.onShowRegister();
    };
    _handleShowWeChat = () => {
        this.props.onCancelPopup();
        this.props.onShowWeChat();
    };
    _handleShowFindPwd = () => {
        this.props.onCancelPopup();
        this.props.onFindPwd();
    };
    checkIsCollectHttp = () => { //检查商品是否已收藏
        let nickName = window.sessionStorage.getItem('nickName');
        if (nickName) {
            const {data, count,currentPage} = this.props.searchData;
            if (!data) { //data 为null 返回
                return
            }
            let productIdArr = [];
            let isLoginFlag = data.some((item) => item.isCollect === true);
            for (let i = 0; i < data.length; i++) {
                if (isLoginFlag) {
                    // 第一次以后的收藏
                    if (data[i].isCollect === undefined) {
                        productIdArr.push(data[i].object_id);
                    }
                } else {
                    // 第一次收藏
                    productIdArr.push(data[i].object_id);
                }
            }
            if (productIdArr.length === 0) {
                return
            }
            axiosCookieHttp('api/WebSite/HomePage/CheckIsCollect', {products: productIdArr.toString()}).then((res) => {
                if (res.code === 200) {
                    let collectData = res.data;
                    for (let i = 0; i < data.length; i++) {
                        for (let j = 0; j < collectData.length; j++) {
                            if (data[i].object_id === collectData[j].id) {
                                data[i].isCollect = collectData[j].isCollect;
                                data[i].lable = collectData[j].lable;
                            }
                        }
                    }
                    this.props.dispatch(getHomePageSearch({
                        data: data,
                        count: count,
                        currentPage
                    }));
                }
            }).catch((e) => {
                console.log(e);
            })
        }
    };

    render() {
        const {getFieldDecorator, getFieldError, getFieldsError, getFieldsValue} = this.props.form;
        let disabled = Utils.hasValues(getFieldsValue()) === true || Utils.hasErrors(getFieldsError()) === true;
        const style = {
            modal: {
                top: 0, margin: 0,
                padding: '78px 60px 14px'
            }
        };
        const {flag} = this.props;
        const {errorInfo, loading} = this.state;
        const label = (label, type) => {
            return (<div className="formLabel">
                <span className="text">{label}</span>
                <em className="placeholder"/>
                <i className="error">{(getFieldError(type) || []).join(', ')}</i>
            </div>)
        };
        return (
            <Modal visible={flag} centered footer={null} width={660} bodyStyle={style.modal} maskClosable={false}
                   iconType='error' onCancel={this.props.onCancelPopup}>
                <div className="form-wrap" id="loginModal">
                    {/*<img src="../../static/logoblack.png" alt="logo图片"/>*/}
                    <Svglogoblack className="img"/>
                    <Form className="login-form" layout="vertical" onSubmit={this._handleSubmit}>
                        <FormItem hasFeedback label={label('手机', 'user_name')}>
                            {getFieldDecorator('user_name', {
                                initialValue: '',
                                rules: [{validator: this.checkUsername}],
                                validateTrigger: 'onBlur'
                            })(
                                <Input placeholder="账号(邮箱/手机号)"/>
                            )}
                        </FormItem>
                        <FormItem className="checkboxPwd" hasFeedback label={label('密码', 'pass_word')}>
                            {getFieldDecorator('pass_word', {
                                initialValue: '',
                                rules: [
                                    {validator: this.checkPassword}
                                ],
                                validateTrigger: 'onBlur'
                            })(
                                <Input type="password" autoComplete="off"/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('rememberPwd', {
                                valuePropName: 'checked',
                                initialValue: false,
                            })(
                                <Checkbox>记住密码</Checkbox>
                            )}
                            <div className="login-form-forgot pointer" onClick={this._handleShowFindPwd}>忘记密码</div>
                            <Button size="large" type="primary" htmlType="submit"
                                    className="login-form-button" loading={loading}
                                    disabled={disabled}>登录</Button>
                            {
                                errorInfo && <div className="errorInfo">{errorInfo}</div>
                            }
                            <div className="register">无账号？&nbsp;去<span className="pointer"
                                                                       onClick={this.handleShowRegister}>注册</span></div>
                            <i className="weChatImg" onClick={this._handleShowWeChat}/>
                            <div className="weChatName">微信登录</div>
                        </FormItem>
                    </Form>
                </div>
                <style jsx>{`
                     .weChatImg {
                      display: block;
                      margin: 30px auto 0;
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

const mapStateToProps = ({listPageReducer}) => {
    return {
        searchData: listPageReducer.searchData,
    }
};

export default connect(mapStateToProps)(Form.create({name: 'loginForm'})(LoginModal))
