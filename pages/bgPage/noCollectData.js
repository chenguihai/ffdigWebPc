import React, {Component} from 'react';

class NoCollectData extends Component {
    render() {
        return (
            <div className="noCollectEmpty">
                <img src="../../static/noCollect.png" alt="没有收藏图片"/>
                <span>未搜罗到相关结果</span>
            </div>
        );
    }
}

export default NoCollectData;