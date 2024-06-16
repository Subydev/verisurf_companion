import { createStore } from 'redux';
import reducer from './reducer/reducer';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Correct import

const persistConfig = {
    key: 'root',
    storage: AsyncStorage, // Use AsyncStorage from @react-native-async-storage/async-storage
};

const persistedReducer = persistReducer(persistConfig, reducer);

export default () => {
    let store = createStore(persistedReducer);
    let persistor = persistStore(store);
    return { store, persistor };
};