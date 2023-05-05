import logo from "./logo.svg";
import "./App.css";

import "@rainbow-me/rainbowkit/styles.css";
import {
    getDefaultWallets,
    RainbowKitProvider,
    midnightTheme,
    darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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

function App() {
    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains} theme={darkTheme()}>
                <div className="App">
                    <header className="fixed top-0 w-full p-4">
                        <nav className="w-full flex fixed top-0 left-0 px-8 py-4 justify-between items-center space-x-6">
                            <div>logo</div>
                            <div className="flex flex-row gap-2">
                                <div>$clips</div>
                                <ConnectButton />
                            </div>
                        </nav>
                    </header>
                    <div className="min-h-screen flex justify-center items-center pt-16 md:pt-0">
                        <div className="h-min flex flex-col">
        <div className=""> prizepool: 20000000 $clips</div>
        <div className=""> clip owner: 0x00000000000000000000</div>
                            <h2 className="Clip leading-tight m-0 text-transparent bg-gradient-to-r from-[#00ffa0] via-[#69b6ff] to-[#cd14ff] bg-clip-text font-black text-3xl md:text-3xl lg:text-7xl text-center my-12 uppercase break-words max-w-[90vw] md:max-w-[90vw]">
        abcdefghijklmnopqrstuvwxyz
                            </h2>
                            <div className="">owner can claim prizepool in</div>
                            <button className="btn-gradient mt-4 self-center w-full md:w-auto">Mint 5000000 $clips</button>
                        </div>
                    </div>
                </div>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}

export default App;
