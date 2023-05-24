import { useCallback, useState } from "react";
import getPoolData from "../lib/fetcher";
import styles from "../styles/Generic.module.css";
import { PoolData } from "../lib/liquidation";

const CURVE_TYPE = "Curve";
const VELO_TYPE = "Velo";
const BAL_TYPE = "Balancer";

const MOCK_DEFAULT_RESERVE = [1e18, 1e18];

const PoolSimulatorForLTVTool: React.FC<any> = ({
  decimals,
  setDecimals,
  isStable,
  setIsStable,
  unit,
  setUnit,
  rechargeTime,
  setRechargetime,
  poolType,
  setPoolType,
  tokenBals,
  setTokenBals,
}) => {
  const setPool = (res: PoolData) => {
    setTokenBals(res.poolReserves);
    setIsStable(res.isStable);
  };

  /** TODO: REFACTOR TO CONTEXT */
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [poolAddress, setPoolAddress] = useState("");
  const [balancerPoolId, setBalancerPoolId] = useState("");
  const [togglePreset, setTogglePreset] = useState(false);
  const [dataDump, setDatadump] = useState("");
  const setPoolDataFromFetch = useCallback(async () => {
    setIsLoadingPool(true);
    try {
      console.log("*******");
      // balancerPoolId is sanitied in `getPoolData`
      const res = await getPoolData(poolType, poolAddress, balancerPoolId);
      console.log("************ setPoolDataFromFetch", res);

      setPool(res);
      setDatadump(JSON.stringify(res));
    } catch (e) {
      console.log("Exception setPoolDataFromFetch", e);
    }

    setIsLoadingPool(false);
    setTogglePreset(false);
  }, [balancerPoolId, poolAddress, poolType]);

  return (
    <div>
        <button onClick={() => setTogglePreset(!togglePreset)}>
          Toggle Preset
        </button>
        {togglePreset && (
          <div>
            <h2>USE PRESET</h2>
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
        )}

        {dataDump && <div>{dataDump}</div>}
      </div>
  );
};

export default PoolSimulatorForLTVTool;
