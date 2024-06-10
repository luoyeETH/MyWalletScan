import axios from 'axios';

async function getBaseTasks(address, apiKey) {
    try {
        address = address.toLowerCase();
        let url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=999&sort=asc&apikey=${apiKey}`;
        
        let response;
        let status;
        let message;
        let retries = 0;
        const maxRetries = 2;
        
        do {
            response = await axios.get(url);
            status = response.data.status;
            message = response.data.message;
            
            if (status === "0" && message === "NOTOK") {
                console.log("Status is 0 and message is NOTOK, trying again in 5 seconds...");
                await new Promise(resolve => setTimeout(resolve, 5000));
                retries++;
            }
        } while (status === "0" && message === "NOTOK" && retries < maxRetries);
        
        if (status === "0" && message === "NOTOK") {
            return ["Error: Max retries reached"];
        }
        
        let transactions = response.data.result;
        
        if (Array.isArray(transactions) && transactions.length <= 0 || message === "No transactions found") {
            return [[],[]];
        }
        
        transactions = transactions?.filter(item => item.from === address);
        let contractAddresses = transactions?.map(item => item.to);
        contractAddresses = contractAddresses?.map(item => item.toLowerCase());
        let timestamps = transactions?.map(item => item.timeStamp * 1000);

        return [contractAddresses, timestamps];
    } catch (error) {
        console.error(error);
        return ["Error: " + error.message];
    }
}

export default getBaseTasks;
