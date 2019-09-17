import React, {Component} from 'react';
import './index.less'

class DataEmptyCpn extends Component {
    render() {
        return (
            <div className='listProductEmpty'>
                <img src="../../static/sousuowuguo@2x.png" alt="产品为空图标"/>
                <span>抱歉，未搜罗到相关产品</span>
            </div>
        );
    }
}
export default DataEmptyCpn;