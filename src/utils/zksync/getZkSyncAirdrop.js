import Papa from "papaparse";

async function getZkSyncAirdrop(address) {
  try {
    const file = await fetch("/public/zksync _eligibility_list.csv").then(
      (res) => res.text()
    );
    const promise = new Promise((resolve, reject) => {
      let found = false;
      Papa.parse(file, {
        delimiter: ",",
        header: false,
        worker: true,
        step: (row, parser) => {
          if (row && row.data && row.data.length > 1) {
            if (row.data[0].toLowerCase() === address.toLowerCase()) {
              found = true;
              parser.abort();
              resolve({ address, eligibility: true, amount: row.data[1] });
            }
          }
        },
        complete: () => {
          if (!found) {
            resolve({ address, eligibility: false, amount: 0 });
          }
          console.log("所有行已处理完成");
        },
        error: (err) => {
          reject(err);
          console.log("解析遇到错误");
        },
      });
    });
    const data = await promise;
    return data;
  } catch (error) {
    console.error(error);
    return { airdrop: "Error" };
  }
}

export default getZkSyncAirdrop;
