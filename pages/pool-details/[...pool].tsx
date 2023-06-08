import PoolDetailsComponent from "@/components/PoolDetailsComponent";
import getPoolData from "@/lib/fetcher";
import { Box } from "@mui/material";
import { GetServerSideProps } from "next";
import Head from "next/head";

export default function PoolDetails({ dataDump }) {
  return (
    <>
      <Head>
        <title>Balancer Pool Data | EBTC-MONITOR</title>
        <meta name="description" content="Balancer Pool Data" />
      </Head>
      <PoolDetailsComponent dataDump={dataDump} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const BAL_TYPE = "Balancer";
  const pool = context.query.pool;

  if (!Array.isArray(pool)) {
    return { props: { dataDump: null, error: [] } };
  }

  const [poolAddress, balancerPoolId] = pool;

  if (!poolAddress || !balancerPoolId) {
    const error = [];
    if (!poolAddress) error.push("Pool address is missing!");
    if (!balancerPoolId) error.push("Balancer pool id is missing!");
    return { props: { dataDump: null, error } };
  }

  try {
    const res = await getPoolData(BAL_TYPE, poolAddress, balancerPoolId);
    return { props: { dataDump: JSON.parse(JSON.stringify(res)), error: [] } };
  } catch (error) {
    return { props: { dataDump: null, error: [] } };
  }
};
