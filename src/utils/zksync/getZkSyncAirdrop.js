import axios from "axios";

async function getZkSyncAirdrop(address) {
    try {
        const result = "TBA";
        // let url =``;
        // const response = await axios.get(url);
        // let result = response.data?.amount;
        // if (result == undefined || result == null || result == "") {
        //     result = 0;
        // } 
        return {airdrop: result}
    } catch (error) {
        console.error(error);
        return {airdrop: "Error"}
    }
}

export default getZkSyncAirdrop;
