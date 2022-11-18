import styles from "../styles/Home.module.css"
import { useMoralisQuery, useMoralis } from "react-moralis"
import NFTBoxOwner from "../components/NFTBoxOwner"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMS from "../constants/ItemSubgraphQueries"
import GET_OWNERSHIP from "../constants/OwnerSubgraphQueries"
import { useQuery } from "@apollo/client"
import { Form, useNotification, Button } from "web3uikit"

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const dispatch = useNotification()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].FileNftMarketplace[0]
    // console.log(marketplaceAddress)
    const nftAddress = networkMapping[chainString].FileNFT[0]
    const { loading, error, data: ownNfts } = useQuery(GET_OWNERSHIP)

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">My Nfts</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    loading || !ownNfts ? (
                        <div>Loading...</div>
                    ) : (
                        // console.log(ownNfts.itemOwnerships)
                        ownNfts.itemOwnerships.map((nft) => {
                            //我的列表和排行榜也可以参考这里
                            console.log(nft)
                            const { price, tokenId, owner, amount } = nft
                            // console.log(`price${price}`)
                            console.log(`tokenId${tokenId}`)
                            // console.log(`seller${seller}`)
                            // console.log(`amountSold${amountSold}`)
                            // console.log(`amountListed${amountListed}`)
                            if (account == owner) {
                                return (
                                    <NFTBoxOwner
                                        price={price}
                                        nftAddress={nftAddress}
                                        // amountSold={amountSold}
                                        amount={amount}
                                        tokenId={tokenId}
                                        marketplaceAddress={marketplaceAddress}
                                        owner={owner}
                                        key={`${tokenId}${owner}`}
                                    />
                                )
                            }
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}
