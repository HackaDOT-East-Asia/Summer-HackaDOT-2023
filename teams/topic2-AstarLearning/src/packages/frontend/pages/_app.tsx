import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes';
import { ContractProvider } from '../context';

/**
 * MyApp Component
 * @param param0 
 * @returns 
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ContractProvider>
      <ThemeProvider attribute="class">  
        <Component {...pageProps} />
      </ThemeProvider>  
    </ContractProvider>
  ) 
}

export default MyApp
