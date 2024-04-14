import axios from 'axios';
import { ethers } from 'ethers';

async function getBaseBridge(address, apiKey) {
            try {
                address = address.toLowerCase(); // 确保地址是小写
                let url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=9999999999&page=1&offset=4999&sort=asc&apikey=${apiKey}`;
                const response = await axios.get(url);
                const transactions = response.data.result;
                const bridgeTx = transactions.filter(item => item.from === address && item.to === address && item?.value > 1);
                if (bridgeTx.length === 0) {
                    return { l1Tol2Times: 0, l1Tol2Amount: 0 };
                }
                const bridgeTxCount = bridgeTx?.length;
                const bridgeTxAmount = bridgeTx.reduce((acc, item) => acc + parseFloat(ethers.formatEther(item.value)), 0).toFixed(3);
                return { l1Tol2Times: bridgeTxCount, l1Tol2Amount: bridgeTxAmount };
            } catch (error) {
                console.error(error);
                return { l1Tol2Times: "Error", l1Tol2Amount: "Error"};
            }
        }
        
        export default getBaseBridge;
