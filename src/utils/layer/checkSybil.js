import axios from "axios";

async function checkSybil(address) {
    try {
        let url =`https://sybil.dddd8.xyz/sybil?address=${address.toLowerCase()}`;
        const response = await axios.get(url);
        let result = response.data?.found;
        if (result == undefined || result == null || result == "") {
            result = false;
        } 
        return {sybil: result}
    } catch (error) {
        console.error(error);
        return {sybil: "Error"}
    }
}

export default checkSybil;
