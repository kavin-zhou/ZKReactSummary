import {combinReducers} from 'redux'
import todos from './todos'
import visibilityFilter from './visibilityFilter'

const rootReducer = combinReducers({
    todos,
    visibilityFilter
});

export default rootReducer;

