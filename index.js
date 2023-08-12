import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSaveClick = () => {
    localStorage.setItem("savedValue", inputValue);
    alert("Value saved successfully!");
  };
  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(inputValue);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(inputValue);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    {
      saveSuccess && <p>Input saved successfully!</p>;
    }

    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <div>
          <button className="bx" onClick={connectAccount}>
            {" "}
            Connect wallet
          </button>
          <style>{`
      .bx{
        background-color: #e7e7e7; color: black;
        border: none;
        color: black;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;} 
      `}</style>
        </div>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <p>
          <input
            type="text"
            id="inputfr"
            placeholder="Enter text"
            value={inputValue}
            onChange={handleInputChange}
          />
        </p>

        <button className="b1" onClick={deposit}>
          Deposit {inputValue} ETH
        </button>
        <button className="b1" onClick={withdraw}>
          Withdraw {inputValue} ETH
        </button>

        <style jsx>{`
      .b1{
        background-color: #e7e7e7; color: black;
        display:inline-block;
        margin:10px;
        border-radius: 20px;
        border: none;
        color: black;
        padding: 15px 32px;
        font-family: 'Calibre'
        text-align: center;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;} 
      
        .b1: hover{
          opacity:0.5;
        }
`}</style>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>ATM METACRAFTERS</h1>
      </header>
      {initUser()}
      <style jsx>
        {`
          .container {
            text-align: center;
            vertical-align: center;
            background-color: coral;
            display: inline-block;
            margin-left: 425px;
          }
        `}
      </style>
    </main>
  );
}
