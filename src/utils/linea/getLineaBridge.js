
import axios from 'axios';
import { ethers } from 'ethers';

async function getLineaBridge(address, apiKey) {
    try {
        let url = `https://api.lineascan.build/api?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
        const response = await axios.get(url);
        const transactions = response.data.result;
        const bridgeTx = transactions.filter(item => item.from === "0x508ca82df566dcd1b0de8296e70a96332cd644ec" && item?.value > 300000000000000);
        if (bridgeTx.length === 0) {
            return { l1Tol2Times: 0, l1Tol2Amount: 0 };
        }
        const bridgeTxCount = bridgeTx?.length;
        const bridgeTxAmount = (bridgeTx.reduce((acc, item) => acc + parseFloat(ethers.formatEther(item.value)), 0)).toFixed(4);
        return { l1Tol2Times: bridgeTxCount, l1Tol2Amount: bridgeTxAmount };
    } catch (error) {
        console.error(error);
        return { l1Tol2Times: "Error", l1Tol2Amount: "Error"};
    }
}

export default getLineaBridge;