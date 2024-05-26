import axios from 'axios';
import { ethers } from 'ethers';

async function getScrollBridge(address) {
            try {
                address = address.toLowerCase(); // 确保地址是小写
                let url = `https://api.scrollscan.com/api?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=9999999999&page=1&offset=999&sort=asc`;
                const response = await axios.get(url);
                const transactions = response.data.result;
                const bridgeTx = transactions.filter(item => item.from === "0x6ea73e05adc79974b931123675ea8f78ffdacdf0" && item.to === address && item?.value > 1);
                const bridgeTxCount = bridgeTx?.length;
                const bridgeTxAmount = bridgeTx.reduce((acc, item) => acc + parseFloat(ethers.formatEther(item.value)), 0).toFixed(3);
                let url_l2 = `https://api.scrollscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=9999999999&page=1&offset=999&sort=asc`;
                const response_l2 = await axios.get(url_l2);
                let transactions_l2 = response_l2.data.result;
                const bridgeTx_l2 = transactions_l2.filter(item => item.from === address && item.to === "0x4c0926ff5252a435fd19e10ed15e5a249ba19d79" && item?.value > 1);
                const bridgeTxCount_l2 = bridgeTx_l2?.length;
                const bridgeTxAmount_l2 = bridgeTx_l2.reduce((acc, item) => acc + parseFloat(ethers.formatEther(item.value)), 0).toFixed(3);
                return { l1Tol2Times: bridgeTxCount, l1Tol2Amount: bridgeTxAmount, l2Tol1Times: bridgeTxCount_l2, l2Tol1Amount: bridgeTxAmount_l2};
            } catch (error) {
                console.error(error);
                return { l1Tol2Times: "Error", l1Tol2Amount: "Error", l2Tol1Times: "Error", l2Tol1Amount: "Error"};
            }
        }
        
        export default getScrollBridge;