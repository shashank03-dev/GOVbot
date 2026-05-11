import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import PageTransition from "@/components/PageTransition";
import Layout from "@/components/Layout";
import Lenis from "lenis";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <ErrorBoundary>
      <Layout>
        <PageTransition>
          <Component {...pageProps} />
        </PageTransition>
      </Layout>
    </ErrorBoundary>
  );
}
