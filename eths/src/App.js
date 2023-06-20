import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultWallets,
    RainbowKitProvider,
    midnightTheme,
    lightTheme,
    darkTheme,
} from '@rainbow-me/rainbowkit';

import { configureChains, createClient, WagmiConfig, useSigner, useProvider, useAccount,
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import { goerli, mainnet, zkSyncTestnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Contract, utils , BigNumber} from "ethers";


const { chains, provider } = configureChains(
    [mainnet],
    [publicProvider()]
);

const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
    chains,
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});





function Main() {
    let provider = useProvider()
    let signer = useSigner()
    let account = useAccount()
    let [text, setText] = useState('')
    let {config} = usePrepareSendTransaction({request:{
        to: account.address,
        value:utils.parseEther('0'),
        data: text
    }})
    const { data, isLoading, isSuccess, sendTransaction } = useSendTransaction({request:{
        to: account.address,
        value:utils.parseEther('0'),
        data: '0x' + Buffer.from(text).toString('hex')
    }})

    useEffect(()=>{
        let get = async function() {
            console.log(provider)
            let logs = await provider.getLogs({
                fromBlock : 17478950,
                toBlock: 'latest',
                topics: [
                      utils.id("Transfer(address,address,uint256)"),
                ]
            })
            console.log('logs', logs)
        }
    }, [])

    let mint = async() => {
        console.log(sendTransaction)
        sendTransaction()
    }

  return (
    <div className="bg-gray-900 text-white w-full h-screen flex flex-col justify-start">
        <div className="w-full flex flex-row justify-between p-3">
            <div className="text-3xl">
               Ethscriptions 
            </div>
            <ConnectButton/>
        </div>
        <div className="w-full h-full flex flex-col justify-start items-center ">
            <div className="w-full max-w-xl">
                <Tabs>
                    <TabList>
                        <Tab>Mint</Tab>
                        <Tab>My Eths</Tab>
                        <Tab>Buy/Sell</Tab>
                    </TabList>

                    <TabPanel>
                        <div className="flex flex-col justify-start  gap-5  py-5">
                            <div>
                                <div className="input-line">
                                    <span className="w-1/4"> utf-8 text</span>
                                    <input className="w-full" onChange={e=> {
                                        setText(e.target.value)
                                        console.log(e.target.value)
                                        }
                                    }/>
                                </div>
                            </div>
                            <div className="w-full flex flex-row justify-center gap-2">
                                <button className="btn" onClick={e=>{
                                    console.log(text)
                                    mint()
                                }}> mint </button>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <h2>coming soon</h2>
                    </TabPanel>
                    <TabPanel>
                        <h2>coming soon</h2>
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    </div>
  );
}

export default function App() {
    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider
                chains={chains}
                theme={lightTheme({
                    accentColor: '#1d41d8',
                    accentColorForeground: 'white',
                    fontStack: 'system',
                    overlayBlur: 'small',
                })}
            >
                <Main />
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
