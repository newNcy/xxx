import logo from './logo.svg';
import './App.css';

import { useEffect ,useState} from 'react';
import { Link } from 'react-scroll';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import aboutImg from './about.png';

import "@rainbow-me/rainbowkit/styles.css";
import {
    getDefaultWallets,
    RainbowKitProvider,
    midnightTheme,
    darkTheme,
} from "@rainbow-me/rainbowkit";

import { configureChains, createConfig, WagmiConfig , useSigner, useProvider} from "wagmi";
import { mainnet, polygon, optimism, arbitrum ,goerli, sepolia} from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {Contract, utils} from "ethers";

const { chains, publicClient, webSocketPublicClient} = configureChains([mainnet, arbitrum, polygon], [publicProvider()]);

const { connectors } = getDefaultWallets({
    chains,
});

const config = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
});

function MyConnectButton() {

}

function Section(props) {
    return (
        <section id={props.id} className={`w-full h-full flex flex-col justify-center ${props.className}` } style={{ 
            paddingTop: props.offsetTop/2,
            }} >
            <div className="w-full h-full" style={{
            paddingTop: props.offsetTop/2,
            paddingBottom: props.offsetTop/2,
                ...props.style}}>
            <div className=" container mx-auto p-4 max-w-[1280px]">
                <div className="w-full">
                    {props.children}
                </div>
            </div>
            </div>
        </section>
    )
}

function Roadmap() {
    return (
        <ol class="relative border-l border-gray-200 dark:border-gray-700 zendot">
            <li class="mb-10 ml-4">
                <div class="absolute w-3 h-3 bg-gray-100 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time class="mb-1 text-sm font-normal leading-none text-gray-100 ">Phase 1</time>
                <h3 class="text-lg font-semibold text-gray-100 dark:text-white">Application UI code in Tailwind CSS</h3>
                <p class="mb-4 text-base font-normal text-gray-100 ">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.</p>
            </li>
            <li class="mb-10 ml-4">
                <div class="absolute w-3 h-3 bg-gray-100 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time class="mb-1 text-sm font-normal leading-none text-gray-100 dark:text-gray-500">Phase 2</time>
                <h3 class="text-lg font-semibold text-gray-100 dark:text-white">Application UI code in Tailwind CSS</h3>
                <p class="mb-4 text-base font-normal text-gray-100 ">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.</p>
            </li>
        </ol>
    )

}

function Main() {
    let [headerHeight, setHeaderHeight] = useState(0)
    useEffect(() => {
        const headerOffset = document.querySelector('header').offsetHeight;
        setHeaderHeight(headerOffset)
        console.log(headerOffset)
    }, []);

    return (
        <div className="App flex flex-col text-gray-100 items-center" >
            <div className="App w-full flex flex-row items-center fixed top-0 justify-center">
                <header className="navbar w-full flex  max-w-[1280px] flex-row  py-2 justify-between center text-gray-0"  style={{ fontFamily: 'russo one,sans-serif', }}>
                    <div className="flex flex-row gap-5 text-3xl ">
                        <div className="text-4xl" > ZkPenguin</div>
                    </div>
                    <div className="flex flex-row gap-8 items-center  ">
                        <AnchorLink href="#home" >Home</AnchorLink>
                        <AnchorLink href="#about" >About</AnchorLink>
                        <AnchorLink href="#roadmap" >Roadmap</AnchorLink>
                        <AnchorLink href="#gallery">Gallery</AnchorLink>
                        <a href="#team">Team</a>
                        <a href="#faq">FAQ</a>
                    </div>
                </header>
            </div>
            <Section id="home" offsetTop={headerHeight}>
                <h1 className="text-4xl zendot">home</h1>
            </Section>
            <Section id="about" offsetTop={headerHeight} style={{
                backgroundColor: '#20474F',
            }}>
                <div className="grid grid-cols-4 gap-6">
                    <div className="col-span-2" >
                        <img src={aboutImg} />
                    </div>
                    <div className="col-span-2 pt-2">
                        <h6 className="text-3xl">about</h6>
                        <div className="title text-5xl my-4">About Zk Penguin (ZKP)</div>
                        <div className="text-xl text-gray-300 russo" >
                            <p>
                                ZKPENGUIN is a community-driven ZKSync NFT project . Unlike other collections, ZKPENGUIN's art is carefully designed to ensure that each NFT is unique and algorithmically generated from over 200 possible traits, including hats, clothing, expressions, and more, all depicting the most fashionable penguin possible.
                            </p>
                            <br/>
                            <p>
                                As a unique collection, ZKPENGUIN attracts collectors through rewards and practicality. Once the collection is sold out, owners have the opportunity claim $ZKPgn tokens, which have a variety of uses such as purchasing merchandise, voting rights, and listing on DEX.
                            </p>
                            <br/>
                            <p>
                                As the benchmark NFT collection on zkSync, ZKPENGUIN aims to be a leader in the NFT market. We not only want collectors to have beautiful NFTs but also aim to provide them with a valuable asset and a strong community through various rewards and practical features.
                            </p>
                            <br/>
                            <p>
                                Additionally, we plan to release the ZK Baby Penguins NFT & BTC Penguin NFT Collection, a unique set of NFTs designed exclusively for ZKPENGUIN holders, who will be eligible for a free mint of these NFTs.
                            </p>
                            <br/>
                            <p>
                                Overall, ZKPENGUIN is a unique NFT collection that aims to be the benchmark NFT collection on zkSync and build a strong community by providing more value to collectors through rewards and practical features.
                            </p>
                        </div>

                    </div>
                </div>
            </Section>
            <Section id="roadmap" className="" offsetTop={headerHeight} >
                <h3 className="text-4xl zendot">roadmap</h3>
                <div className="my-8">
                    <Roadmap/>
                </div>
            </Section>
            <Section id="gallery" offsetTop={headerHeight} >
                <h3 className="text-4xl zendot">gallery</h3>
            </Section>
            <Section id="team" offsetTop={headerHeight} >
                <h3 className="text-4xl zendot">Team</h3>
            </Section>
            <Section id="faq" offsetTop={headerHeight} >
                <h3 className="text-4xl zendot">FAQ</h3>
            </Section>
        </div>
    )
}


function App() { 
    return (
        <WagmiConfig config={config}>
            <RainbowKitProvider chains={chains} theme={ darkTheme({ accentColor: '#5b3fe4', accentColorForeground: 'white', fontStack: 'system', overlayBlur: 'small', })}>
                <Main/>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}

export default App;
