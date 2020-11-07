import { useState, useEffect } from "react";

const BalancerData = ({ data }) => {
  const [priceClaim, setPriceClaim] = useState();
  const [priceNoClaim, setPriceNoClaim] = useState();
  const liquidityClaim = data ? data.poolTokens[0].poolId.liquidity : undefined;
  const totalWeightClaim = data
    ? data.poolTokens[0].poolId.totalWeight
    : undefined;
  const collateralDataClaim = data
    ? data.poolTokens[0].poolId.tokens[1].balance
    : undefined;
  const covTokenDataClaim = data
    ? data.poolTokens[0].poolId.tokens[0].balance
    : undefined;
  const liquidityNoClaim = data
    ? data.poolTokens[1].poolId.liquidity
    : undefined;
  const totalWeightNoClaim = data
    ? data.poolTokens[1].poolId.totalWeight
    : undefined;
  const collateralDataNoClaim = data
    ? data.poolTokens[1].poolId.tokens[0].balance
    : undefined;
  const covTokenDataNoClaim = data
    ? data.poolTokens[1].poolId.tokens[1].balance
    : undefined;
  const daiPrice = data ? data.tokenPrices[0].price : undefined;
  const calculatePrice = (
    totalLiquidity,
    totalWeight,
    collateralData,
    covTokenData,
    daiPrice
  ) => {
    return Math.max(
      ((totalLiquidity -
        (collateralData * collateralData * daiPrice) / totalWeight) /
        ((covTokenData / totalWeight) * covTokenData)) *
        100,
      0
    );
  };
  useEffect(() => {
    let priceClaim = calculatePrice(
      liquidityClaim,
      totalWeightClaim,
      collateralDataClaim,
      covTokenDataClaim,
      daiPrice
    );
    let priceNoClaim = calculatePrice(
      liquidityNoClaim,
      totalWeightNoClaim,
      collateralDataNoClaim,
      covTokenDataNoClaim,
      daiPrice
    );
    setPriceClaim(priceClaim);
    setPriceNoClaim(priceNoClaim);
  }, [
    liquidityClaim,
    totalWeightClaim,
    collateralDataClaim,
    covTokenDataClaim,
    daiPrice,
    liquidityNoClaim,
    totalWeightNoClaim,
    collateralDataNoClaim,
    covTokenDataNoClaim,
  ]);
  return (
    <>
      <p>CLAIM: ${Number.parseFloat(priceClaim).toFixed(4)}</p>
      <p>NOCLAIM: ${Number.parseFloat(priceNoClaim).toFixed(4)}</p>
    </>
  );
};

export default BalancerData;
