import { combineReducers } from 'redux'

// import { RESET_ACTION } from '../actions'
import account from './account'
import headerReducer from './headerReducer'
import listPageReducer from './listPageReducer'
import detailPage from './detailPageReducer'
import bgPage from './bgPageReducer'
import searchPage from './searchPageReducer'
import article from './articleReducer'


const reducer = combineReducers({
    account,
    headerReducer,
    listPageReducer,
    detailPage,
    bgPage,
    searchPage,
    article
});

const initialState = reducer();

export default (state = initialState, action = {}) => {
    switch (action.type) {
        // case RESET_ACTION:
        //     return initialState;
        default:
            return reducer(state, action)
    }
}
