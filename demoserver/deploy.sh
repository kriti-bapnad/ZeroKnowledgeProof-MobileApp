
#!/bin/bash
git clone https://github.com/ZoKrates/ZoKrates
cd ZoKrates
cargo +nightly build --release
cd ..
cp prime.code ZoKrates/target/release
cd ZoKrates/target/release
sudo npm install -g truffle ganache-cli live-server
touch result.txt
mkdir temp
cd temp
truffle init
cd ..
./zokrates compile -i prime.code
mv out.ztf out.code
./zokrates setup
./zokrates export-verifier
cp verifier.sol temp/contracts
cp verifier.sol temp
cd ..
cd ..
cd ..
cp truffle-config.js ZoKrates/target/release/temp
cp 2_verifier.js ZoKrates/target/release/temp/migrations
cd ZoKrates/target/release/temp
truffle compile
truffle migrate
