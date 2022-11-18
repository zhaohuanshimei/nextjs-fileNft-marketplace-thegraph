import { gql } from "@apollo/client"

const GET_ACTIVE_ITEMS = gql`
    {
        activeItems(
            first: 5
            where: { amountListed_gt: "0" }
            orderBy: tokenId
            orderDirection: desc
        ) {
            id
            seller
            tokenId
            price
            amountSold
            amountListed
        }
    }
`

export default GET_ACTIVE_ITEMS
