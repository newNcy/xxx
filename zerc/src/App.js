import logo from './logo.svg';
import { useState, useEffect } from 'react';
import classNames from 'classnames';
import './App.css';
import { toast , ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faTelegram, faDiscord} from '@fortawesome/free-brands-svg-icons';
import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultWallets,
    RainbowKitProvider,
    midnightTheme,
    lightTheme,
    darkTheme,
} from '@rainbow-me/rainbowkit';

import { configureChains, createClient, WagmiConfig, useSigner, useProvider } from "wagmi";
import { goerli, zkSync, zkSyncTestnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {Contract, utils} from "ethers";

let {abi} = require('./factor.json');
let {abi:abi2} = require('./Inscription.json');

const { chains, provider } = configureChains(
    [zkSync],
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

let pdfactory = '0x7aB8d7cD471dec3771CAeA9005BB23845a07637C'
let testfactor = '0x016370e1476884446af07d5D70E00D24df4Cf021';
testfactor = pdfactory

console.log(`
=============================================================
  Snapshots will be taken on June 8th, so keep it a secret! 
=============================================================
`)
function Modal({ show, children, onClose }) {
    return (
        <div>
            {show && (
                <div
                    className="shadow relative z-10 bg-main-2 text-gray-300"
                    aria-labelledby="modal-title"
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        onClick={e => {
                            if (onClose) {
                                onClose();
                            }
                        }}
                        className="fixed inset-0 bg-main bg-opacity-75 transition-opacity"
                    ></div>
                    <div
                        onClick={e => {
                            if (onClose) {
                                onClose();
                            }
                        }}
                        className="fixed inset-0 z-10 flex flex-col justify-center items-center overflow-y-auto"
                    >
                        <div
                            className="w-fit bg-main2 p-4 rounded-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
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
                    (!authenticationStatus || authenticationStatus === 'authenticated');
                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        type="button"
                                        className="btn-normal2"
                                    >
                                        Connect Wallet
                                    </button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        type="button"
                                        className="btn-normal2"
                                    >
                                        Wrong network
                                    </button>
                                );
                            }
                            return (
                                <div className="flex flex-col md:flex-row gap-1">
                                    <button
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        type="button"
                                        className="btn rounded-md text-small"
                                    >
                                        {chain.name}
                                    </button>
                                    <button
                                        onClick={openAccountModal}
                                        type="button"
                                        className="btn-normal2 rounded-md text-small"
                                    >
                                        {account.displayName.substring(0, 4)}
                                        {account.displayBalance
                                            ? ` ${Number(account.balanceFormatted).toFixed(
                                                2
                                            )} ${account.balanceSymbol.substring(0, 1)}`
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
        '#',
        'Tic',
        'Contract',
        ' Deploy Time',
        'HC/LPM',
        'Rollup Size',
        'Frozen Time',
        'Condition',
        'Funding Rate',
        'Progress',
        '',
    ];


    let [showDeploy, setShowDeploy] = useState(false)
    let [showMint, setShowMint] = useState(false)
    let [tick, setTick] = useState('')
    let [name, setName] = useState('')
    let [hc, setHc] = useState(0)
    let [lpm, setLpm] = useState(0)
    let [rollupSize, setRollupSize] = useState(1)
    let [frozen, setFrozen] = useState(60)
    let [erc20, setErc20] = useState('0x0000000000000000000000000000000000000000')
    let [minAmount, setMinAmount] = useState(0)
    let [fundRate, setFundingRate] = useState(0)
    let [fundAddress, setFundingAddress] = useState('0x0000000000000000000000000000000000000000')
    let [data, setData] = useState([])
    let [onlyProgress, setOnlyProgress] = useState(false)
    let [toMint, setToMint] = useState(null)

    
    let provider = useProvider()
    let {data:signer} = useSigner()
    let signableContract = new Contract(testfactor, abi, signer)
    let providerContract = new Contract(testfactor, abi, provider)

    async function getLogs() {
        let amount = await providerContract.getInscriptionAmount()
        let [ins, sps] = await providerContract.getIncriptions(1, amount, 0, '')
        let newData = []
        for (let i = 0; i< ins.length; i ++) {
            let item = {... ins[i], sp : sps[i]}
            if (!item.inscriptionId.eq(0)) {
                newData.push(item)
            }
        }
        setData(newData)
        }

    useEffect(()=> {
            getLogs()
        setTimeout(async ()=> {
        }, 1000)
    }, [])

    let onDeploy = async () => {
        async function deploy() {
            let fee = await signableContract.inscriptionFee()
            let res = await signableContract.deploy(tick, name, utils.parseEther(hc.toString()), utils.parseEther(lpm.toString()), rollupSize, frozen, erc20, minAmount, utils.parseEther(fundRate == 0 ? '.000000000001': fundRate.toString()), fundAddress, {
                value : fee
            });
            await res.wait()
            toast.success('deploy success')
            getLogs() 
            setShowDeploy(false)
        }

        await toast.promise(
            deploy(),
            {
                pending: 'Deploy ...',
                success: 'deploy Success!👌',
                error: {
                    render({data}) {
                        return data.reason
                    }
                }
            }
        )

    }

    function factor(p, t) {
        let start = 2
        let end = 1
        return p * ((end-start)/t) + start
    }

    let preMint = async () => {
        async function mint() { 
            let [id] = await providerContract.getIncriptionByTick(toMint)
            let ins = new Contract(id.addr, abi2, signer) 
            let [_,fee] = await ins.getMintFee(await signer.getAddress())
            let res = await ins.mint(await signer.getAddress(),{
                value: fee.add(id.crowdFundingRate)
            })

            await res.wait()

            setShowMint(false)
        }
        await toast.promise(
            mint(),
            {
                pending: 'Minting',
                success: 'Mint Success!👌',
                error: {
                    render({data}) {
                        return data.reason
                    }
                }
            }
        )
    }

    return (
        <div className="flex flex-col w-full h-full h-screen text-gray-200 bg-main cursor-default ">

            <div className="shadow w-full items-center  flex russo flex-row top-0 p-4 px-12 justify-between bg-main2 ">
                <div className="text-3xl flex flex-row justify-center items-bottom">
                    <span className="text-primary">zealous</span>
                    &nbsp;&nbsp;
                    <span className="text-4xl">ERC20</span>
                </div>
                <div className="flex flex-row justify-center items-center">
                    <a className="cursor-pointer" href="https://twitter.com/zerc20cash">
                        <FontAwesomeIcon className="mx-2" icon={faTwitter} size="lg" />
                    </a>
                    <ZERC20ConnectButton />
                </div>
            </div>

            <div className="h-0 flex-1 flex flex-col z-0 russo w-full  overflow-y-wrap p-12 shadow-inner my-12 flex flex-col items-center  p-6 ">
                <div className="w-full max-w-md flex flex-col justify-center items-center">
                    <h1 className="text-5xl mb-2">zealous ERC20</h1>
                    <p>
                        We've implemented ordinals BRC-20 in Ethereum(EVM) smart contract to
                        make fairlaunch better. Free mint your favourite 4 characters
                        zERC-20 tokens and have fun.
                    </p>
                    <div className="flex flex-row">
                        <div
                            onClick={async e => {
                                let addr = await signer.getAddress()
                                setTimeout(() =>{
                                    setFundingAddress(addr)
                                },10)
                                setShowDeploy(true)
                            }}
                            className="btn btn-left w-24 text-gray-700 rounded-l-lg"
                        >
                            DEPLOY
                        </div>
                        <div
                            onClick={async e => {
                                setShowMint(true)
                            }}
                            className="btn w-24  btn-right rounded-r-lg"
                        >
                            MINT
                        </div>
                    </div>
                </div>

                <div className="h-0 flex-1 w-full  mb-6 flex flex-col justify-start mt-6 p-2 items-center text-gray-300">
                    <div className="flex  flex-col gap-2 bg-main2 rounded-lg p-5 max-h-full max-w-full">
                        <div className="filter flex justify-between" >

                            <input placeholder="search by tick" className="input" />

                            <div className="right">
                                <div className="tabMenu bg-main">
                                    <div className={`item  ${onlyProgress ? '': 'active'}`} onClick = {e=>{
                                        if (onlyProgress) {
                                            setOnlyProgress(false)
                                        }
                                    }}>
                                        All
                                    </div>
                                    <div className={`item ${onlyProgress ? 'active': ''}`} onClick={ e=> {{
                                        if (!onlyProgress) {
                                            setOnlyProgress(true)
                                        }
                                    }}}>In-progress</div>
                                </div>
                            </div>
                        </div>
                        <div className="table-wrap h-0 flex-1 overflow-auto relative">
                            <table className="gap-3 ">
                                <thead className="whitespace-nowrap  ">
                                    <tr data-v-7bcbcade="">
                                        <th
                                            data-v-7bcbcade=""
                                            className="w-fit px-2 center"
                                        >
                                            #
                                        </th>
                                        <th data-v-7bcbcade="" className="w-fit px-4">
                                            Tick
                                        </th>
                                        <th data-v-7bcbcade="" className="px-4">
                                            Contract
                                        </th>
                                        <th data-v-7bcbcade="" className="px-4">
                                            Deploy Time
                                        </th>
                                        <th data-v-7bcbcade="">HC/LPM</th>
                                        <th data-v-7bcbcade="" className="center px-4">
                                            Rollup Size
                                        </th>
                                        <th data-v-7bcbcade="" className="center px-4">
                                            Frozen Time
                                        </th>
                                        <th data-v-7bcbcade="">Condition</th>
                                        <th data-v-7bcbcade="" className="center px-4">
                                            Funding Rate
                                        </th>
                                        <th data-v-7bcbcade="" className="center px-4">
                                            Progress
                                        </th>
                                        <th data-v-7bcbcade="" className="center px-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="  overflow-y-auto  ">
                                    {data.map(r => (
                                        <tr id={r.inscriptionId} key={r.inscriptionId} className="text-left w-fit inter text-sm ">
                                            <td key="id">
                                                {r.inscriptionId.toString()}
                                            </td>
                                            <td key="tick">
                                                <div className="flex flex-col text-center justify-center item-center">
                                                    <span className="russo text-md text-primary">{r.tick}</span>
                                                    <span className="text-sm text-gray-400">{r.name.toString()}</span>
                                                </div>
                                            </td>
                                            <td className="" key="addr">
                                                {r.addr.toString().substring(0, 6) + '...' + r.addr.substring(r.addr.length-4, r.addr.length)}
                                            </td>
                                            <td className="" key="time">
                                                {new Date(Number(r.timestamp.toString()) * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '')}
                                            </td>
                                            <td className="" key="lpm">
                                                {utils.formatEther(r.cap)+'/'+ utils.formatEther(r.limitPerMint)}
                                            </td>
                                            <td className="" key="max">
                                                {r.maxMintSize.toNumber()}
                                            </td>
                                            <td className="" key="freez">
                                                {r.freezeTime.toString()}s
                                            </td>
                                            <td className="" key="only">
                                                {
                                                    r.onlyMinQuantity == '0'? 'Free' : r.onlyContractAddress + '*'+ r.onlyMinQuantity
                                                }
                                            </td>
                                            <td className="" key="fr">
                                                {utils.formatEther(r.crowdFundingRate)} 
                                            </td>
                                            <td className="" key="p">
                                                <div className="flex flex-col  text-center justify-center ">
                                                    <p>{`${utils.formatEther(r.sp)}/${utils.formatEther(r.cap)}`}</p>
                                                    <div className='progressBar w-full'>
                                                        <div className='progressBarInner' style={{ width: `${(r.sp/r.cap)*factor(r.sp, r.cap)*100}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="">
                                                <div className="btn-normal2" onClick={e=> {
                                                    setToMint(r.tick)
                                                    setShowMint(true)
                                                }}>
                                                    mint
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="shadow-inner z-10 w-full  bottom-0 px-12 flex flex-row justify-between items-center p-4 bg-main2 russo">
                <div className="text-3xl flex flex-row justify-center items-bottom">
                    <span className="text-primary">zealous</span>
                    &nbsp;&nbsp;
                    <span className="text-4xl">ERC20</span>
                </div>
                {<span className="text-sm">Copyright © 2023 - All right reserved</span>}
            </div>
            <Modal show={showDeploy} onClose={e => setShowDeploy(false)}>
                <div
                    className="flex flex-col justify-center items-center gap-4"
                    style={{ width: 540 }}
                >
                    <div className="russo text-2xl">deploy</div>
                    <div className="flex flex-col justify-center whitespace-o-wrap items-center inter text-sm w-full gap-1 ">
                        <div className="russo flex flex-row justify-center gap-2 text-left w-full items-center">
                            <div className="label">Tick</div>
                            <input type="text" className="input w-full" placeholder="4 characters like 'zerc' ..." value={tick} onChange={e=>setTick(e.target.value)}/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Name</div>
                            <input type="text" className="input w-full" placeholder="Name of Token" onChange={e=>setName(e.target.value)}/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Hard Cap</div>
                            <input type="number" className="input w-full" placeholder="0" onChange={e=>setHc(e.target.value)}/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Limit Per Mint</div>
                            <input type="number" className="input w-full" placeholder="0" onChange={e=>setLpm(e.target.value)}/>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center whitespace-no-wrap items-center inter text-sm w-full gap-1 ">
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Rollup Size</div>
                            <input type="number" className="input w-full" value={rollupSize} onChange={e=>setRollupSize(e.target.value)}/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Frozen Period</div>
                            <input type="number" className="input w-full" value={frozen} onChange={e=>setFrozen(e.target.value)}/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">ERC20/NFT</div>
                            <input type="text" className="input w-full" value={erc20} onChange={e=>setErc20(e.target.value)}/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">ERC20/NFT count</div>
                            <input type="number" className="input w-full" value={minAmount} onChange={e=>setMinAmount(e.target.value)}/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Funding Rate Per Mint</div>
                            <input type="number" className="input w-full" value={fundRate}  onChange={e=>setFundingRate(e.target.value)}/>
                        </div>
                        <div className="russo flex flex-row justify-center  gap-2 text-left w-full items-center">
                            <div className="label">Funding Address</div>
                            <input type="text" className="input w-full" value={fundAddress} onChange={e=>setFundingAddress(e.target.value)}/>
                        </div>
                    </div>

                    <div onClick = { e => 
                            onDeploy() 
                        } className="btn-normal">
                        Deploy
                    </div>
                    <p className="w-full text-center text-gray-400 text-sm">
                        To prevent Sybil attacks, a deployment fee of 0.01 <br />
                        ETH will be charged.
                    </p>
                </div>
            </Modal>
            <Modal show={showMint} onClose={e=>setShowMint(false)}>
                <div className="flex flex-col justify-center items-center gap-4" style={{width:540}}>
                    <div className="russo text-2xl">Mint</div>
                    <div className="flex flex-col justify-center whitespace-o-wrap items-center inter text-sm w-full gap-1 ">
                        <div className="russo flex flex-row justify-center gap-2 text-left w-full items-center">
                            <div className="label">Tick</div>
                            <input type="text" className="input w-full" placeholder="4 characters like 'zerc' ..." value={toMint} onChange={e=>setToMint(e.target.value)}/>
                        </div>
                    </div>

                    <div className="btn-normal2" onClick={e=>preMint()}>
                        Mint
                    </div>
                </div>
            </Modal>
            <ToastContainer/>
        </div >
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
