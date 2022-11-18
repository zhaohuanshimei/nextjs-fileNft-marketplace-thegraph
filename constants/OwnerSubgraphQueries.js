import { gql } from "@apollo/client"

const GET_OWNERSHIP = gql`
    # query Owner($Owner: string!) {
    {
        itemOwnerships(
            first: 50
            orderBy: tokenId
            orderDirection: desc
            where: { amount_not: "0" } # owner: $Owner
        ) {
            id
            owner
            tokenId
            price
            amount
        }
    }
`
export default GET_OWNERSHIP
