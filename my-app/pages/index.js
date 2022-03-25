import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect, useRef } from "react"
import Web3Modal from "web3modal";
import { providers, Contract } from 'ethers';
import { abi, WHITELIST_CONTRACT_ADDRESS } from '../constants';

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [numOfWhitelisted, setNumOfWhitelisted] = useState(0);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const web3ModalRef = useRef();

  const getProviderorSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const Web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await Web3Provider.getNetwork();
      if (chainId !== 4) {
        window.alert("Change the network to rinkeby!")
        console.log("change")
      }
      if (needSigner) {
        const signer = Web3Provider.getSigner();
        return signer;
      }
      return Web3Provider;
    } catch (error) {
      console.log(error);
    }
  }

  const checkifAddressIsWhitelisted = async () => {
    try {
      const signer = getProviderorSigner(true);
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);

    } catch (err) {
      console.log(err);
    }
  }

  const addAddressesToWhitelist = async () => {
    try {
      const signer = await getProviderorSigner(true);
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      await tx.wait(1);
      setLoading(false);
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);

    } catch (err) {
      console.log(err);
    }
  }

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>
          Loading...
        </button>
      } else {
        return (
          <button onClick={addAddressesToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        )
      }
    } else {
      <button onClick={connectWallet} className={styles.button}>
        connect ur wallet
      </button>
    }
  }

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderorSigner();
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider);
      const _numOfWhitelisted = await whitelistContract.numAddressWhitelisted();
      setNumOfWhitelisted(_numOfWhitelisted);

    } catch (err) {
      console.log(err);
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderorSigner();
      setWalletConnected(true);
      checkifAddressIsWhitelisted();
      getNumberOfWhitelisted();
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disabledInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected])

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content='Whitelist-Dapp' />
      </Head>
      <div className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Crypto Devs!
        </h1>
        <div className={styles.description}>
          {numOfWhitelisted} have already joined the whitelist.
        </div>
        {renderButton()}
      </div>
      <div>
        <img className={styles.image} src="./crypto-devs.svg" />
      </div>
      <footer className={styles.footer}>
        Made by Dev!
      </footer>
    </div>
  )
}
