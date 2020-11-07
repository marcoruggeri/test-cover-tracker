import "./App.css";
import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import {
  abiProtocol,
  abiCovToken,
  abiCover,
  abiProtocolFactory,
} from "./abi.js";
import { gql } from "apollo-boost";
import { useQuery } from "react-apollo";

import BalancerData from "./components/BalancerData";
import Supply from "./components/Supply";

const balancerQuery = gql`
  {
    poolTokens(where: { name_contains: "covToken" }) {
      id
      poolId {
        id
        controller
        liquidity
        totalSwapVolume
        totalSwapFee
        totalShares
        tokensList
        totalWeight
        tokens {
          address
          balance
          symbol
          name
          id
          denormWeight
        }
      }
      symbol
      name
    }
    tokenPrices(where: { id: "0x6b175474e89094c44da98b954eedeac495271d0f" }) {
      price
      symbol
      name
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(balancerQuery);
  console.log(loading, error);
  const provider = useMemo(
    () =>
      new ethers.providers.InfuraProvider(
        "homestead",
        process.env.REACT_APP_INFURA
      ),
    []
  );
  const protocolFactory = useMemo(
    () =>
      new ethers.Contract(
        "0x45D619A4804B82c3af4c24Ccb460068a8A0D8D6a",
        abiProtocolFactory,
        provider
      ),
    [provider]
  );

  const [protocols, setProtocols] = useState([]);
  const [protocolsInfo, setProtocolsInfo] = useState([]);
  const [covers, setCovers] = useState([]);
  const [covTokens, setCovTokens] = useState([]);

  useEffect(() => {
    protocolFactory.getAllProtocolAddresses().then((r) => {
      r.forEach((protocol) => {
        setProtocols((p) => [
          ...p,
          new ethers.Contract(protocol, abiProtocol, provider),
        ]);
      });
    });
  }, [protocolFactory, provider]);
  useEffect(() => {
    protocols.forEach((protocol) => {
      protocol
        .getProtocolDetails()
        .then((r) => setProtocolsInfo((p) => [...p, [r]]));
    });
  }, [protocols]);
  useEffect(() => {
    protocolsInfo.forEach((protocolInfo) => {
      new ethers.Contract(
        protocolInfo[0]._allActiveCovers[0],
        abiCover,
        provider
      )
        .getCoverDetails()
        .then((r) => setCovers((p) => [...p, [r]]));
    });
  }, [protocolsInfo, provider]);
  useEffect(() => {
    const fetchSupply = async () => {
      for (let i = 0; i < covers.length; i++) {
        let token = {
          name: covers[i][0]._name,
        };
        let claimToken = new ethers.Contract(
          covers[i][0]._claimCovToken,
          abiCovToken,
          provider
        );
        let noclaimToken = new ethers.Contract(
          covers[i][0]._noclaimCovToken,
          abiCovToken,
          provider
        );
        let claimTotalSupply = await claimToken.totalSupply();
        let noclaimTotalSupply = await noclaimToken.totalSupply();
        token.claimSupply = ethers.utils.formatUnits(claimTotalSupply);
        token.noclaimSupply = ethers.utils.formatUnits(noclaimTotalSupply);
        setCovTokens((p) => [...p, token]);
      }
    };
    fetchSupply();
  }, [covers, provider]);
  return (
    <div className="App">
      <h1>Cover Tracker</h1>
      <p>Available Protocols:</p>
      {protocolsInfo.map((protocol, i) => (
        <div key={protocol[0]._name}>
          <h2>{ethers.utils.parseBytes32String(protocol[0]._name)}</h2>
          <p>Available Covers:</p>
          {covers.map((cover) => (
            <div key={cover[0]._name}>
              <h4>Name: </h4>
              <p>{cover[0]._name}</p>
              <h4>Expiration date:</h4>
              <p>
                {new Date(cover[0]._expirationTimestamp * 1000).toUTCString()}
              </p>
              <Supply
                name={covTokens[i]?.name}
                claimSupply={covTokens[i]?.claimSupply}
                noclaimSupply={covTokens[i]?.noclaimSupply}
              />
            </div>
          ))}
          <h4>Prices:</h4>
          <BalancerData data={data} />
        </div>
      ))}
    </div>
  );
}

export default App;
