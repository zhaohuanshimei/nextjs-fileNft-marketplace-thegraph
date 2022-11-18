import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { Form, useNotification, Button } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis" //!!!!!!
import { ethers } from "ethers"
import nftAbi from "../constants/FileNFT.json"
import nftMarketplaceAbi from "../constants/FileNftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { useEffect, useState } from "react"

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis() //!!!!!!
    const chainString = chainId ? parseInt(chainId).toString() : "31337" //!!!!
    const marketplaceAddress = networkMapping[chainString].FileNftMarketplace[0]
    // console.log(marketplaceAddress)
    const nftAddress = networkMapping[chainString].FileNFT[0]
    // console.log(nftAddress)
    const dispatch = useNotification()
    const [proceeds, setProceeds] = useState("0")

    const { runContractFunction } = useWeb3Contract()

    async function approveAndList(data) {
        console.log("Preparing ...")
        const cid = data.data[0].inputResult
        const password = data.data[3].inputResult
        const amount = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()
        const description = data.data[4].inputResult

        console.log("Minting ... ")
        const mintOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "requestNFT",
            params: {
                cid: cid,
                password: password,
                amount: amount,
            },
        }
        const response = await runContractFunction({
            params: mintOptions,
            // onSuccess: () => handleMintSuccess(price, amount),
            onError: (error) => {
                console.log(error)
            },
        })
        // console.log(response)
        const receipt = await response.wait()
        // console.log(receipt)
        const tokenId = receipt.events[1].args[0].toString()

        dispatch({
            type: "success",
            message: "NFT Minted",
            title: "NFT Minted",
            position: "topL",
        })

        console.log("Get Approval ...")
        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "setApprovalForAll",
            params: {
                operator: marketplaceAddress,

                approved: true,
            },
        }
        const approveResponse = await runContractFunction({
            params: approveOptions,
            onError: (error) => {
                console.log(error)
            },
        })
        await approveResponse.wait()

        dispatch({
            type: "success",
            message: "NFT Approved",
            title: "NFT Approved",
            position: "topL",
        })

        console.log("Listing ...")
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                tokenId: tokenId,
                price: price,
                listAmount: amount,
            },
        }
        const listingResponse = await runContractFunction({
            params: listOptions,
            onSuccess: () => handleListSuccess(),
            onError: (error) => console.log(error),
        })
        await listingResponse.wait()

        //update the password and the description (the tags) to fly BD
    }

    async function handleApproveSuccess(tokenId, price) {
        console.log("Get Approval ...")
        // await txapprove.wait()
    }

    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topL",
        })
    }

    const handleWithdrawSuccess = () => {
        dispatch({
            type: "success",
            message: "Withdrawing proceeds",
            position: "topL",
        })
    }

    async function setupUI() {
        const returnedProceeds = await runContractFunction({
            params: {
                abi: nftMarketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
            },
            onError: (error) => console.log(error),
        })
        if (returnedProceeds) {
            setProceeds(returnedProceeds.toString())
        }
    }

    useEffect(() => {
        setupUI()
    }, [proceeds, account, isWeb3Enabled, chainId])

    return (
        <div className={styles.container}>
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "File IPFS CID",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "CID",
                    },
                    {
                        name: "Mint Amount",
                        type: "number",
                        value: "1000000",
                        key: "amount",
                        inputWidth: "50%",
                    },
                    {
                        name: "Price in ETH (Default:0)",
                        type: "number",
                        value: "",
                        key: "price",
                        inputWidth: "50%",
                    },
                    {
                        name: "Encrypted File Password (keep it null if not encrypted)",
                        type: "text",
                        value: "null",
                        key: "password",
                        inputWidth: "50%",
                    },
                    {
                        type: "textarea",
                        value: "Describe Your File within 200 Words!",
                        key: "description",
                        inputWidth: "50%",
                        // display: "flex",
                    },
                ]}
                title="Mint and List your NFT!"
                id="Main Form"
            />
            <div>
                -----------------------------------------------------------------------------------------------
            </div>
            <div>Withdraw {proceeds} proceeds</div>
            {proceeds != "0" ? (
                <Button
                    onClick={() => {
                        runContractFunction({
                            params: {
                                abi: nftMarketplaceAbi,
                                contractAddress: marketplaceAddress,
                                functionName: "withdrawProceeds",
                                params: {},
                            },
                            onError: (error) => console.log(error),
                            onSuccess: () => handleWithdrawSuccess,
                        })
                    }}
                    text="Withdraw"
                    type="button"
                />
            ) : (
                <div>No proceeds detected</div>
            )}
        </div>
    )
}
