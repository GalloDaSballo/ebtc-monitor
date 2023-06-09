import { useCallback, useMemo, useState } from "react";
import getPoolData from "../lib/fetcher";
import computeLiquidationData, {
  LiquidationData,
  PoolData,
} from "@/lib/liquidation";
import styles from "../styles/Home.module.css";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  InputLabel,
  OutlinedInput,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { toast } from "react-toastify";

const CURVE_TYPE = "Curve";
const VELO_TYPE = "Velo";
const BAL_TYPE = "Balancer";

const PoolChecker: React.FC<any> = ({}) => {
  const theme = useTheme();
  const [poolType, setPoolType] = useState(BAL_TYPE);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [poolAddress, setPoolAddress] = useState(
    "0x32296969ef14eb0c6d29669c550d4a0449130230"
  );
  const [balancerPoolId, setBalancerPoolId] = useState(
    "0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080"
  );
  const [dataDump, setDatadump] = useState("");
  const [poolData, setPoolData] = useState<null | PoolData>(null);

  const [toSell, setToSell] = useState(1e21);
  const [liquidationPremium, setLiquidationPremium] = useState(300);
  const [secondsForPoolRefill, setSecondsForPoolRefill] = useState(60 * 60);
  const setPoolDataFromFetch = useCallback(async () => {
    if (!poolAddress || !balancerPoolId) {
      toast.error("Please provide Pool address and Pool Id");
      return false;
    }

    setIsLoadingPool(true);
    try {
      console.log("*******");
      const res = await getPoolData(poolType, poolAddress, balancerPoolId);
      console.log("************ setPoolDataFromFetch", res);
      setPoolData(res);
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
      poolData != null
        ? computeLiquidationData(toSell, liquidationPremium, 18, {
            ...poolData,
            timeForReplenishment: secondsForPoolRefill,
          })
        : null,
    [toSell, liquidationPremium, 18, poolData, secondsForPoolRefill]
  );

  const toTitleCase = (text: string) => {
    const result = text.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  };

  const parseValue = (attribute: string, data: unknown) => {
    switch (attribute) {
      case "poolType":
        return toTitleCase(JSON.parse(JSON.stringify(String(data))));
      case "isStable":
        const val = Boolean(JSON.parse(JSON.stringify(String(data))));
        return val ? "Yes" : "No";
      default:
        return JSON.stringify(data);
    }
  };

  return (
    <>
      <Card
        sx={{ maxWidth: 445, margin: "0 auto", marginTop: theme.spacing(4) }}
      >
        <CardContent>
          <Typography gutterBottom variant="h1">
            Get Balancer Pool Data
          </Typography>
          <Box marginBottom={theme.spacing(2)}>
            <InputLabel htmlFor="poolAddress">Pool Address</InputLabel>
            <OutlinedInput
              fullWidth
              id="poolAddress"
              onChange={(e) => setPoolAddress(e.target.value)}
              value={poolAddress}
            />
          </Box>

          <Box marginBottom={theme.spacing(2)}>
            <InputLabel htmlFor="poolAddress">Balancer Pool Id</InputLabel>
            <OutlinedInput
              fullWidth
              id="poolAddress"
              onChange={(e) => setBalancerPoolId(e.target.value)}
              value={balancerPoolId}
            />
          </Box>
          <Button
            variant="contained"
            disabled={isLoadingPool}
            onClick={setPoolDataFromFetch}
          >
            {isLoadingPool ? "Loading Pool" : "Load Pool"}
          </Button>
        </CardContent>
      </Card>

      {dataDump && (
        <>
          <Box sx={{ marginTop: theme.spacing(4) }}>
            <Typography gutterBottom variant="h2">
              Pool Details
            </Typography>
            <TableContainer component={Card}>
              <Table sx={{ minWidth: 650 }} aria-label="Pool details">
                <TableHead>
                  <TableRow>
                    <TableCell width={theme.spacing(20)}>Attribute</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(JSON.parse(dataDump)).map((key) => (
                    <TableRow
                      key={key}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {toTitleCase(key)}
                      </TableCell>
                      <TableCell>
                        {parseValue(key, JSON.parse(dataDump)[key])}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Liquidity to Allow */}
          <Box>
            <Box
              marginBottom={theme.spacing(4)}
              display="flex"
              alignItems="center"
              marginTop={theme.spacing(8)}
            >
              <InputLabel htmlFor="liquidityToAllow">
                Liquidity to Allow
              </InputLabel>
              <OutlinedInput
                type="number"
                fullWidth
                id="liquidityToAllow"
                onChange={(e) => setToSell(parseInt(e.target.value, 10))}
                value={toSell}
                size="small"
                style={{
                  flex: 1,
                  marginLeft: theme.spacing(2),
                  maxWidth: theme.spacing(50),
                }}
              />
            </Box>
            {/* Liquidity to Allow */}

            {/* In Eth */}
            <Box
              marginBottom={theme.spacing(1)}
              display="flex"
              alignItems="center"
              marginTop={theme.spacing(8)}
            >
              <InputLabel htmlFor="liquidityToAllow">In Eth</InputLabel>
              <Box
                display="flex"
                alignItems="center"
                marginLeft={theme.spacing(2)}
              >
                <Button
                  variant="contained"
                  onClick={() => setToSell(toSell - 1000e18)}
                >
                  -1000
                </Button>
                <OutlinedInput
                  type="number"
                  fullWidth
                  id="liquidityToAllow"
                  value={toSell / 1e18}
                  onChange={(e) => setToSell(parseInt(e.target.value) * 1e18)}
                  size="small"
                  style={{
                    flex: 1,
                    maxWidth: theme.spacing(50),
                    marginLeft: theme.spacing(1),
                    marginRight: theme.spacing(1),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => setToSell(toSell + 1000e18)}
                >
                  +1000
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setToSell(toSell * 10)}
                  sx={{ marginLeft: theme.spacing(1) }}
                >
                  * 10
                </Button>
              </Box>
            </Box>
            <Paper variant="outlined" sx={{ padding: theme.spacing(2) }}>
              Selling {toSell}
            </Paper>
            {/* In Eth */}

            {/* Liquidation Premium */}
            <Box
              marginBottom={theme.spacing(1)}
              display="flex"
              alignItems="center"
              marginTop={theme.spacing(8)}
            >
              <InputLabel htmlFor="liquidityToAllow">
                Liquidation Premium
              </InputLabel>
              <Box
                display="flex"
                alignItems="center"
                marginLeft={theme.spacing(2)}
              >
                <Button
                  variant="contained"
                  onClick={() =>
                    setLiquidationPremium(liquidationPremium - 1000)
                  }
                >
                  -1000
                </Button>
                <OutlinedInput
                  type="number"
                  fullWidth
                  id="liquidityToAllow"
                  value={liquidationPremium}
                  onChange={(e) =>
                    setLiquidationPremium(parseInt(e.target.value, 10))
                  }
                  size="small"
                  style={{
                    flex: 1,
                    maxWidth: theme.spacing(50),
                    marginLeft: theme.spacing(1),
                    marginRight: theme.spacing(1),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() =>
                    setLiquidationPremium(liquidationPremium + 1000)
                  }
                >
                  +1000
                </Button>
              </Box>
            </Box>
            <Paper variant="outlined" sx={{ padding: theme.spacing(2) }}>
              Selling {toSell}
            </Paper>
            {/* Liquidation Premium */}

            {/* Seconds For Pool Replenishment */}
            <Box
              marginBottom={theme.spacing(1)}
              display="flex"
              alignItems="center"
              marginTop={theme.spacing(8)}
            >
              <InputLabel htmlFor="liquidityToAllow">
                Seconds For Pool Replenishment
              </InputLabel>
              <Box
                display="flex"
                alignItems="center"
                marginLeft={theme.spacing(2)}
              >
                <Button
                  variant="contained"
                  onClick={() =>
                    setSecondsForPoolRefill(secondsForPoolRefill - 60 * 60)
                  }
                >
                  - 1 Hour
                </Button>
                <OutlinedInput
                  type="number"
                  fullWidth
                  id="liquidityToAllow"
                  value={secondsForPoolRefill}
                  onChange={(e) =>
                    setSecondsForPoolRefill(parseInt(e.target.value))
                  }
                  size="small"
                  style={{
                    flex: 1,
                    maxWidth: theme.spacing(50),
                    marginLeft: theme.spacing(1),
                    marginRight: theme.spacing(1),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() =>
                    setSecondsForPoolRefill(secondsForPoolRefill + 60 * 60)
                  }
                >
                  + 1 Hour
                </Button>
              </Box>
            </Box>
            <Paper variant="outlined" sx={{ padding: theme.spacing(2) }}>
              Seconds for Pool Refill {secondsForPoolRefill}
            </Paper>
            {/* Seconds For Pool Replenishment */}

            <Box marginTop={theme.spacing(8)} marginBottom={theme.spacing(8)}>
              <Paper variant="outlined" sx={{ padding: theme.spacing(2) }}>
                {JSON.stringify(data)}
              </Paper>
            </Box>
          </Box>
        </>
      )}

      <div>
        <div>
          {/* <div>
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
          </div> */}

          {/* {dataDump && <div className={styles.pre}>{dataDump}</div>} */}
        </div>

        {dataDump && (
          <div>
            <div>
              {/* <p>
                Liquidity to Allow
                <input
                  type="number"
                  value={toSell}
                  onChange={(e) => setToSell(parseInt(e.target.value, 10))}
                />
              </p>
              <p>
                In Eth
                <button onClick={() => setToSell(toSell - 1000e18)}>
                  -1000
                </button>
                <input
                  type="number"
                  value={toSell / 1e18}
                  onChange={(e) => setToSell(parseInt(e.target.value) * 1e18)}
                />
                <button onClick={() => setToSell(toSell + 100e18)}>
                  +1000
                </button>
                <button onClick={() => setToSell(toSell * 10)}>* 10</button>
                <div className={styles.pre}>Selling {toSell}</div>
              </p>
              <p>
                Liquidation Premium
                <button
                  onClick={() =>
                    setLiquidationPremium(liquidationPremium - 1000)
                  }
                >
                  -1000
                </button>
                <input
                  type="number"
                  value={liquidationPremium}
                  onChange={(e) =>
                    setLiquidationPremium(parseInt(e.target.value, 10))
                  }
                />
                <button
                  onClick={() =>
                    setLiquidationPremium(liquidationPremium + 1000)
                  }
                >
                  +1000
                </button>
                <div className={styles.pre}>Premium {liquidationPremium}</div>
              </p> */}
              {/* <p>
                Seconds For Pool Replenishment
                <button
                  onClick={() =>
                    setSecondsForPoolRefill(secondsForPoolRefill - 60 * 60)
                  }
                >
                  - 1 Hour
                </button>
                <input
                  type="number"
                  value={secondsForPoolRefill}
                  onChange={(e) =>
                    setSecondsForPoolRefill(parseInt(e.target.value))
                  }
                />
                <button
                  onClick={() =>
                    setSecondsForPoolRefill(secondsForPoolRefill + 60 * 60)
                  }
                >
                  + 1 Hour
                </button>
                <div className={styles.pre}>
                  Seconds for Pool Refill {secondsForPoolRefill}
                </div>
              </p> */}
            </div>
            {/* <div className={styles.pre}>{JSON.stringify(data)}</div> */}
          </div>
        )}
      </div>
    </>
  );
};

export default PoolChecker;
