import Head from "next/head";
import { ChatIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Stack} from "@chakra-ui/react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "../firebaseconfig";

export default function Login() {
    const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

       return (
        <>
        <head>
            <title>Login</title>
        </head>

        <Center
        h="100vh"
        >
            <Stack
            align="center"
            bgColor="gray.600"
            p={16}
            rounded="3xl"
            spacing={12}
            boxShadow="lg"
            >
                <Box
                    
                    w="fit-content"
                    p={5}
                    rounded="3xl"
                    boxShadow="md"
                >

                <ChatIcon w="100px" h="100px" color="white" />
                </Box>
  
                <Button boxShadow="md" color="black" onClick={() => signInWithGoogle("", {prompt: "select_account"} )}> Sign in with Google   </Button>

                

            </Stack>
        </Center>
        </>
       )
}