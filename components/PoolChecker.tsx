import { useCallback, useMemo, useState } from "react";
import getPoolData from "../lib/fetcher";
import computeLiquidationData, { LiquidationData, PoolData } from "@/lib/liquidation";
import styles from "../styles/Home.module.css"

const CURVE_TYPE = "Curve";
const VELO_TYPE = "Velo";
const BAL_TYPE = "Balancer";

const PoolChecker: React.FC<any> = ({
}) => {


  const [poolType, setPoolType] = useState(BAL_TYPE);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [poolAddress, setPoolAddress] = useState("");
  const [balancerPoolId, setBalancerPoolId] = useState("");
  const [dataDump, setDatadump] = useState("");
  const [poolData, setPoolData] = useState<null | PoolData>(null)

  const [toSell, setToSell] = useState(1e21)
  const [liquidationPremium, setLiquidationPremium] = useState(300)
  const [secondsForPoolRefill, setSecondsForPoolRefill] = useState(60 * 60)
  const setPoolDataFromFetch = useCallback(async () => {
    setIsLoadingPool(true);
    try {
      console.log("*******");
      const res = await getPoolData(poolType, poolAddress, balancerPoolId);
      console.log("************ setPoolDataFromFetch", res);
      setPoolData(res)
      setDatadump(JSON.stringify(res));
    } catch (e) {
      console.log("Exception setPoolDataFromFetch", e);
    }

    setIsLoadingPool(false);
  }, [balancerPoolId, poolAddress, poolType]);

  const data: LiquidationData | null = useMemo(
    // We know it's defined
    () =>
    // @ts-ignore
      poolData != null ? computeLiquidationData(toSell, liquidationPremium, 18, {...poolData, timeForReplenishment: secondsForPoolRefill}) : null,
    [toSell, liquidationPremium, 18, poolData, secondsForPoolRefill]
  );
  return (
    <div>
      <div>
          <div>
            <h2>Get Balancer Pool Data</h2>
            <p>
              Pool Address
              <input
                type="string"
                onChange={(e) => setPoolAddress(e.target.value)}
                value={poolAddress}
              />
            </p>
            {poolType === BAL_TYPE && (
              <p>
                Balancer Pool Id
                <input
                  type="string"
                  onChange={(e) => setBalancerPoolId(e.target.value)}
                  value={balancerPoolId}
                />
              </p>
            )}
            <button
              type="button"
              disabled={isLoadingPool}
              onClick={setPoolDataFromFetch}
            >
              {isLoadingPool ? "Loading Pool" : "Load Pool"}
            </button>
          </div>
            
        {dataDump && <div className={styles.pre}>{dataDump}</div>}
        </div>
            
        {dataDump &&
        <div>
        <div>
          <p>
            Liquidity to Allow
            <input type="number" value={toSell} onChange={(e) => setToSell(parseInt(e.target.value, 10))} />
          </p>
          <p>
            In Eth
            <button onClick={() => setToSell(toSell - (1000e18))}>-1000</button>
            <input type="number" value={toSell / 1e18} onChange={(e) => setToSell(parseInt(e.target.value) * 1e18)} />
            <button onClick={() => setToSell(toSell + (100e18))}>+1000</button>
            <button onClick={() => setToSell(toSell * (10))}>* 10</button>
            <div className={styles.pre}>Selling {toSell}</div>
          </p>
          <p>
            Liquidation Premium
            <button onClick={() => setLiquidationPremium(liquidationPremium - (1000))}>-1000</button>
            <input type="number" value={liquidationPremium} onChange={(e) => setLiquidationPremium(parseInt(e.target.value, 10))} />
            <button onClick={() => setLiquidationPremium(liquidationPremium + (1000))}>+1000</button>
            <div className={styles.pre}>Premium {liquidationPremium}</div>
          </p>
          <p>
            Seconds For Pool Replenishment
            <button onClick={() => setSecondsForPoolRefill(secondsForPoolRefill - (60 * 60))}>- 1 Hour</button>
            <input type="number" value={secondsForPoolRefill} onChange={(e) => setSecondsForPoolRefill(parseInt(e.target.value))} />
            <button onClick={() => setSecondsForPoolRefill(secondsForPoolRefill + (60 * 60))}>+ 1 Hour</button>
            <div className={styles.pre}>Seconds for Pool Refill {secondsForPoolRefill}</div>
          </p>
          </div>
        <div className={styles.pre}>
            {JSON.stringify(data)}
        </div>
        </div>
    }


      </div>
  );
};

export default PoolChecker;
