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
    let adjustedPoolData = {
      ...poolData,
      poolReserves: poolData.poolReserves.map(res => parseInt(res.toString())),
      timeForReplenishment: 60 * 60 * 24,
    }
    const extraSettingsFixed = {
      customA: poolData?.poolExtraSettings?.customA ? parseInt(poolData?.poolExtraSettings.customA.toString()) : undefined,
      customFees: poolData?.poolExtraSettings?.customFees ? parseInt(poolData?.poolExtraSettings.customFees.toString()): undefined,
      customRates: poolData?.poolExtraSettings?.customRates ? poolData?.poolExtraSettings.customRates.map(rate => parseInt(rate.toString())): undefined
    }
    adjustedPoolData = {...adjustedPoolData, poolExtraSettings: {...adjustedPoolData?.poolExtraSettings, ...extraSettingsFixed}}


    const getAmountOut = makeAmountOutFunction(
      adjustedPoolData.poolType,
      adjustedPoolData.poolReserves,
      adjustedPoolData.isStable
      // TODO: Add back exra
    );

    const getAmoutOutGivenReserves = makeAmountOutGivenReservesFunction(
      adjustedPoolData.poolType,
      adjustedPoolData.isStable
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
      adjustedPoolData.poolReserves,
      getAmoutOutGivenReserves
    );

    // SOMETHING IS OFF HERE
    const discreteTimeForFullLiquidation = getPoolDiscreteRepetitionsUntilFullLiquidatedAmount(
      (spotPrice * MAX_BPS) / (MAX_BPS - liquidationPremium),
      amountToDump,
      adjustedPoolData.poolReserves,
      getAmoutOutGivenReserves,
      adjustedPoolData.timeForReplenishment
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
