import axios from 'axios';
import { ethers } from 'ethers';

async function getLineaInfo(address, apiKey) {
    try {
        let url = `https://api.lineascan.build/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`;
        const response = await axios.get(url);
        if (response.data.result === "Max rate limit reached") {
            return { balance: "Error: Rate Limit Exceeded" };
        }
        const balance = parseFloat(ethers.formatEther(response.data.result)).toFixed(4);
        return { balance: balance };
    } catch (error) {
        console.error(error);
        return { balance: "Error" };
    }
}

export default getLineaInfo;
