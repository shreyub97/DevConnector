import { createStore, applyMiddleware} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import thunk from 'redux-thunk';
// we will have multiple reducers, one for auth, one for profile, alert so on and we will combine everything in the root
import rootReducer from './reducers'; 

const initialState = {};

const middleware = [thunk];

const store = createStore(rootReducer, initialState, composeWithDevTools(applyMiddleware
    (...middleware)));

export default store;