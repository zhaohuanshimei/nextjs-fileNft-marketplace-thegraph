import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/FileNftMarketplace.json"
import nftAbi from "../constants/FileNFT.json"
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"

// const truncateStr = (fullStr, strLen) => {
//     if (fullStr.length <= strLen) return fullStr

//     const separator = "..."
//     const seperatorLength = separator.length
//     const charsToShow = strLen - seperatorLength
//     const frontChars = Math.ceil(charsToShow / 2)
//     const backChars = Math.floor(charsToShow / 2)
//     return (
//         fullStr.substring(0, frontChars) +
//         separator +
//         fullStr.substring(fullStr.length - backChars)
//     )
// }

export default function NFTBoxOwner({
    price,
    nftAddress,
    amount,
    tokenId,
    marketplaceAddress,
    owner,
}) {
    const { runContractFunction } = useWeb3Contract()
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")

    const [FileIPFS, setFileIPFS] = useState("")
    const [FilePassword, setFilePassword] = useState("")

    // const [amountSold, setAmountSold] = useState("")
    // const [amount, setAmount] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)
    const dispatch = useNotification()

    async function setupUI() {
        const getFileInfo = await runContractFunction({
            params: {
                abi: nftAbi,
                contractAddress: nftAddress,
                functionName: "readFileInfo",
                params: {
                    NftID: tokenId,
                },
            },
            onError: (error) => console.log(error),
        })
        if (getFileInfo) {
            console.log(getFileInfo)
            const filePerUrl = "https://ipfs.io/ipfs/"
            const fileUrl = filePerUrl.concat(getFileInfo[0])
            setFileIPFS(fileUrl)
            setFilePassword(getFileInfo[1].toString())
        }
    }
    // const { runContractFunction: buyItem } = useWeb3Contract({
    //     abi: nftMarketplaceAbi,
    //     contractAddress: marketplaceAddress,
    //     functionName: "buyItem",
    //     msgValue: price,
    //     params: {
    //         seller: seller,
    //         tokenId: tokenId,
    //     },
    // })

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "getFileURI",
        params: {
            NftID: tokenId,
        },
    })

    async function updateUI() {
        const tokenURI = await getTokenURI({
            onError: (error) => console.log(error),
        })
        // console.log(`The TokenURI is ${tokenURI}`)

        if (tokenURI) {
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(requestURL)).json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageURI(imageURIURL)
            setImageURI(imageURIURL)
            // setTokenName(tokenURI.name)
            // setTokenDescription(tokenURI.description)
            setupUI()
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwnedByUser = owner === account || owner === undefined
    const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15)

    const handleCardClick = () => {
        // isOwnedByUser
        setShowModal(true)
        // : buyItem({
        //       onError: () => handleBuyItemError(),
        //       onSuccess: () => handleBuyItemSuccess(),
        //   })
    }

    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item Bought",
            position: "topL",
        })
    }

    const handleBuyItemError = () => {
        dispatch({
            type: "error",
            message: "You can only buy it Once!",
            title: "Can't Buy It Again",
            position: "topL",
        })
    }

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    {/* <div className="italic text-sm">
                                        File IPFS {formattedSellerAddress}
                                    </div>
                                    <div className="italic text-sm">
                                        File Password {formattedSellerAddress}
                                    </div> */}

                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                    <div className="font-bold">
                                        {ethers.utils.formatUnits(price, "ether")} ETH
                                    </div>
                                    <div className="font-bold">Amount You Have {amount} </div>
                                </div>
                            </div>
                        </Card>
                        <a href={FileIPFS} className="font-bold">
                            File IPFS CID: {FileIPFS}
                        </a>
                        <div className="italic font-bold">
                            File Access Password: {FilePassword}
                        </div>
                        <div className="italic text-sm"> (null) means no password</div>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
}
