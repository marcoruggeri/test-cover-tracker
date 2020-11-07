const Supply = ({ name, claimSupply, noclaimSupply }) => {
  return (
    <>
      <h4>Claim Supply:</h4>
      <p>{Number.parseFloat(claimSupply).toFixed(4)}</p>
      <h4>NoClaim Supply:</h4>
      <p>{Number.parseFloat(noclaimSupply).toFixed(4)}</p>
    </>
  );
};

export default Supply;
