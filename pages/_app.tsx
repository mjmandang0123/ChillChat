import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/global.css";
import { ChakraProvider, Spinner, Center } from "@chakra-ui/react"
import Login from "../components/Login"
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "../firebaseconfig"

function App({ Component, pageProps }: AppProps) {
  const [user, loading, error] = useAuthState(auth);

  if (loading){
    return (
    <ChakraProvider>
      <Center h="100vh">
      <Spinner size="xl"/>
      </Center>
      
    </ChakraProvider>
    )
  }

  if (!user) {
    return (
      <ChakraProvider>
        <Login />
      </ChakraProvider>
    )
  }

  return (
    <>
     <Head>
        <title>ChillChat</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href="/robot-one-svgrepo-com.svg" />
      </Head>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );

}

export default App;
