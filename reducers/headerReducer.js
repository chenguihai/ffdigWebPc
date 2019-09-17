import {
    GET_EXCHANGE_RATE,
    GET_USER_COLLECT_COUNT,
    BREAD_CRUMB,
    GET_CAT_RELATION,
    IS_LOGIN_FLAG,
    IS_REGISTER_FLAG,

} from '../actions/headerAction'

const item = {id: '', name: '', index: 0};
const initialState = {
    collectCount: 0,
    rate: 'CNY',
    cat1Id: '',
    breadCrumb: [item, item, item],
    catRelation: {},
    isLoginFlag: false,
    isRegisterFlag: false,
};

export default (state = initialState, action = {}) => {
    const {type, ...payload} = action;
    // Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    switch (type) {
        case GET_EXCHANGE_RATE: //修改汇率
            return Object.assign({...state}, payload);
        case GET_USER_COLLECT_COUNT:
            return Object.assign({...state}, payload);
        case BREAD_CRUMB:
            return Object.assign({...state}, payload);
        case GET_CAT_RELATION:
            return Object.assign({...state}, payload);
        case IS_LOGIN_FLAG:
            return Object.assign({...state}, payload);
        case IS_REGISTER_FLAG:
            return Object.assign({...state}, payload);
        default:
            return state
    }
}