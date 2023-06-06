import {
  getPrice,
  maxInBeforePriceLimit,
  getPoolReserveMultiplierToAllowPriceImpactBelow,
  getPoolDiscreteRepetitionsUntilFullLiquidatedAmount,
} from "ts-amm-pool-math/optimizer";
import {
  makeAmountOutFunction,
  makeAmountOutGivenReservesFunction,
} from "ts-amm-pool-math/make";

export interface PoolData {
  poolType: string;
  isStable: boolean;
  poolReserves: number[];
  poolExtraSettings?: ExtraSettings;
  timeForReplenishment: number;
}

interface ExtraSettings {
  customA?: number;
  customFees?: number;
  customRates?: number[];
  customDecimals?: number[];
}

export interface LiquidationData {
  sellUpTo: 0;
  liquidityMultiple: 1;
  timeToFullLiquidation: 0;
  error?: string;
}

const MAX_BPS = 10_000;

export default function computeLiquidationData(
  amountToDump: number,
  liquidationPremium: number,
  decimals: number,
  poolData: PoolData
): LiquidationData {
  try {
    /**
     * 
export interface PoolData {
  poolType: string;
  isStable: boolean;
  poolReserves: number[];
  poolExtraSettings?: ExtraSettings;
  timeForReplenishment: number;
}

interface ExtraSettings {
  customA?: number;
  customFees?: number;
  customRates?: number[];
  customDecimals?: number[];
}
     */


    const getAmountOut = makeAmountOutFunction(
      poolData.poolType,
      poolData.poolReserves,
      poolData.isStable
      // TODO: Add back exra
    );

    const getAmoutOutGivenReserves = makeAmountOutGivenReservesFunction(
      poolData.poolType,
      poolData.isStable
    );
    
    console.log("spotAmountOut")
    const spotAmountOut = getAmountOut(10 ** decimals);
    console.log("spotAmountOut", spotAmountOut)
    const spotPrice = getPrice(10 ** decimals, spotAmountOut);
    console.log("spotPrice", spotPrice)

    if (spotPrice === Infinity) {
      throw Error("Spot is infinity, increase reserves");
    }

    const amountBeforePriceLimit = maxInBeforePriceLimit(
      (spotPrice * MAX_BPS) / (MAX_BPS - liquidationPremium),
      getAmountOut
    );

    console.log("(spotPrice * MAX_BPS) / (MAX_BPS - liquidationPremium)", (spotPrice * MAX_BPS) / (MAX_BPS - liquidationPremium));
    console.log("amountBeforePriceLimit", amountBeforePriceLimit);

    const poolReserveMultiplierForLiquidation = getPoolReserveMultiplierToAllowPriceImpactBelow(
      (spotPrice * MAX_BPS) / (MAX_BPS - liquidationPremium),
      amountToDump,
      poolData.poolReserves,
      getAmoutOutGivenReserves
    );

    // SOMETHING IS OFF HERE
    const discreteTimeForFullLiquidation = getPoolDiscreteRepetitionsUntilFullLiquidatedAmount(
      (spotPrice * MAX_BPS) / (MAX_BPS - liquidationPremium),
      amountToDump,
      poolData.poolReserves,
      getAmoutOutGivenReserves,
      poolData.timeForReplenishment
    );
    console.log("discreteTimeForFullLiquidation", discreteTimeForFullLiquidation);

    return {
      sellUpTo: amountBeforePriceLimit,
      liquidityMultiple: poolReserveMultiplierForLiquidation,
      timeToFullLiquidation: discreteTimeForFullLiquidation,
    };
  } catch (err) {
    console.log("computeLiquidationData, Exception", err);
    return {
      sellUpTo: 0,
      liquidityMultiple: 1,
      timeToFullLiquidation: 0,
      // @ts-ignore // It's an exception why so picky?
      error: err.toString(),
    };
  }
}
