import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import PoolChecker from "@/components/PoolChecker";
import { Container } from "@mui/material";
import PoolCheckerForm from "@/components/PoolCheckerForm";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Get Balancer Pool Data | EBTC-MONITOR</title>
        <meta name="description" content="Get Balancer Pool Data" />
      </Head>
      {/* <PoolChecker /> */}
      <PoolCheckerForm />
      {/* <main className={`${styles.main} ${inter.className}`}>
        <PoolChecker />
      </main> */}
    </>
  );
}
