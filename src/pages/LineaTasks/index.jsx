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
    getLineaTasks
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

function LineaTasks() {
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
    const [apiKey, setApiKey] = useState(localStorage.getItem('linea_api_key'));

    const horizonContract = "0x272e156df8da513c69cb41cc7a99185d53f926bb";
    const lineabankContract = "0x009a0b7c38b542208936f1179151cd08e2943833";
    const syncswapContract = "0x80e38291e06339d10aab483c65695d004dbd5c69";
    const iziswapContract = "0x032b241De86a8660f1Ae0691a4760B426EA246d7";
    const echodexContract = "0xc66149996d0263C0B42D3bC05e50Db88658106cE";
    const leetswapContract = "0xd3Ea3BC1F5A3F881bD6cE9761cbA5A0833a5d737";
    const kyberswapContract = "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5";
    const velocoreContract = "0x1d0188c4B276A09366D05d6Be06aF61a73bC7535";
    const memdiContract = "0xAd7f33984bed10518012013D4aB0458D37FEE6F3";

    useEffect(() => {
        const storedApiKey = localStorage.getItem('linea_api_key');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
    }, []);

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
                        const result = checkTaskStatus(item.address, horizonContract);
                        item.horizon = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, lineabankContract);
                        item.bank = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, syncswapContract);
                        item.sync = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, iziswapContract);
                        item.izi = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, echodexContract);
                        item.echo = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, leetswapContract);
                        item.leet = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, kyberswapContract);
                        item.kyber = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, velocoreContract);
                        item.velo = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = checkTaskStatus(item.address, memdiContract);
                        item.memdi = result;
                        resolve();
                    });
                });
            }
            await Promise.all(promisesQueue.map((promise) => promise()));
            setTaskData([...newData]);
            localStorage.setItem('linea_addresses', JSON.stringify(newData));
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
                    const result = await getLineaTasks(item.address, apiKey);
                    if(result[0].includes("Error")) {
                        continue;
                    }
                    const contractAddresses = result[0];
                    taskContractsMap.set(item.address, contractAddresses);
                    setTaskContracts(taskContractsMap);
                    await new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, 200);
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, horizonContract);
                            item.horizon = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, lineabankContract);
                            item.bank = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, syncswapContract);
                            item.sync = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, iziswapContract);
                            item.izi = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, echodexContract);
                            item.echo = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, leetswapContract);
                            item.leet = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, kyberswapContract);
                            item.kyber = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, velocoreContract);
                            item.velo = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = checkTaskStatusByArray(contractAddresses, memdiContract);
                            item.memdi = result;
                            resolve();
                        });
                    });
                }
            }

          await Promise.all(promisesQueue.map(promise => promise()));
          
          setTaskData([...newData]);
          localStorage.setItem('linea_addresses', JSON.stringify(newData));
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
        const storedAddresses = localStorage.getItem('linea_addresses');
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
              const promise = getLineaTasks(address, apiKey)
                .then(result => {
                    if(result[0].includes("Error")) {
                        return;
                    }
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
              const linea_timestamps = timestampsArray.flat()
              localStorage.setItem('linea_timestamps', JSON.stringify(linea_timestamps));
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
                            localStorage.setItem('linea_addresses', JSON.stringify(data));
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
            dataIndex: "linea_last_tx",
            key: "linea_last_tx",
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
                    href={"https://lineascan.build/address/" + record.address}
                    target={"_blank"}
                    style={{ color: textColor }}
                  >
                    {text}
                  </a>
                );
              },
            width: 65
        },
        {
            title: <a href="https://defillama.com/chain/linea" style={{ color: 'white' }} 
                target="_blank" rel="noopener noreferrer">Linea Task List  [参考defillama TVL数据] <br/>🔴请注意，通过点击任务列表的超链接，您将离开本网页。我们建议您在访问这些外部链接之前，仔细阅读其网站的隐私政策和使用条款。我们不能控制这些网站的内容和安全性，并且不对其造成的任何损失或损害负责。

                在访问外部链接时，您需要自行评估潜在的风险。这些链接不构成对所链接网站内容的认可或支持。我们不对这些外部链接的准确性、内容、服务质量或安全性做任何承诺。
                
                我们建议您保持您的计算机和设备的安全性，使用防病毒软件和防火墙，并时刻注意潜在的网络钓鱼或恶意软件攻击。
                
                通过继续使用本网页并访问其中的超链接，您同意承担访问外部链接可能带来的一切风险。我们不对由此导致的任何损失或损害负责！</a>,
            key: "zks_era_group",
            className: "zks_era",
            children: [
                {
                    title: <a href="https://kyberswap.com/swap/linea" target="_blank" rel="noopener noreferrer">KyberSwap</a>,
                    dataIndex: "kyber",
                    key: "kyber",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.kyber === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 65
                },
                {
                    title: <a href="https://linea.velocore.xyz/swap" target="_blank" rel="noopener noreferrer">velo</a>,
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
                    width: 65
                },
                {
                    title: <a href="https://mendi.finance/" target="_blank" rel="noopener noreferrer">Memdi</a>,
                    dataIndex: "memdi",
                    key: "memdi",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.memdi === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 65
                },
                {
                    title: <a href="https://app.horizondex.io/swap" target="_blank" rel="noopener noreferrer">horizondex</a>,
                    dataIndex: "horizon",
                    key: "horizon",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.horizon === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 65
                },
                {
                    title: <a href="https://lineabank.finance/bank" target="_blank" rel="noopener noreferrer">LineaBank</a>,
                    dataIndex: "bank",
                    key: "bank",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.bank === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 65
                },
                {
                    title: <a href="https://syncswap.xyz/" target="_blank" rel="noopener noreferrer">syncSwap</a>,
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
                    width: 65
                },
                {
                    title: <a href="https://izumi.finance/trade/swap" target="_blank" rel="noopener noreferrer">iZiSwap</a>,
                    dataIndex: "izi",
                    key: "izi",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.izi === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 65
                },
                {
                    title: <a href="https://www.echodex.io/swap" target="_blank" rel="noopener noreferrer">EchoDEX</a>,
                    dataIndex: "echo",
                    key: "echo",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.echo === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 65
                },
                {
                    title: <a href="https://linea.leetswap.finance/#/swap" target="_blank" rel="noopener noreferrer">leetSwap</a>,
                    dataIndex: "leet",
                    key: "leet",
                    align: "center",
                    filters: [
                        {
                          text: '未完成',
                          value: 0,
                        }
                    ],
                    onFilter: (value, record) => record.leet === value,
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                    ),
                    width: 65
                },
                {
                    title: '进度',
                    dataIndex: 'progress',
                    key: 'progress',
                    align: 'center',
                    sorter: (a, b) => a.progress - b.progress,
                    render: (text, record) => {
                      const items = ['horizon', 'bank', 'sync', 'izi', 'echo', 'leet', 'kyber', 'velo', 'memdi'];
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
                    width: 65,
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
                        // sticky
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

export default LineaTasks;
