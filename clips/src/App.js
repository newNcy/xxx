import logo from "./clips-logo.svg";
import "./App.css";
import {useState, useEffect} from 'react';
import abi from './abi.json'


import "@rainbow-me/rainbowkit/styles.css";
import {
    getDefaultWallets,
    RainbowKitProvider,
    midnightTheme,
    darkTheme,
} from "@rainbow-me/rainbowkit";

import { configureChains, createClient, WagmiConfig , useSigner, useProvider} from "wagmi";
import { mainnet, polygon, optimism, arbitrum ,goerli, sepolia} from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {Contract, utils} from "ethers";

const { chains, provider } = configureChains([arbitrum], [publicProvider()]);

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

let contractAddr = '0xB9D2AecDbF874cC29Bb5C8785dA188eB704222B8'


function Main() {
    let [clipsBalance, setClipsBalance] = useState(0)
    let [prizePool, setPrizePool] = useState(0)
    let [clipOwner, setClipOwner] = useState('')
    let [clip, setClip] = useState('')
    let [clipLink, setClipLink] = useState('')
    let [timeLeft, setTimeLeft] = useState(0)
    let [canMint, setCanMint] = useState(true)
    let [mintAmout, setMintAmount] = useState(0)

    let {data} = useSigner()
    let provider = useProvider()
    let signer = data
    let clips = new Contract(contractAddr, abi, signer) 
    let clipsPub = new Contract(contractAddr, abi, provider)
    function formatTime(seconds) {
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const remainingSeconds = String(Math.floor(seconds % 60)).padStart(2, '0');
        return `${hours}:${minutes}:${remainingSeconds}`;
    }

    async function mint() {
        let liq = await clips.liquidity()
        await clips.mintClips({value : liq})
    }

    useEffect(() => {
        let interval = setInterval(async ()=>{
            setPrizePool(utils.formatEther(await clipsPub.prizePool()))
            setClip(await clipsPub.clip())
            setClipLink(await clipsPub.clipLink())
            setClipOwner(await clipsPub.clipOwner())
            setMintAmount(utils.formatEther(await clipsPub.initialMintAmount())) 
            let last = Number(await clipsPub.lastClipUpdate())
            if (last > 0) {
                let now = Math.floor(Date.now() / 1000)
                setTimeLeft(last+ 7*24*60*60 - now)
            }

            if (!signer) {
                return
            }
            let address = await signer.getAddress()
            let balance = await clips.balanceOf(address)
            setClipsBalance(utils.formatEther(balance))
            
        }, 1000)
        return () => clearInterval(interval);
    })
    return (
        <div className="App">
        <nav className="w-full flex fixed top-0 left-0 px-8 py-4 justify-between items-center space-x-6">
            <div>
                <img width="32" height="32" src={logo}/> 
            </div>
            <div className="items-center space-x-8 hidden md:flex">
                <div> {clipsBalance} $clips</div>
                <ConnectButton label="connect" />
            </div>
        </nav>
        <div className="min-h-screen flex justify-center items-center pt-16 md:pt-0">
            <div className="h-min flex flex-col">
                <p className="text-lg md:text-2xl text-white font-black text-center"> prizepool: {prizePool} $clips</p>
                <p className="text-white font-black text-center text-lg md:text-2xl"> CLIP OWNER 👇: {clipOwner}</p>
                <a className="" href={clipLink}>

                    <h2 className="Clip text-transparent bg-gradient-to-r from-[#00ffa0] via-[#69b6ff] to-[#cd14ff] bg-clip-text font-black text-6xl md:text-6xl lg:text-9xl text-center my-12 uppercase break-words max-w-[90vw] md:max-w-[90vw]">
                        {clip}
                    </h2>
                </a>
                <div className="text-white text-center text-6xl font-black mb-4">
                    <p className="text-center mb-2 ">OWNER CAN CLAIM PRIZEPOOL IN:</p>
                    {formatTime(timeLeft)}
                </div>
                <button onClick={mint} className="btn-gradient mt-4 self-center w-full md:w-auto " disabled={!canMint}>Mint {mintAmout} $clips</button>
            </div>
        </div>
        </div>
    )
}



function App() { 
    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains} theme={ darkTheme({ accentColor: '#5b3fe4', accentColorForeground: 'white', fontStack: 'system', overlayBlur: 'small', })}>
                    <Main/>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}

export default App;
