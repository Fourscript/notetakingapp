/*
  This component contains the shared Components and providers that are used on all pages.
*/
import {Container, CssBaseline} from "@mui/material";
import {ThemeProvider} from "@mui/material/styles";
import {SessionProvider} from "next-auth/react";
import Head from "next/head";
import React, {useEffect, useMemo, useState} from "react";
import {QueryClient, QueryClientProvider} from "react-query";
import ScrollTop from "../components/Dashboard/NotesTimeline/ScrollTop";
import Navbar from "../components/Navbar";

import {darkTheme, lightTheme} from "../styles/themes/theme";

const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [darkMode, setDarkMode] = useState(null);
  // Invoke setDarkMode whenever the page loads
  useEffect(() => {
    // If preference was set in localStorage, dont check the browser preference
    // else check the browser preference so that it is set as the default mode
    if (localStorage.getItem("mode")) {
      setDarkMode(JSON.parse(localStorage.getItem("mode")) === "dark");
    } else {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  // Set the theme palette based on the dark mode preference
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  // Change the mode when this function is called
  // Store the preference in localStorage
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("mode", JSON.stringify(!darkMode ? "dark" : "light"));
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>JotFox - Note Taking App</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <ThemeProvider theme={theme}>
            {/* Allows Switching between dark and light modes for native Components such as scrollbars*/}
            <CssBaseline enableColorScheme />
            {/* While the page loads, don't display any content */}
            {/* This prevents the theme from changing after the page has loaded */}
            {darkMode !== null ? (
              <Container
                maxWidth={false} // Remove default max width
                disableGutters
                sx={{
                  background: darkMode ? "#0d0e16" : "#B3B2B8",
                  minHeight: "100vh",
                  height: "100%",
                }}
              >
                <Navbar
                  darkMode={darkMode}
                  handleDarkModeToggle={handleDarkModeToggle}
                />
                {/* Each page is rendered in Component */}
                <Component {...pageProps} />
                <ScrollTop />
              </Container>
            ) : null}
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}
