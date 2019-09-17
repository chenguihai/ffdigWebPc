import React, {Component} from 'react';
import {Modal, Input} from "antd";
import "./index.less"

class UpdateCollectLabelCpn extends Component {
    values = null;
    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.sure(this.values);
    };
    _handleUpdateLabel = (e) => {
        this.values = e.target.value;
    };

    render() {
        const style = {
            modal: {top: 0, padding: '58px 30px 32px', margin: 0},
        };
        const {visible} = this.props;
        return (
            <Modal title="" width={500} wrapClassName="updateLabel" bodyStyle={style.modal} visible={visible} centered
                   okText='确定' cancelText='取消' destroyOnClose={true}
                   iconType='error' maskClosable={false}
                   onCancel={this.props.hide} onOk={this._handleSubmit}>
                <h5 className="editTitle">修改收藏标签</h5>
                <Input onBlur={this._handleUpdateLabel} placeholder="20个字以内"/>
                <p className="editExplain">已有标签的产品将更新为修改后的标签</p>
            </Modal>
        );
    }
}

export default UpdateCollectLabelCpn;