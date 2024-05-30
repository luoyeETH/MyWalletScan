import axios from 'axios';
import { ethers } from 'ethers';

async function getLineaERC20(address, apiKey) {
    try {
        let busdUrl = `https://api.lineascan.build/api?module=account&action=tokenbalance&contractaddress=0x7d43AABC515C356145049227CeE54B608342c0ad&address=${address}&tag=latest&apikey=${apiKey}`;
        const response = await axios.get(busdUrl);
        const busdResult = response.data?.result;
        const balance = busdResult && !isNaN(busdResult) ? parseFloat(ethers.formatEther(busdResult)).toFixed(2) : "Error";

        let usdcUrl = `https://api.lineascan.build/api?module=account&action=tokenbalance&contractaddress=0x176211869cA2b568f2A7D4EE941E073a821EE1ff&address=${address}&tag=latest&apikey=${apiKey}`;
        const response1 = await axios.get(usdcUrl);
        const usdcResult = response1.data?.result;
        const balance1 = usdcResult && !isNaN(usdcResult) ? parseFloat(usdcResult / 1000000).toFixed(2) : "Error";

        let lxpUrl = `https://api.lineascan.build/api?module=account&action=tokenbalance&contractaddress=0xd83af4fbd77f3ab65c3b1dc4b38d7e67aecf599a&address=${address}&tag=latest&apikey=${apiKey}`;
        const response2 = await axios.get(lxpUrl);
        const lxpResult = response2.data?.result;
        const balance2 = lxpResult && !isNaN(lxpResult) ? parseFloat(ethers.formatEther(lxpResult)).toFixed(0) : "Error";

        return {BUSD: balance, USDC: balance1, LXP: balance2};
    } catch (error) {
        console.error(error);
        return {BUSD: "Error", USDC: "Error", LXP: "Error"};
    }
}

export default getLineaERC20;
