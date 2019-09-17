import {SET_ACCOUNT_INFO_ACTION} from '../actions'

const initialState = {
    userInfo: {
        token: '',
        nickName: '',
        headImgurl: ''
    }
};

export default (state = initialState, action = {}) => {
    const {type, ...payload} = action;
    switch (action.type) {
        case SET_ACCOUNT_INFO_ACTION:
            return Object.assign({...state}, payload);
        default:
            return state
    }
}