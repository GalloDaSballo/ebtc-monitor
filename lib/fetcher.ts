import fetchPoolData from "pool-stat-fetcher";

const MAINNET = 1;

const getPoolData = async (type, address, poolId = ""): Promise<PoolData> => {
  console.log("getPoolData");
  const data = await fetchPoolData(
    "https://eth-mainnet.g.alchemy.com/v2/w_eN41lVm3nQmjLXAz4ogqTrQMzEsfGY",
    MAINNET,
    type,
    address,
    poolId !== "" ? { poolId } : undefined
  );
  console.log("data", data);

  return data;
};

export default getPoolData;
