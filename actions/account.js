
export const SET_ACCOUNT_INFO_ACTION = 'SET_ACCOUNT_INFO_ACTION';

export const setAccountInfoAction = data => dispatch => {
    return dispatch({type: SET_ACCOUNT_INFO_ACTION, userInfo: data})
};
