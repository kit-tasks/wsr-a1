cd geth
del geth /q /s
cd ..
geth -datadir .\geth init .\geth\genesis.json
geth --datadir .\geth\ --networkid 2304 --http --http.port 8545 --http.api "web3, eth, personal, admin, net" --allow-insecure-unlock --mine --miner.threads 2 console