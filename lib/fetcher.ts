import fetchPoolData from "pool-stat-fetcher";
import { PoolData } from "./liquidation";

const MAINNET = 1;

const getPoolData = async (type: string, address: string, poolId = ""): Promise<PoolData> => {
  const data = await fetchPoolData(
    "https://eth-mainnet.g.alchemy.com/v2/w_eN41lVm3nQmjLXAz4ogqTrQMzEsfGY",
    MAINNET,
    type,
    address,
    poolId !== "" ? { poolId } : undefined
  );
  return data;
};

export default getPoolData;
