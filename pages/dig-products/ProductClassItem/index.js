import React, {Component, Fragment} from 'react'
import Link from "next/link";
import {connect} from "react-redux";
import {
    getHomePageData,
    setSelectDesignerActive,
    setSelectDesignerByActive,
    setSelectionLabelActive,
    setSelectStyleActive,
    setSelectColorActive,
    setSelectTextureActive,
} from "../../../actions/listPageAction";
import {getCatRelationActive} from '../../../actions/headerAction'
import {breadCrumbActive} from "../../../actions";
import {axiosHttp} from "../../../utils/ajax";
import Utils from "../../../utils/utils";

class ProductClassItem extends Component {
    state = {
        isSelectFlag: false,
    };
//     根据分类id获取分类映射信息
    getCatRelationHttp = (cat_id) => { //首页搜索--已登录
        axiosHttp(`api/WebSite/Classify/GetCatRelation?catid=${cat_id}`, '', 'get').then((res) => {
            if (res.code === 200) {
                let relation = {};
                if (res.data) {
                    const {designerBy, designer, site, style, texture, color} = res.data;
                    relation = {
                        designerBy: Utils.bouncer(designerBy),
                        designer: Utils.bouncer(designer),
                        site: site,
                        style: Utils.bouncer(style),
                        texture: Utils.bouncer(texture),
                        color: Utils.bouncer(color)
                    };
                }
                this.props.dispatch(getCatRelationActive(relation));
            }
        }).catch(e => {
            console.log(e);
        })
    };
    // cmi_cat[index]
    _handleItemCat2 = (catItem, cat2Index) => {
        this.props.onHeadSearch({cat_id: catItem.cat2_id, site: '', source_brand: '', designer: ''});
        const {breadCrumb} = this.props;
        breadCrumb[1] = {id: catItem.cat2_id, name: catItem.cat2_name_cn, index: cat2Index};
        breadCrumb[2] = {id: '', name: '', index: 0};
        this.props.dispatch(breadCrumbActive(breadCrumb));
        this.getCatRelationHttp(catItem.cat2_id);
        this.clearCatRelationCommon();
    };
    handleItemCat3 = (catItem, cat2Index, index) => {
        let cat3_id = catItem.list[index].cat3_id;
        this.props.onHeadSearch({cat_id: cat3_id, site: '', source_brand: '', designer: ''});
        const {breadCrumb} = this.props;
        breadCrumb[1] = {id: catItem.cat2_id, name: catItem.cat2_name_cn, index: cat2Index};
        breadCrumb[2] = {id: catItem.list[index].cat3_id, name: catItem.list[index].cat3_name_cn, index: index};
        this.props.dispatch(breadCrumbActive(breadCrumb));
        this.getCatRelationHttp(cat3_id);
        this.clearCatRelationCommon();
    };


    _handleCollapse = (cat2Index, flag, e) => {
        e.stopPropagation();
        const {cmi_cat, breadCrumb} = this.props;
        let indexIn = breadCrumb[0].index;
        cmi_cat[indexIn].list = cmi_cat[indexIn].list.map((item, index) => {
            if (cat2Index === index) {
                item.isCloseFlag = flag;
            } else {
                item.isCloseFlag = false;
            }
            return item;
        });
        this.props.dispatch(getHomePageData(cmi_cat));
        this.setState({
            isSelectFlag: this.state.isSelectFlag
        })
    };

    clearCatRelationCommon = () => {
        const {dispatch} = this.props;
        dispatch(setSelectionLabelActive([]));
        dispatch(setSelectDesignerActive([]));
        dispatch(setSelectDesignerByActive([]));
        dispatch(setSelectStyleActive([]));
        dispatch(setSelectColorActive([]));
        dispatch(setSelectTextureActive([]));
    };
    stopPropagationFun = (e) => {
        e.stopPropagation();
    };

    render() {
        const {cmi_cat = [], breadCrumb,visible} = this.props;
        let index = breadCrumb[0].index || 0;

        let isHasCmiCat = cmi_cat.length > 0 && cmi_cat[index].list.length > 0;
        return (
            <div className={`collapseBox ${visible ? 'active' : ''}`} onClick={this.stopPropagationFun}>
                {
                    isHasCmiCat && cmi_cat[index].list.map((cat2Item, cat2Index) => {
                        let num = cat2Item.isCloseFlag ? cat2Item.list.length : 5,
                            data = cat2Item.list.filter((em, index) => index < num);
                        return (
                            <Fragment key={cat2Item.cat2_id}>
                                <h3 onClick={this._handleItemCat2.bind(this, cat2Item, cat2Index)}
                                    className={`catActive ${cat2Item.cat2_id === breadCrumb[1].id ? 'active' : ''}`}>
                                    <Link href={{
                                        pathname: '/dig-products',
                                        query: {cat_id: cat2Item.cat2_id}
                                    }}>
                                        <a>{cat2Item.cat2_name_cn}</a>
                                    </Link>
                                </h3>
                                <ul className="collapseUl pr">
                                    {
                                        data.map((item, index) => {
                                            return (
                                                <li
                                                    key={item.cat3_id}><span
                                                    onClick={this.handleItemCat3.bind(this, cat2Item, cat2Index, index)}
                                                    className={`content ${item.cat3_id === breadCrumb[2].id ? 'active' : ''}`}>
                                                           <Link href={{
                                                               pathname: '/dig-products',
                                                               query: {cat_id: item.cat3_id}
                                                           }}>
                                            <a>{item.cat3_name_cn}</a>
                                                           </Link></span>
                                                </li>
                                            )
                                        })
                                    }
                                    {/*更多*/}
                                    {
                                        cat2Item.list.length > 5 &&
                                        <div className="listMoreWrap"
                                             onClick={this._handleCollapse.bind(this, cat2Index, !cat2Item.isCloseFlag)}>
                                            {
                                                !cat2Item.isCloseFlag && <span>更多</span>
                                            }
                                            <i className={`iconfont iconlb-more underCircleIcon ${cat2Item.isCloseFlag ? 'active' : ''}`}/>
                                        </div>
                                    }
                                </ul>
                            </Fragment>
                        )
                    })
                }
            </div>
        )
    }
}

const getUserInfo = ({listPageReducer, headerReducer}) => {
    return {
        cmi_cat: listPageReducer.cmi_cat,
        breadCrumb: headerReducer.breadCrumb,
    }
};
export default connect(getUserInfo)(ProductClassItem);