import {
  Card,
  CardContent,
  Typography,
  Box,
  InputLabel,
  OutlinedInput,
  Button,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function PoolCheckerForm() {
  const theme = useTheme();
  const router = useRouter();

  const [poolAddress, setPoolAddress] = useState(
    "0x32296969ef14eb0c6d29669c550d4a0449130230"
  );
  const [balancerPoolId, setBalancerPoolId] = useState(
    "0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080"
  );

  const handlePoolCheckerClick = () => {
    if (!poolAddress || !balancerPoolId) {
      toast.error("Please provide Pool address and Pool Id");
      return false;
    }
    router.push(`/pool-details/${poolAddress}/${balancerPoolId}`);
  };

  return (
    <Card sx={{ maxWidth: 445, margin: "0 auto", marginTop: theme.spacing(4) }}>
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
        <Button variant="contained" onClick={handlePoolCheckerClick}>
          Load Pool
        </Button>
      </CardContent>
    </Card>
  );
}
