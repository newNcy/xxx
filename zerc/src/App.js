import logo from './logo.svg';
import {useState, useEffect} from 'react'; 
import './App.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faTelegram , faDiscord } from '@fortawesome/free-brands-svg-icons';
import "@rainbow-me/rainbowkit/styles.css";
import {
    getDefaultWallets,
    RainbowKitProvider,
    midnightTheme,
    lightTheme,
    darkTheme,
} from "@rainbow-me/rainbowkit";

import { configureChains, createClient, WagmiConfig , useSigner, useProvider} from "wagmi";
import { goerli, zkSync, zkSyncTestnet} from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import {abi} from './factor.json';

const { chains, provider } = configureChains([zkSync, zkSyncTestnet], [publicProvider()]);

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


let testfactor = '0x016370e1476884446af07d5D70E00D24df4Cf021'

function Modal ({show, children, onClose}) {
    return (
        <div>
            { show && 
                    <div className="shadow relative z-10 bg-main-2 text-gray-300" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div onClick= {e=> {
                        if (onClose) {
                            onClose()
                        }
            }
                    } className="fixed inset-0 bg-main bg-opacity-75 transition-opacity"></div>
                    <div onClick= {e=> {
                        if (onClose) {
                            onClose()
                        }
            }
                    } className="fixed inset-0 z-10 flex flex-col justify-center items-center overflow-y-auto">
                        <div className="w-fit bg-main2 p-4 rounded-lg" onClick={e=>e.stopPropagation()}>
                    {children}
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
    for (let i = 0; i < 100; ++ i) {
        data.push(data[0])
    }


    let [showDeploy, setShowDeploy] = useState(false)
    let [showMint, setShowMint] = useState(false)
    let [tick, setTick] = useState('')
    let [name, setName] = useState('')
    let [hc, setHc] = useState(0)
    let [lpm, setLpm] = useState(0)

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
                <div className="flex flex-row justify-center items-center">
                    <a className="cursor-pointer" href="https://twitter.com/zerc20cash">
                    <FontAwesomeIcon className = "ml-2" icon={faTwitter} size="lg" />
                    </a>
                    <ZERC20ConnectButton/>
                </div>
            </div> 

            <div className=" z-0 russo w-full max-h-screen overflow-y-wrap p-12 shadow-inner my-12 flex flex-col items-center justify-start p-6 gap-2"> 
                <div className="w-full max-w-md flex flex-col justify-center items-center">
                    <h1 className="text-5xl mb-2">
                        zealous ERC20
                    </h1>
                    <p>
                        We've implemented ordinals BRC-20 in Ethereum(EVM) smart contract to make fairlaunch better. Free mint your favourite 4 characters zERC-20 tokens and have fun.
                    </p>
                    <div className="flex flex-row">
                        <div onClick={e=>setShowDeploy(true)} className="btn btn-left w-24 text-gray-700 rounded-l-lg">
                            DEPLOY
                        </div>
                        <div onClick={e=>setShowMint(true)} className="btn w-24  btn-right rounded-r-lg">
                            MINT
                        </div>
                    </div>
                </div>

                <div className=" w-full max-h-screen mb-6 flex flex-col justify-start mt-6 p-2 items-center text-gray-300">
                    <div className="flex max-h-screen flex-col gap-2 bg-main2 rounded-lg p-5">

                        <input placeholder="search by tick" className="input"/>
                        <table className="gap-3 table-auto max-h-screen overflow-y-auto">
                            <thead className="whitespace-nowrap">
                                <tr data-v-7bcbcade="">
                                <th data-v-7bcbcade="" className="w-fit px-2" class="center">#</th>
                                <th data-v-7bcbcade="" className="w-fit px-2">Tick</th>
                                <th data-v-7bcbcade="" className="px-2">Contract</th>
                                <th data-v-7bcbcade="" className="px-2">Deploy Time</th>
                                <th data-v-7bcbcade="">HC/LPM 
                                </th>
                                <th data-v-7bcbcade="" className="center px-2">Rollup Size</th>
                                <th data-v-7bcbcade="" className="center px-2">Frozen Time</th>
                                <th data-v-7bcbcade="">Condition</th>
                                <th data-v-7bcbcade="" className="center px-2">Funding Rate</th>
                                <th data-v-7bcbcade="" className="center px-2">Progress</th>
                                <th data-v-7bcbcade="" className="center px-2"></th>
                                </tr>
                            </thead>
                            <tbody className=" max-h-screen overflow-y-auto  ">
                                {
                                    data.map(r=>
                                        <tr className="text-left w-fit inter text-sm ">
                                            {
                                                r.map((d,i)=>
                                                <td className={"px-6 text-left w-fit" + ' ' + (i==1? 'text-primary russo' : '') + ' ' + (i == r.length- 1? 'py-1':'')}>
                                                        {
                                                            i == r.length -1 ? 
                                                            <div className="w-fit h-fit py-1 btn-normal2">
                                                            {d}
                                                            </div>
                                                            :
                                                            d
                                                        }
                                                    </td>
                                                )
                                            }
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
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
            <Modal show={showDeploy} onClose={e=>setShowDeploy(false)}>
                <div className="flex flex-col justify-center items-center gap-4" style={{width:540}}>
                    <div className="russo text-2xl">deploy</div>
                    <div className="flex flex-col justify-center whitespace-o-wrap items-center inter text-sm w-full gap-1 ">
                        <div className="russo flex flex-row justify-center gap-2 text-left w-full items-center">
                            <div className="label">Tick</div>
                            <input type="text" className="input w-full" placeholder="4 characters like 'zerc' ..."/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Name</div>
                            <input type="text" className="input w-full" placeholder="Name of Token"/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Hard Cap</div>
                            <input type="number" className="input w-full" placeholder="0"/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Limit Per Mint</div>
                            <input type="number" className="input w-full" placeholder="0"/>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center whitespace-no-wrap items-center inter text-sm w-full gap-1 ">
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Rollup Size</div>
                            <input type="number" className="input w-full" value="1"/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Frozen Period</div>
                            <input type="number" className="input w-full" value="60"/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">ERC20/NFT</div>
                            <input type="text" className="input w-full" placeholder="0x0000000000000000000000000000000000000000"/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Min Amount</div>
                            <input type="number" className="input w-full" value="0"/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Funding Rate Per Mint</div>
                            <input type="number" className="input w-full" value="0"/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Funding Address</div>
                            <input type="text" className="input w-full" placeholder="0x0000000000000000000000000000000000000000"/>
                        </div>
                    </div>

                    <div className="btn-normal">
                        Deploy 
                    </div>
                    <p className="w-full text-center text-gray-400 text-sm">
                        To prevent Sybil attacks, a deployment fee of 0.01 <br/>ETH will be charged.
                    </p>
                </div>
            </Modal>
            <Modal show={showMint} onClose={e=>setShowMint(false)}>
                mint
            </Modal>
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

