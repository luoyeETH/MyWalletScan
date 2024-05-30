import {
    Button,
    Input,
    Space,
    Table,
    Modal,
    Form,
    notification,
    Spin,
    Tag,
    Popconfirm,
    Row, Col, InputNumber, Badge, message, Switch, Pagination
} from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons"
import {
    getEthBalance,
    getTxCount,
    getZksEra,
    getZksLite,
    getZkSyncBridge,
    exportToExcel,
    getZksTasks
} from "@utils"
import {useEffect, useState} from "react";
import './index.css';
import {Layout, Card} from 'antd';

const {Content} = Layout;
import {
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    PlusOutlined, SettingOutlined,
    SyncOutlined,
    UploadOutlined
} from "@ant-design/icons";

const {TextArea} = Input;

function ZksyncTasks() {
    const [batchProgress, setBatchProgress] = useState(0);
    const [batchLength, setBatchLength] = useState(0);
    const [batchloading, setBatchLoading] = useState(false);
    const [zkSyncConfigStore, setZkSyncConfigStore] = useState({});
    const [data, setData] = useState([]);
    const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
    const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
    const [batchForm] = Form.useForm();
    const [walletForm] = Form.useForm();
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [taskContracts, setTaskContracts] = useState(new Map());
    const [taskData, setTaskData] = useState([]);
    const [initialized, setInitialized] = useState(false);
    const [tableHeight, setTableHeight] = useState(0);
    const [hideColumn, setHideColumn] = useState(false);

    const syncSwapContract = "0x2da10a1e27bf85cedd8ffb1abbe97e53391c0295";
    const muteContract = "0x8B791913eB07C32779a16750e3868aA8495F5964";
    const okxSwapContract = "0xb9061E38FeE7d30134F56aEf7117E2F6d1580666";
    const spacefiContract = "0xbE7D1FD1f6748bbDefC4fbaCafBb11C6Fc506d1d";
    const _1inchContract = "0x6e2B76966cbD9cF4cC2Fa0D76d24d5241E0ABC2F";
    const izumiContract = "0x9606eC131EeC0F84c95D82c9a63959F2331cF2aC";
    const izumiContract2 = "0x943ac2310D9BC703d6AB5e5e76876e212100f894";
    const rollupContract = "0x5B91962F5ECa75E6558E4d32Df69B30f75cc6FE5";
    const znsContract = "0xCBE2093030F485adAaf5b61deb4D9cA8ADEAE509";
    const veloContract = "0xd999E16e68476bC749A28FC14a0c3b6d7073F50c";
    const veloContract2 = "0xf5E67261CB357eDb6C7719fEFAFaaB280cB5E2A6";
    const ReactorFusionContract = "0xC5db68F30D21cBe0C9Eac7BE5eA83468d69297e6";
    const ReactorFusionContract2 = "0x04e9Db37d8EA0760072e1aCE3F2A219988Fdac29";
    const eraLendContract = "0x1BbD33384869b30A323e15868Ce46013C82B86FB";
    const eraLendContract2 = "0x1181D7BE04D80A8aE096641Ee1A87f7D557c6aeb";
    const mavContract = "0x39e098a153ad69834a9dac32f0fca92066ad03f4";
    const veSyncContract = "0x6C31035D62541ceba2Ac587ea09891d1645D6D07";
    const overNightContract = "0x84d05333f1F5Bf1358c3f63A113B1953C427925D";
    const overNightContract2 = "0xA269031037B4D5fa3F771c401D19E57def6Cb491";
    const openoceanContract = "0x36A1aCbbCAfca2468b85011DDD16E7Cb4d673230";
    const ezkContract = "0x498f7bB59c61307De7dEA005877220e4406470e9";
    const odosContract = "0xA269031037B4D5fa3F771c401D19E57def6Cb491";
    const odosContract2 = "0x4bBa932E9792A2b917D47830C93a9BC79320E4f7";
    const dmailContract = "0x981F198286E40F9979274E0876636E9144B8FB8E";
    const pancakeContract = "0xf8b59f3c3Ab33200ec80a8A58b2aA5F5D2a8944C";

    const toggleHideColumn = () => {
        setHideColumn(!hideColumn);
      };
    
    const getEyeIcon = () => {
    if (hideColumn) {
        return <EyeInvisibleOutlined />;
    }
    return <EyeOutlined />;
    };

    const initData = async () => {
        try {
            const newData = [...data];
            const promisesQueue = [];
            for (let item of newData) {
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, syncSwapContract);
                        item.sync = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const isMute = checkTaskStatus(item.address, muteContract);
                        item.mute = isMute;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, okxSwapContract);
                        item.okx = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, spacefiContract);
                        item.spacefi = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, _1inchContract);
                        item._1inch = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, izumiContract);
                        const result2 = checkTaskStatus(item.address, izumiContract2);
                        item.izumi = result + result2;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, rollupContract);
                        item.rollup = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, znsContract);
                        item.zns = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, veloContract);
                        const result2 = checkTaskStatus(item.address, veloContract2);
                        item.velo = result + result2;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, ReactorFusionContract);
                        const result2 = checkTaskStatus(item.address, ReactorFusionContract2);
                        item.rf = result + result2;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, eraLendContract);
                        const result2 = checkTaskStatus(item.address, eraLendContract2);
                        item.eralend = result + result2;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, mavContract);
                        item.mav = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, veSyncContract);
                        item.veSync = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, overNightContract) + checkTaskStatus(item.address, overNightContract2);
                        item.usdp = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, openoceanContract);
                        item.ooe = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, ezkContract);
                        item.ezk = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, odosContract);
                        const result2 = checkTaskStatus(item.address, odosContract2);
                        item.odos = result + result2;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, dmailContract);
                        item.dmail = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, pancakeContract);
                        item.pancake = result;
                        resolve();
                    });
                });
            }
            await Promise.all(promisesQueue.map((promise) => promise()));
            setTaskData([...newData]);
            localStorage.setItem('addresses', JSON.stringify(newData));
        } catch (e) {
            console.error(e);
        }
        finally {
            setIsLoading(false);
        }
    }
    const handleRefresh = async () => {
        if (!selectedKeys.length) {
          notification.error({
            message: "错误",
            description: "请先选择要刷新的地址",
          }, 2);
          return;
        }
        setIsLoading(true);
        try {
          const newData = [...data];
          const promisesQueue = [];
          
            for (let key of selectedKeys) {
                const index = newData.findIndex(item => item.key === key);
                if (index !== -1) {
                    const item = newData[index];
                    const taskContractsMap = new Map();
                    const result = await getZksTasks(item.address);
                    const contractAddresses = result[0];
                    setTaskContracts(taskContractsMap);
                    await new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, 200);
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, syncSwapContract);
                            item.sync = result;
                            resolve();
                        });
                    });

                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, muteContract);
                            item.mute = result;
                            resolve();
                        });
                    });

                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, okxSwapContract);
                            item.okx = result;
                            resolve();
                        });
                    });

                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, spacefiContract);
                            item.spacefi = result;
                            resolve();
                        });
                    });

                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, _1inchContract);
                            item._1inch = result;
                            resolve();
                        });
                    });

                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, izumiContract);
                            const result2 = checkTaskStatusByArray(contractAddresses, izumiContract2);
                            item.izumi = result + result2;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, rollupContract);
                            item.rollup = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, znsContract);
                            item.zns = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, veloContract);
                            const result2 = checkTaskStatusByArray(contractAddresses, veloContract2);
                            item.velo = result + result2;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, ReactorFusionContract);
                            const result2 = checkTaskStatusByArray(contractAddresses, ReactorFusionContract2);
                            item.rf = result + result2;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, eraLendContract);
                            const result2 = checkTaskStatusByArray(contractAddresses, eraLendContract2);
                            item.eralend = result + result2;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, mavContract);
                            item.mav = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, veSyncContract);
                            item.veSync = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, overNightContract) + checkTaskStatusByArray(contractAddresses, overNightContract2);
                            item.usdp = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, openoceanContract);
                            item.ooe = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, ezkContract);
                            item.ezk = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, odosContract);
                            const result2 = checkTaskStatusByArray(contractAddresses, odosContract2);
                            item.odos = result + result2;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, dmailContract);
                            item.dmail = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, pancakeContract);
                            item.pancake = result;
                            resolve();
                        });
                    });
                }
            }

          await Promise.all(promisesQueue.map(promise => promise()));
          
          setTaskData([...newData]);
          localStorage.setItem('addresses', JSON.stringify(newData));
          message.success("刷新成功");
        } catch (error) {
          notification.error({
            message: "错误",
            description: error.message,
          }, 2);
        } finally {
          setIsLoading(false);
          setSelectedKeys([]);
        }
      };
      

    const checkTaskStatus = (address, taskContract) => {
        taskContract = taskContract.toLowerCase();
        const contractAddresses = taskContracts.get(address);
        if (contractAddresses == undefined) {
            message.info("等待数据加载完成再刷新");
            return "error";
        }
        const count = contractAddresses?.reduce((accumulator, contractAddress) => {
            if (contractAddress === taskContract) {
              return accumulator + 1;
            }
            return accumulator;
          }, 0);
          
          return count;
    };

    const checkTaskStatusByArray = (contractAddresses, taskContract) => {
        taskContract = taskContract.toLowerCase();
        const count = contractAddresses?.reduce((accumulator, contractAddress) => {
            if (contractAddress === taskContract) {
                return accumulator + 1;
              }
              return accumulator;
            }, 0);
            
            return count;
      };

    useEffect(() => {
    const handleResize = () => {
        setTableHeight(window.innerHeight - 180); // 减去其他组件的高度，如页眉、页脚等
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
        window.removeEventListener('resize', handleResize);
    };
    }, []);

    useEffect(() => {
        setTableLoading(true);
        const storedAddresses = localStorage.getItem('addresses');
        if (storedAddresses) {
            setData(JSON.parse(storedAddresses));
            setTaskData(JSON.parse(storedAddresses));
        }
        const fetchData = async () => {
            const parsedAddresses = JSON.parse(storedAddresses);
            if (!parsedAddresses) {
              return;
            }
            // 存储每个地址对应的合约数组到map中
            const taskContractsMap = new Map();
            let timestampsArray = [];
            const promises = []; // 存储所有的异步任务
          
            for (const entry of parsedAddresses) {
              const address = entry.address;
              const promise = getZksTasks(address)
                .then(result => {
                    taskContractsMap.set(address, result[0]);
                    timestampsArray.push(result[1]);
                })
                .catch(error => {
                  // 处理错误
                  console.error(`Error fetching tasks for address ${address}:`, error);
                });
          
              promises.push(promise);
            }
          
            try {
              await Promise.all(promises); // 等待所有的异步任务完成
              setTableLoading(false);
              setTaskContracts(taskContractsMap);
              const zks_timestamps = timestampsArray.flat()
              localStorage.setItem('zks_timestamps', JSON.stringify(zks_timestamps));
            } catch (error) {
              // 处理错误
              console.error('Error fetching task contracts:', error);
            }
          };
          
          fetchData();
          
    }, []);

    useEffect(() => {
        if (!initialized && data.length > 0 && taskContracts.size > 0) {
            initData()
            setInitialized(true); // 标记为已初始化
        }
      }, [data, taskContracts]);
   
    const rowSelection = {
        selectedRowKeys: selectedKeys,
        onChange: (selectedRowKeys) => {
            setSelectedKeys(selectedRowKeys);
        },
    };

    const [editingKey, setEditingKey] = useState(null);
    const columns = [
        {
            title: "#",
            key: "index",
            align: "center",
            render: (text, record, index) => index + 1,
            width: 34.5,
        },
        {
            title: "备注",
            dataIndex: "name",
            key: "name",
            align: "center",
            render: (text, record) => {
                const isEditing = record.key === editingKey;
                return isEditing ? (
                    <Input
                        placeholder="请输入备注"
                        defaultValue={text}
                        onPressEnter={(e) => {
                            record.name = e.target.value;
                            setData([...data]);
                            localStorage.setItem('addresses', JSON.stringify(data));
                            setEditingKey(null);
                        }}
                    />
                ) : (
                    <>
                        <Tag color="blue" onClick={() => setEditingKey(record.key)}>
                            {text}
                            </Tag>
                            {!text && (
                            <Button
                                shape="circle"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => setEditingKey(record.key)}
                            />
                        )}
                    </>
                );
            },
            width: 70
        },
        {
            title: (
                <span>
                钱包地址
                    <span onClick={toggleHideColumn} style={{ marginLeft: 8, cursor: 'pointer' }}>
                        {getEyeIcon()}
                    </span>
                </span>
            ),
            dataIndex: "address",
            key: "address",
            align: "center",
            render: (text, record) => {
                const [ensData, setEnsData] = useState(null);

                useEffect(() => {
                    if (record.ens) {
                        setEnsData(record.ens);
                    } else {
                        const fetchENS = async (address) => {
                            try {
                                const response = await fetch(`https://api.ensideas.com/ens/resolve/${address}`);
                                const data = await response.json();
                                setEnsData(data);
                                if (data) {
                                    record.ens = data;
                                }
                            } catch (error) {
                                console.error("Error fetching ENS:", error);
                                setEnsData(null);
                            }
                        };

                        fetchENS(record.address);
                    }
                }, [record.address]);

                if (hideColumn) {
                    return '***';
                }

                const displayText = ensData ? ensData.displayName : text;

                return (
                    <span 
                        title={record.address}
                        onMouseEnter={(e) => e.target.innerHTML = `${displayText} (${record.address})`}
                        onMouseLeave={(e) => e.target.innerHTML = displayText}
                    >
                        {displayText}
                    </span>
                );
            },
            width: 85
        },
        {
            title: "最后交易",
            dataIndex: "zks2_last_tx",
            key: "zks2_last_tx",
            align: "center",
            render: (text, record) => {
                let textColor = "inherit";
              
                if (text === null) {
                  return <Spin />;
                } else if (text?.includes("天") && parseInt(text) > 7) {
                    textColor = "red";
                } else {
                  textColor = "#1677ff";
                }
              
                return (
                  <a
                    href={"https://era.zksync.network/address/" + record.address}
                    target={"_blank"}
                    style={{ color: textColor }}
                  >
                    {text}
                  </a>
                );
              },
            width: 55
        },
        {
            title: <a href="https://defillama.com/chain/zkSync Era" style={{ color: 'white' }} 
                target="_blank" rel="noopener noreferrer">zkSyncEra Task List  [参考defillama TVL数据] <br/>🔴请注意，通过点击任务列表的超链接，您将离开本网页。我们建议您在访问这些外部链接之前，仔细阅读其网站的隐私政策和使用条款。我们不能控制这些网站的内容和安全性，并且不对其造成的任何损失或损害负责。

                在访问外部链接时，您需要自行评估潜在的风险。这些链接不构成对所链接网站内容的认可或支持。我们不对这些外部链接的准确性、内容、服务质量或安全性做任何承诺。
                
                我们建议您保持您的计算机和设备的安全性，使用防病毒软件和防火墙，并时刻注意潜在的网络钓鱼或恶意软件攻击。
                
                通过继续使用本网页并访问其中的超链接，您同意承担访问外部链接可能带来的一切风险。我们不对由此导致的任何损失或损害负责！</a>,
            key: "zks_era_group",
            className: "zks_era",
            children: [
                {
                    title: <a href="https://syncswap.xyz" target="_blank" rel="noopener noreferrer">Sync</a>,
                    dataIndex: "sync",
                    key: "sync",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.sync === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://app.mute.io/swap" target="_blank" rel="noopener noreferrer">Mute</a>,
                    dataIndex: "mute",
                    key: "mute",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.mute === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://www.okx.com/cn/web3/dex" target="_blank" rel="noopener noreferrer">OKX</a>,
                    dataIndex: "okx",
                    key: "okx",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.okx === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://swap-zksync.spacefi.io/#/swap" target="_blank" rel="noopener noreferrer">Spacefi</a>,
                    dataIndex: "spacefi",
                    key: "spacefi",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.spacefi === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://app.1inch.io" target="_blank" rel="noopener noreferrer">1inch</a>,
                    dataIndex: "_1inch",
                    key: "_1inch",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record._1inch === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://izumi.finance/trade/swap" target="_blank" rel="noopener noreferrer">izumi</a>,
                    dataIndex: "izumi",
                    key: "izumi",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.izumi === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://app.vesync.finance/swap" target="_blank" rel="noopener noreferrer">veSync</a>,
                    dataIndex: "veSync",
                    key: "veSync",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.veSync === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                // {
                //     title: <a href="https://app.rollup.finance/#/stake" target="_blank" rel="noopener noreferrer">rollup</a>,
                //     dataIndex: "rollup",
                //     key: "rollup",
                //     align: "center",
                //     render: (text, record) => (
                //         <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                //             {text === null ? <Spin /> : text}
                //         </span>
                //     ),
                //     width: 55
                // },
                {
                    title: <a href="https://app.mav.xyz/?chain=324" target="_blank" rel="noopener noreferrer">Mav</a>,
                    dataIndex: "mav",
                    key: "mav",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.mav === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://zks.network/" target="_blank" rel="noopener noreferrer">zns</a>,
                    dataIndex: "zns",
                    key: "zns",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.zns === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://zksync.velocore.xyz/swap" target="_blank" rel="noopener noreferrer">velo-v2</a>,
                    dataIndex: "velo",
                    key: "velo",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.velo === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://app.reactorfusion.xyz/" target="_blank" rel="noopener noreferrer">Reactor</a>,
                    dataIndex: "rf",
                    key: "rf",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.rf === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                // {
                //     title: <a href="https://app.eralend.com/" target="_blank" rel="noopener noreferrer">eraLend</a>,
                //     dataIndex: "eralend",
                //     key: "eralend",
                //     align: "center",
                //     filters: [
                //         {
                //           text: '未完成',
                //           value: 0,
                //         }
                //     ],
                //     onFilter: (value, record) => record.eralend === value,
                //     render: (text, record) => (
                //         <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                //             {text === null ? <Spin /> : text}
                //         </span>
                //     ),
                //     width: 55
                // },
                // {
                //     title: <a href="https://app.overnight.fi/stats?tabName=zksync" target="_blank" rel="noopener noreferrer">USD+</a>,
                //     dataIndex: "usdp",
                //     key: "usdp",
                //     align: "center",
                //     filters: [
                //         {
                //           text: '未完成',
                //           value: 0,
                //         }
                //     ],
                //     onFilter: (value, record) => record.usdp === value,
                //     render: (text, record) => (
                //         <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                //             {text === null ? <Spin /> : text}
                //         </span>
                //     ),
                //     width: 55
                // },
                {
                    title: <a href="https://app.openocean.finance/CLASSIC#/ZKSYNC/ETH/USDC" target="_blank" rel="noopener noreferrer">OOE</a>,
                    dataIndex: "ooe",
                    key: "ooe",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.ooe === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://dapp.ezkalibur.com/" target="_blank" rel="noopener noreferrer">eZK</a>,
                    dataIndex: "ezk",
                    key: "ezk",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.ezk === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://app.odos.xyz/" target="_blank" rel="noopener noreferrer">odos</a>,
                    dataIndex: "odos",
                    key: "odos",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.odos === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://mail.dmail.ai/presale/395788" target="_blank" rel="noopener noreferrer">dmail</a>,
                    dataIndex: "dmail",
                    key: "dmail",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.dmail === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: <a href="https://pancakeswap.finance/swap?chain=zkSync" target="_blank" rel="noopener noreferrer">cake</a>,
                    dataIndex: "pancake",
                    key: "pancake",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.pancake === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 55
                },
                {
                    title: '进度',
                    dataIndex: 'progress',
                    key: 'progress',
                    align: 'center',
                    sorter: (a, b) => a.progress - b.progress,
                    render: (text, record) => {
                      const items = ['sync', 'mute', 'okx', 'spacefi', '_1inch', 'izumi', 'zns',
                       'velo', 'rf', 'mav', 'veSync', 'ooe', 'ezk', 'odos', 'dmail', 'pancake']; // 'usdp','eralend',去除
                      const count = items.reduce((total, item) => {
                        if (record[item] > 0) {
                          return total + 1;
                        }
                        return total;
                      }, 0);
                      const percentage = (count / items.length) * 100;
                      record.progress = percentage;
                
                      const backgroundColor = `rgba(240, 121, 78, ${percentage / 100})`;
                
                      return {
                        children: <span>{text === null ? <Spin /> : `${percentage.toFixed(2)}%`}</span>,
                        props: {
                          style: {
                            background: backgroundColor,
                          },
                        },
                      };
                    },
                    width: 60,
                  },
            ],
        }
    ];

    return (
        <div>
            <Content>
                <Spin spinning={tableLoading}>
                    <Table
                        rowSelection={rowSelection}
                        dataSource={taskData}
                        pagination={false}
                        bordered={true}
                        style={{marginBottom: "0px", zIndex: 2}}
                        size={"small"}
                        columns={columns}
                        scroll={{
                            y: tableHeight
                          }}
                        footer={() => (
                            <Card>
                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: '10px'
                                }}>
                                    <Button type="primary" onClick={handleRefresh} loading={isLoading}
                                            size={"large"}
                                            style={{width: "20%"}} icon={<SyncOutlined/>}>
                                        {isLoading ? "正在刷新" : "刷新选中地址"}
                                    </Button>
                                </div>
                            </Card>
                        )
                        }
                    />
                </Spin>
            </Content>
        </div>
    );
}

export default ZksyncTasks;
