import '../styles/globals.css'
import type { AppProps } from 'next/app'
import React, { Dispatch, useState } from 'react';

export const AppContext = React.createContext(
  {} as {
    api: any;
    setApi: Dispatch<React.SetStateAction<any>>;
  }
)

function MyApp({ Component, pageProps }: AppProps) {
  const [api, setApi] = useState<any>();
  
  return (
    <AppContext.Provider value={{api, setApi}}>
    <Component {...pageProps} />
    </AppContext.Provider>
  )
}

export default MyApp
