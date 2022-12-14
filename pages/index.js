import styles from "../styles/Home.module.css"
import { useMoralisQuery, useMoralis } from "react-moralis"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMS from "../constants/ItemSubgraphQueries"
import GET_OWNERSHIP from "../constants/OwnerSubgraphQueries"
import { useQuery } from "@apollo/client"

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].FileNftMarketplace[0]
    // console.log(marketplaceAddress)
    const nftAddress = networkMapping[chainString].FileNFT[0]
    // console.log(nftAddress)
    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    loading || !listedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            //我的列表和排行榜也可以参考这里
                            console.log(nft)
                            const { price, tokenId, seller, amountSold, amountListed } = nft
                            // console.log(`price${price}`)
                            console.log(`tokenId${tokenId}`)
                            // console.log(`seller${seller}`)
                            // console.log(`amountSold${amountSold}`)
                            // console.log(`amountListed${amountListed}`)
                            return (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    amountSold={amountSold}
                                    amountListed={amountListed}
                                    tokenId={tokenId}
                                    marketplaceAddress={marketplaceAddress}
                                    seller={seller}
                                    key={`${tokenId}${seller}`}
                                />
                            )
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}
