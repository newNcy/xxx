import logo from './logo.svg';
import {useState, useEffect} from 'react'; 
import './App.css';

import "@rainbow-me/rainbowkit/styles.css";
import {
    getDefaultWallets,
    RainbowKitProvider,
    midnightTheme,
    lightTheme,
    darkTheme,
} from "@rainbow-me/rainbowkit";

import { configureChains, createClient, WagmiConfig , useSigner, useProvider} from "wagmi";
import { goerli, zkSync} from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";


const { chains, provider } = configureChains([zkSync], [publicProvider()]);

const { connectors } = getDefaultWallets({
    appName: "My RainbowKit App",
    projectId: "YOUR_PROJECT_ID",
    chains,
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

function Modal () {
    return (
        <div>
            {false && 
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Deactivate account</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button type="button" className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">Deactivate</button>
                            <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            }
        </div>
    )
}


function ZERC20ConnectButton(props) {
    return (
        <ConnectButton.Custom>
            {({
                account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
            }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');
                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button onClick={openConnectModal} type="button" className="btn-normal2">
                                        Connect Wallet
                                    </button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <button onClick={openChainModal} type="button" className="btn-normal2">
                                        Wrong network
                                    </button>
                                );
                            }
                            return (
                                <div className="flex flex-col md:flex-row gap-1">
                                    <button
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        type="button" className="btn rounded-md text-small"
                                    >
                                        {chain.name}
                                    </button>
                                    <button onClick={openAccountModal} type="button" className="btn-normal2 rounded-md text-small">
                                        {account.displayName.substring(0,4)}
                                        {account.displayBalance
                                            ? ` ${Number(account.balanceFormatted).toFixed(2)} ${account.balanceSymbol.substring(0,1)}`
                                            : ''}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}

function Main() {
    let header = [
        '#','Tic','Contract',' Deploy Time','HC/LPM','Rollup Size','Frozen Time','Condition', 'Funding Rate','Progress', ''
    ]

    let data = [
        [
            '1',
            'merc',
            '0xDE54...3af7',
            '2023.06.2 21:15:15',
            '21,000,000.0/1000',
            '1',
            '20 Min',
            'Free',
            '0.0005 ETH',
            '100%',
            'mint'
        ],
    ]



    return (
        <div className="w-full h-full text-gray-200 bg-main cursor-default pb-20 pt-8">
            <div className="shadow w-full items-center fixed flex russo flex-row top-0 p-4 px-12 justify-between bg-main2 "> 
                <div className="text-3xl flex flex-row justify-center items-bottom">
                    <span className="text-primary">
                        zealous 
                    </span>
                    &nbsp;&nbsp;
                    <span className="text-4xl">
                        ERC20
                    </span>
                </div>
                <div>
                    <ZERC20ConnectButton/>
                </div>
            </div> 

            <div className="z-0 russo w-full h-full p-12 shadow-inner my-12 flex flex-col items-center justify-start p-6 gap-2"> 
                <div className="w-full max-w-md flex flex-col justify-center items-center">
                    <h1 className="text-5xl mb-2">
                        zealous ERC20
                    </h1>
                    <p>
                        We've implemented ordinals BRC-20 in Ethereum(EVM) smart contract to make fairlaunch better. Free mint your favourite 4 characters zERC-20 tokens and have fun.
                    </p>
                    <div className="flex flex-row">
                        <div className="btn btn-left w-24 text-gray-700 rounded-l-lg">
                            DEPLOY
                        </div>
                        <div className="btn w-24  btn-right rounded-r-lg">
                            MINT
                        </div>
                    </div>
                </div>

                <div className=" w-full h-full mb-6 flex flex-col justify-start mt-6 p-2 items-center text-gray-300">
                    <div className="flex flex-col gap-2 bg-main2 rounded-lg p-5">
                        <input placeholder="search by tick" className="rounded-lg outline-none px-3 py-1 bg-gray-600 focus:bg-main transition duration-200 text-gray-200"/>
                        <div className="p-2 grid grid-cols-11  gap-4">
                            {
                                header.map(e=>
                                    <div className="table-header min-w-min max-w-max">
                                        {e}
                                    </div>
                                )
                            }
                            {
                                data.map(e=>
                                    e.map((c, i)=>
                                    <div className={c == 'mint' ? `btn bg-primary2 hover:bg-primary2Dark rounded-lg w-fit h-fit` : `min-w-min max-w-max ${i==1? 'text-primary':''}`}>
                                        {c}
                                    </div>
                                    )

                                )
                            }


                        </div>
                    </div>
                </div>
            </div> 
            <div className="shadow-inner z-10 w-full fixed bottom-0 px-12 flex flex-row justify-between items-center p-4 bg-main2 russo"> 
                <div className="text-3xl flex flex-row justify-center items-bottom">
                    <span className="text-primary">
                        zealous
                    </span>
                    &nbsp;&nbsp;
                    <span className="text-4xl">
                        ERC20
                    </span>
                </div>
                {
                    <span className="text-sm">
                        Copyright © 2023 - All right reserved
                    </span>
                }
            </div>
            <Modal/>
        </div>
    );
}

export default function App() {
    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains} theme={ lightTheme({ accentColor: '#1d41d8', accentColorForeground: 'white', fontStack: 'system', overlayBlur: 'small', })}>
                <Main/>
            </RainbowKitProvider>
        </WagmiConfig>
    )
}

