import React, {Component} from 'react';
import Link from 'next/link';
import {Button} from "antd";
import './index.less'

class EmptyCollect extends Component {
    render() {
        return (
            <div className='emptyProduct'>
                <img src="./assets/empty.png" alt="产品为空图标"/>
                <span>您的收藏库空空如也，去搜罗感兴趣的产品吧</span>
                <Link prefetch  href="/dig-products">
                    <a>
                    <Button className="btn" type="primary">搜罗产品</Button>
                    </a>
                </Link>
            </div>
        );
    }
}

export default EmptyCollect;