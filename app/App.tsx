import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { trpc } from './src/utils/trpc';
import { httpBatchLink } from '@trpc/client';
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, useAppDispatch, useAppSelector } from './src/store/store';
import { setLogin } from './src/store/slices/loginSlice';
import { Provider, useDispatch } from 'react-redux';
import { Platform } from 'react-native';
import { set } from './src/store/slices/meSlice';
import jwtDecode from 'jwt-decode';
import { LogBox } from 'react-native';
import { setLanguage } from './src/store/slices/languageSlice';
import Auth from './src/Routes/Auth';
import AllRoute from './src/Routes/All';
import { host } from './src/utils/host';
import WSLayer from './src/WSLayer';
import Loading from './src/Components/Loading';

const IGNORED_LOGS = [
  "Node of type",
  "Selector unknown returned"
]

LogBox.ignoreLogs(IGNORED_LOGS);

if (__DEV__) {
  const withoutIgnored = (logger: any) => (...args: any) => {
    const output = args.join(' ');

    if (!IGNORED_LOGS.some(log => output.includes(log))) {
      logger(...args);
    }
  };

  console.log = withoutIgnored(console.log);
  console.info = withoutIgnored(console.info);
  console.warn = withoutIgnored(console.warn);
  console.error = withoutIgnored(console.error);
}

export default function App() {
  return <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <Base />
    </Provider>
  </GestureHandlerRootView>
}

const prefix = Linking.createURL('/');

const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#24252D',
  },
}

function Base() {
  const linking = {
    prefixes: [prefix],
  };

  const me = useAppSelector(state => state.me)

  const [token, setToken] = useState<string | undefined>(me?.token)
  const login = useAppSelector(state => state.login)
  const [isReady, setIsReady] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    setIsReady(false)

    AsyncStorage.getItem("token").then(token => {
      if (token) {
        setToken(token)
        setIsReady(true)

        dispatch(setLogin(true))
        dispatch(set({
          ...jwtDecode(token),
          token,
        }))
      }
    })

    AsyncStorage.getItem("language").then(lang => {
      if (lang) {
        dispatch(setLanguage(lang as any))
      }
    })
  }, [login])
  
  const [queryClient, setQueryClient] = useState(() => new QueryClient());
  const [trpcClient, setTrpcClient] = useState(() => createTrpcClient(''));

  useEffect(() => {
    if (!token) return

    setQueryClient(new QueryClient());
    setTrpcClient(createTrpcClient(token));
  }, [token]);

  function createTrpcClient(token: string) {
    return trpc.createClient({
      links: [
        httpBatchLink<any>({
          url: `http://${host}:3000/trpc/`,
          async headers() {
            if (!token) return {}

            return {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            } as any
          },
        }),
      ],
      transformer: superjson
    });
  }

  if (login === true && !isReady) return <Loading />
  if (login === true && !token) return <Loading />

  return <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      {login
        ? token 
          ? (
            <WSLayer>
              <NavigationContainer theme={Theme} linking={linking}>
                <AllRoute />
              </NavigationContainer>
            </WSLayer>
          ) : (
            <Loading />
          )
        : <NavigationContainer theme={Theme} linking={linking}> 
          <Auth />
        </NavigationContainer>
      }
      <StatusBar style={"light"} hidden={false} translucent={false}/>
    </QueryClientProvider>
  </trpc.Provider>
}
