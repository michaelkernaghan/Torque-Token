import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import detectEthereumProvider from '@metamask/detect-provider';
import BOOPSToken from './abi/BOOPSToken.json';
import './App.css'; // Import your CSS file here

const ethers = require("ethers");

const ConnectButton = styled.button`
  color: lightgray;
  background-color: transparent;
  border: 5px solid #FFD580;
  border-radius: 10px;
  padding: 5px 55px;
  font-size: 4rem;
  transition: .251s color;
  cursor: pointer;
  &:hover {
    color: gray;
  }
`

const TokenDetailsList = styled.ul`
  list-style-type: none;
  text-align: left;
`

const ContractLink = styled.a`
  color: #FFD580; /* Adjust the color as needed */
  &:hover {
    color: #FFC300;
  }
  margin-top: 20px; /* Adds space between the list and the link */
  display: block; /* Ensures the link is on a new line */
`

function App() {
  const contractAddress = "0xD4d26c5e437173796B3ff41Fc5a75Ab96eB604eA";
  const etherlinkscanUrl = `https://testnet-explorer.etherlink.com/token/${contractAddress}`;

  const [tokenDetails, setTokenDetails] = useState(null);
  const [contract, setContract] = useState(null);
  const [wallet, setWallet] = useState({ accounts: [] });
  const [boopsBalance, setBoopsBalance] = useState('0');

  const connectContract = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, BOOPSToken.abi, signer);
      setContract(contract);

      const symbol = await contract.symbol();
      const totalSupply = await contract.totalSupply();
      const formattedTotalSupply = ethers.utils.formatUnits(totalSupply, 'ether');
      setTokenDetails({ symbol, totalSupply: formattedTotalSupply });
    } else {
      console.error('Please install MetaMask!');
    }
  }, [contractAddress]); // Add contractAddress as a dependency

  const fetchBoopsBalance = useCallback(async (account) => {
    try {
      const balance = await contract.balanceOf(account);
      const formattedBalance = ethers.utils.formatUnits(balance, 'ether');
      setBoopsBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBoopsBalance('0');
    }
  }, [contract]);

  useEffect(() => {
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });
      if (provider) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWallet({ accounts });
          connectContract();
          fetchBoopsBalance(accounts[0]);
        }
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setWallet({ accounts });
            fetchBoopsBalance(accounts[0]);
          } else {
            setWallet({ accounts: [] });
          }
        });
      }
    };

    getProvider();

    return () => {
      window.ethereum?.removeListener('accountsChanged');
    };
  }, [connectContract, fetchBoopsBalance]);

  const handleConnect = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setWallet({ accounts });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Measure the Revolutions</h1>
        {window.ethereum?.isMetaMask && wallet.accounts.length < 1 && (
          <ConnectButton onClick={handleConnect}>Connect</ConnectButton>
        )}
        {wallet.accounts.length > 0 && (
          <div className="Token-info">
            <br />
            <img src="TQ-logo.png" className="Featured-image" alt="Measuring the Revolutions" />
            <TokenDetailsList>
              <li>Total TORQUE Supply: {tokenDetails && tokenDetails.totalSupply}</li>
              <li>Your TORQUE Balance: {boopsBalance}</li>
            </TokenDetailsList>
            <ContractLink href={etherlinkscanUrl} target="_blank" rel="noopener noreferrer">
              View Contract on Etherlinkscan
            </ContractLink>
            Refresh to sync your balance
          </div>
        )}
      </header>
      <br></br>
      <footer className="App-footer">
        <div className="Footer-content">
          <a href="https://test.app.tachyswap.org/#/" target="_blank" rel="noopener noreferrer">Swap and Pool TORQUE</a>
          <a href="https://tokenlists.org/token-list?url=https://raw.githubusercontent.com/michaelkernaghan/ERC-20-Token-Lists/main/tokenlist.json" target="_blank" rel="noopener noreferrer">Use the HAPPY Token List</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
