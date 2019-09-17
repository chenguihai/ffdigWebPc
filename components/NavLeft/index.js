import React from 'react'
import {Icon, Menu, Tooltip} from 'antd';
import Link from 'next/link'
import {connect} from 'react-redux'
import {withRouter} from 'next/router'

import './index.less'

const SubMenu = Menu.SubMenu;

class NavLeft extends React.Component {
    state = {
        selectKey: 0
    };

    componentDidMount() {
        const {pathname} = this.props.router;
        this.setState({
            selectKey: pathname.indexOf("bgPage") >= 0 ? 0 : 1,
        });
    }

// 菜单渲染
    renderMenu = (data) => {
        return data.map((item) => {
            if (item.children) {
                return (
                    <SubMenu key={item.key} title={<span><Icon type={item.icon}/><span>{item.title}</span></span>}>
                        {this.renderMenu(item.children)}
                    </SubMenu>
                )
            }
            return <Menu.Item title={item.title} key={item.key}>
                <Link prefetch href={item.key}><a>{item.title}</a></Link>
            </Menu.Item>
        })
    };
    _handleMenuItem = (type) => {
        this.setState({
            selectKey: type === "accountManage" ? 1 : 0
        });
        this.props.router.push({
            pathname: type,
        })
    };

    render() {
        const {userInfo} = this.props;
        const {selectKey} = this.state;
        return (
            <div className="navLeft">
                <div className="navHead">
                    <img className="navImg" src={userInfo.headImgurl || "../../static/avatar.png"} alt="logo图标"/>
                    <div className="navName"><Tooltip title={userInfo.nickName}>{userInfo.nickName}</Tooltip></div>
                </div>
                <div className="space_6"/>
                <div className="navMenuBox">
                    <ul className="navMenu">
                        {
                            [{name: '产品收藏', type: '/bgPage'}, {
                                name: '账号管理',
                                type: '/accountManage'
                            }].map((item, index) => {
                                return (<li key={index} className={`navItem ${selectKey === index ? 'active' : ''}`}
                                            onClick={this._handleMenuItem.bind(this, item.type)}>{item.name}</li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        );
    }
}

const getUserInfo = ({account}) => {
    return {
        userInfo: account.userInfo
    }
};
export default connect(getUserInfo)(withRouter(NavLeft));
