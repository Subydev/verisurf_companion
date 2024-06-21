import React from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import configureStore from "./Store";
import ThemeProvider from "./theme/ThemeProvider";
import AppContent from "./components/AppContent";  

export const NotificationContext = React.createContext();

export default function App(props) {
  const { store, persistor } = configureStore();

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider />
          <AppContent />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}