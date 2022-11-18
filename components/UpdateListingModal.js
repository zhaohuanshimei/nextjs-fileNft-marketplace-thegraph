import { Modal, Input, useNotification } from "web3uikit"
import { useState } from "react"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/FileNftMarketplace.json"
import { ethers } from "ethers"

export default function UpdateListingModal({ tokenId, isVisible, marketplaceAddress, onClose }) {
    const dispatch = useNotification()

    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0)
    const [amountToUpdateListingWith, setAmountToUpdateListingWith] = useState(0)

    const handleUpdateListingSuccess = () => {
        dispatch({
            type: "success",
            message: "listing updated",
            title: "Listing updated - please refresh",
            position: "topL",
        })
        onClose && onClose()
        setPriceToUpdateListingWith("0")
        setAmountToUpdateListingWith("0")
    }

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            tokenId: tokenId,
            price: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
            listAmount: amountToUpdateListingWith,
        },
    })

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                updateListing({
                    onError: (error) => {
                        console.log(error)
                    },
                    onSuccess: () => handleUpdateListingSuccess(),
                })
            }}
        >
            <div color="red">
                {"If you are a buyer of this NFT, you will list your NFT for sell."}
            </div>
            <div>={">"}</div>
            <Input
                label="Update listing price in L1 Currency (ETH)"
                name="New listing price"
                type="number"
                // inputWidth="50%"
                onChange={(event) => {
                    setPriceToUpdateListingWith(event.target.value)
                }}
            />
            <Input
                label="Update listing Amount"
                name="New Amount"
                type="number"
                onChange={(event) => {
                    setAmountToUpdateListingWith(event.target.value)
                }}
            />
        </Modal>
    )
}
