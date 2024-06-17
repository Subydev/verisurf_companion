import { createStore, applyMiddleware, compose } from 'redux';
import reducer from './reducer/reducer';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, reducer);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
    const store = createStore(
        persistedReducer,
        composeEnhancers(applyMiddleware())
    );
    const persistor = persistStore(store);
    return { store, persistor };
};