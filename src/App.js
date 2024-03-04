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

function App() {
  const [tokenDetails, setTokenDetails] = useState(null);
  const [contract, setContract] = useState(null);
  const [wallet, setWallet] = useState({ accounts: [] });
  const [boopsBalance, setBoopsBalance] = useState('0');

  const connectContract = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract("0xCB2aB1E44daDC889a91184527beC6820Bc2BF210", BOOPSToken.abi, signer);
      setContract(contract);

      const symbol = await contract.symbol();
      const totalSupply = await contract.totalSupply();
      const formattedTotalSupply = ethers.utils.formatUnits(totalSupply, 'ether');
      setTokenDetails({ symbol, totalSupply: formattedTotalSupply });
    } else {
      console.error('Please install MetaMask!');
    }
  }, []); // The empty array ensures that the function is only created once


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
      window.ethereum?.removeListener('accountsChanged', (accounts) => {
        setWallet({ accounts: [] });
      });
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



