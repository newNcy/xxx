import logo from './logo.svg';

import { useEffect ,useState} from 'react';
import a from 'react-anchor-link-smooth-scroll';
import aboutImg from './about.png';
import team1 from './team1.png';
import team2 from './team2.png';
import team3 from './team3.png';
import team4 from './team4.png';
import r0 from './roadmap/0.png';

import {Swiper, SwiperSlide} from 'swiper/react';
import SwiperCore, { Autoplay, Navigation } from 'swiper';
import 'swiper/swiper-bundle.css';

import './App.css';
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
import images from './gallery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faTelegram } from '@fortawesome/free-brands-svg-icons';


SwiperCore.use([Autoplay, Navigation]);

let team_img = [team1, team2, team3, team4]
let roadmap_img = [r0]
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
        <section id={props.id} className={`w-full min-h-80 flex flex-col gap-12 justify-start ${props.className}` } style={{ 
            paddingTop: props.offsetTop/2,
            }} >
            <div className="py-8 w-full h-full" style={{
            paddingTop: 2,
            paddingBottom: props.offsetTop/4,
                ...props.style}}>
                <div className={`h-full mx-auto ${props.wFull ? '' : 'container '}`}>
                    {props.children}
                </div>
            </div>
        </section>
    )
}

function Roadmap({roadmap}) {

    let transition_by_idx = i => {
        let t = 1/(i+1)
        return `background-color ${t}s, color ${t}s, border-color ${t}s, border-style ${t}s ease-in-out`
    }

    return (
        <ol class="relative border-dashed border-gray-300 zendot text-gray-300">
            {roadmap.map((e, i)=> 
            <li class="pl-4 roadmap pb-12" style={{
                        transition: transition_by_idx(i),
                    }}>
                <div class="absolute w-5 h-5 bg-gray-100 rounded-full  -left-2 border-2 border-gray-300 roadmap-anchor"
                    style = {{ transition: transition_by_idx(i)}}
                >
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className={`col-span-1 row-span-1 col-start-${(i%2+1)}`} >
                        <div className={`flex flex-row items-center gap-4 mb-4  `}>
                            <time class="text-sm font-normal leading-none ">Phase {i} </time>
                            <h3 class="text-lg " > {e.title}</h3>
                        </div>
                        {
                            e.content.map( line => 
                                <p class="mb-4 text-base font-normal ">- {line}</p>
                            )
                        }
                    </div>
                </div>
            </li>
            )}
        </ol>
    )

}

function Team({team}) {
    return (
        <div className="w-full scroll-container">
            <div className="w-full grid grid-cols-4 gap-8 p-4 py-12">
                {
                    team.map((e,i) =>
                        <div className="col-span-1 flex-col hover-out">
                            <img className="avatar" src={team_img[i]} />
                            <div className="flex flex-col items-center russo">
                                <h3 className="">{e.name}</h3>
                                <p>{e.intro}</p>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

function capitalizeFirstLetter(string) {
    if (string.length === 0) {
        return string; // 空字符串则返回原字符串
    }

    const firstLetter = string.charAt(0).toUpperCase(); // 获取第一个字母并转换为大写
    const remainingLetters = string.slice(1); // 获取剩余的字母

    return firstLetter + remainingLetters; // 拼接并返回结果
}


function Link ({to, className, children}) {
    let scrollToId = (id) =>{
        const headerOffset = document.querySelector('header').offsetHeight;
        let elt = document.querySelector(id) 
        if (elt) {
            window.scrollTo({
                top : elt.offsetTop - headerOffset + 3,
                behavior : 'smooth'
            })
        }
    }
    return (
        <a className={`cursor-default link ${className}`} onClick={()=>scrollToId('#'+to)}>{capitalizeFirstLetter(to)}</a>
    )
}

function About({text}) {
    let lines = text.split('\n')
    lines = lines.map(line=> line.split(/[,.!?]/).filter(Boolean))
    return (  
        <div className="russo text-gray-300 flex flex-col gap-2">
            { lines.map( line => 
            <p className="">
                { line.map((sentence, i)=>
                <span className="transition duration-300 border-accent hover:border-b-2 ">{`${sentence}${i < line.length-1?',':'.'}`}</span>
                )}
            </p>
            )}
        </div>
    )
}

function shuffleArray(array) {
  // 遍历数组
  for (let i = array.length - 1; i > 0; i--) {
    // 生成随机位置
    const j = Math.floor(Math.random() * (i + 1));
    // 交换当前位置和随机位置的元素
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function Gallery({images, reverse, filter, sort, speed}) {
    return (
        <div className="gradient-overlay">
            <Swiper
                slidesPerView={8}
                loop={true}
                speed={speed? speed:1000}
                allowTouchMove={false}
                autoplay={ {delay: 0 , 
                    disableOnInteraction : false,
                    reverseDirection: reverse,
                }}
            >

                {shuffleArray(Object.keys(images)).filter(filter?filter:(e)=>true).map(k=> 
                <SwiperSlide className="">  
                    <img className = "hover-out" src={images[k]} alt="Image 1" />
                </SwiperSlide>
                )}
            </Swiper>
        </div>
    );
}


function Collapse({Q, A}) {
    const [isExpanded, setExpanded] = useState(true);

    const toggleCollapse = () => {
        setExpanded(!isExpanded);
    };

    return (
        <div className="py-2">
            <button
                type="button"
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-500 text-white focus:outline-none"
                aria-expanded={isExpanded}
            >
                {Q}
                <svg
                    className={`w-4 h-4 fill-current ${isExpanded ? 'hidden' : 'block'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                >
                    <path
                        fillRule="evenodd"
                        d="M8.293 7.293a1 1 0 0 0-1.414 1.414L11.586 12l-4.707 4.293a1 1 0 1 0 1.414 1.414l6-6a1 1 0 0 0 0-1.414l-6-6z"
                    ></path>
                </svg>
                <svg
                    className={`w-4 h-4 fill-current ${isExpanded ? 'block' : 'hidden'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                >
                    <path
                        fillRule="evenodd"
                        d="M15.707 16.707a1 1 0 0 1-1.414 0L12 14.414l-2.293 2.293a1 1 0 0 1-1.414-1.414l2-2a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414z"
                    ></path>
                </svg>
            </button>
            {isExpanded && (
                <div className="p-4 transition-all duration-300" >
                    {/* 折叠的内容 */}
                    <p>{A}</p>
                </div>
            )}
        </div>
    );
}


function Main() {
    let [headerHeight, setHeaderHeight] = useState(0)

    useEffect(() => {
        const headerOffset = document.querySelector('header').offsetHeight;
        setHeaderHeight(headerOffset)
    }, []);

    return (
        <div className="bg-nft flex flex-col text-gray-100 items-center" >
            <div className="bg-nft w-full fixed top-0 flex flex-row items-center justify-center shadow " style={{zIndex:999}}>
                <header className="navbar w-full flex  container  flex-row  py-2 justify-between center text-gray-0"  style={{ fontFamily: 'russo one,sans-serif', }}>
                    <div className="flex flex-row gap-5 text-3xl ">
                        <div className="text-4xl" > ZkPenguin</div>
                    </div>
                    <div className="flex flex-row gap-4 items-center ">
                        <Link to="about"/>
                        <Link to="roadmap"/>
                        <Link to="gallery"/>
                        <Link to="team"/>
                        <Link to="faq"/>
                        <div className="flex flex-row items-center gap-3">
                            <a className="link ml-4" href="https://twitter.com/zksyncpenguin" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faTwitter} size="lg" />
                            </a>
                            <a className="link ml-1" href="https://t.me/zkpenguin" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faTelegram} size="lg" />
                            </a>
                        </div>
                    </div>
                </header>
            </div>
            <div className="flex flex-col w-full divide-dashed divide-y-1 divide-gray-900 ">
                <Section id="about" offsetTop={headerHeight} style={{
                    paddingTop: headerHeight
                }}>
                    <div className="grid grid-cols-4 gap-6" style={{
                    }}>
                        <div className="col-span-2 items-center justify-center flex flex-col h-full" >
                            <img className = "w-full" src={aboutImg} />
                        </div>
                        <div className="col-span-2 pt-2">
                            <h6 className="text-xl text-accent">about</h6>
                            <div className="title text-5xl my-4">About Zk Penguin (ZKP)</div>
                            <About text={`ZKPENGUIN is a community-driven ZKSync NFT project . Unlike other collections, ZKPENGUIN's art is carefully designed to ensure that each NFT is unique and algorithmically generated from over 200 possible traits, including hats, clothing, expressions, and more, all depicting the most fashionable penguin possible.
As a unique collection, ZKPENGUIN attracts collectors through rewards and practicality. Once the collection is sold out, owners have the opportunity claim $ZKPgn tokens, which have a variety of uses such as purchasing merchandise, voting rights, and listing on DEX.
As the benchmark NFT collection on zkSync, ZKPENGUIN aims to be a leader in the NFT market. We not only want collectors to have beautiful NFTs but also aim to provide them with a valuable asset and a strong community through various rewards and practical features.
Additionally, we plan to release the ZK Baby Penguins NFT & BTC Penguin NFT Collection, a unique set of NFTs designed exclusively for ZKPENGUIN holders, who will be eligible for a free mint of these NFTs.
Overall, ZKPENGUIN is a unique NFT collection that aims to be the benchmark NFT collection on zkSync and build a strong community by providing more value to collectors through rewards and practical features.`}/>

                        </div>
                    </div>
                </Section>
                <Section id="roadmap" className="" offsetTop={headerHeight} >
                    <h3 className="text-4xl zendot  pb-3">Roadmap</h3>
                    <div className="my-8 px-2">
                        <Roadmap roadmap={[
                            {
                                title: 'Preparation',
                                    content:[
                                        `Social Media & Website Launch`,
                                        `Community Engagement`,
                                        `Marketing`
                                    ]
                            },{
                                title: 'NFT Launch',
                                content:[
                                    'Mint Live',
                                    'Launch NFT Rarity for ZKPenguin',
                                    'Launch Merch Store exclusively for holders'
                                ]
                            },{
                                title: 'Token listing',
                                content:[
                                    'AirDrop $ZKPGN token',
                                    'Listing on DEX',
                                    'Listing on CEX'
                                ]
                            },{
                                title: ' Zk Baby Penguin & BTC Penguin NFT',
                                content:[
                                    'Launch Zk Baby Penguin & BTC Penguin NFT',
                                    'Mystery Box'

                                ]
                            },{
                                title: 'Zk Penguin Metaverse',
                                content:[
                                    'Launch of Penguinverse Land exclusively for ZKPENGUIN holders',
                                    'Create the APP and put it on the Apple Store and Google Play'

                                ]
                            },{
                                title: 'Roadmap 2.0',
                                content:[
                                    '(Continuously update the roadmap according to the actual situation)'

                                ]
                            }

                        ]}/>
                    </div>
                </Section>
                <Section id="gallery" wFull={true} className="" offsetTop={headerHeight} >
                    <div className="flex flex-row justify-center">
                        <h3 className="text-4xl zendot pb-12 container">Gallery</h3>
                    </div>
                    <Gallery images={images} />
                    <Gallery images={images} reverse={false} speed={700}/>
                    <Gallery images={images} speed={500}/>
                </Section>
                <Section id="team" className="" offsetTop={headerHeight} >
                    <h3 className="text-4xl zendot">Team</h3>
                    <Team team={[
                        {
                            name : 'Sap',
                                intro: 'Founder and CEO. With years of experience in blockchain and digital assets, he has held executive positions at several notable companies. he is the driving force behind the ZKPENGUIN project, responsible for overall planning and management.'
                        },{
                            name : 'Johnson  ',
                            intro: 'CTO. He is a seasoned blockchain developer with years of technical experience. He is responsible for developing and maintaining the technical architecture of the ZKPENGUIN NFT platform, ensuring its security and reliability.'
                        },{
                            name : 'Capsy',
                            intro: 'Art Director. She is a talented artist with years of experience in digital art creation. She is responsible for designing and creating the art pieces in the ZKPENGUIN NFTs, making each penguin unique.'
                        },{
                            name : 'Alex ',
                            intro: 'Director of Marketing. He is a seasoned digital marketing expert with years of marketing experience. He is responsible for developing and executing the marketing strategy for ZKPENGUIN, building close relationships with the community, and promoting platform growth and development.'
                        },
                    ]}/>
                </Section>
                <Section id="faq" className="" offsetTop={headerHeight} >
                    <h3 className="text-4xl zendot">Some others you may wanna know</h3>
                    <div className="py-12 flex flex-col gap-5 h-full russo">
                        <Collapse Q="1.	What Is ZKPENGUIN (ZKPGN)?" A="A:ZKPENGUIN is a community-driven ZKSync NFT project . Unlike other collections, ZKPENGUIN's art is carefully designed to ensure that each NFT is unique and algorithmically generated from over 200 possible traits, including hats, clothing, expressions, and more, all depicting the most fashionable penguin possible."/>
                        <Collapse Q="2.How Can I Buy A ZKPENGUIN (ZKPGN)?" A="You can do MINT on our official website, network switch to ZksyncEra main net."/>
                        <Collapse Q="3.What Is The Price Of Nft?" A="TBA"/>
                        <Collapse Q="4.When Claim $ZKPGN Token?" A="Refer to our roadmap"/>
                        <Collapse Q="5.Will future issues of BTC Penguin NFT require holders to pay a fee?" A="No need, we will inscribe your corresponding NFT on the BTC.You don't even have to spend gas, after inscription is completed, we will collect the holder's BTC address and send it directly to your BTC address "/>
                    </div>
                </Section>
                <div style={{height:'200px'}}>
                </div>
                <footer className="mt-12 p-12 items-center flex flex-col zendot">
                    © 2023 zk Penguin
                </footer>
            </div>
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
