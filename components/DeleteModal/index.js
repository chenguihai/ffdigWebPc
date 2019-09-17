import React, {Component} from 'react'
import {Modal} from 'antd'
import "./index.less"

/**
 * @param title 标题
 * @param content 内容
 * @function hide 关闭弹框
 * @function sure 提交内容
 */
export default class DeleteModal extends Component {
    // 初始化页面常量 绑定事件方法
    constructor(props, context) {
        super(props);
    }

    render() {
        const style = {
            modal: {top: 0, paddingBottom: 0, margin: 0},
        };
        const {title, content,visible} = this.props;
        return (
            <Modal title={title} wrapClassName="cancelCollect" style={style.modal} visible={visible} centered okText='确定' cancelText='取消' iconType='error' maskClosable={false}
                   onCancel={this.props.hide} onOk={this.props.sure}>
                <p>{content}</p>
            </Modal>
        )
    }
}
