import {
  SET_VISIBILITY_FILRTER,
  VisibilityFilters
} from '../actions';

const {SHOW_ALL} = VisibilityFilters;

function visibilityFilter(state = SHOW_ALL, action) {
    switch (action.type) {
        case SET_VISIBILITY_FILRTER:
            return action.filter;
        default:
            return state;
    }
}

export default visibilityFilter;