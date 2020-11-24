#!/bin/sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. $DIR/data.sh
cd ZoKrates/target/release
./zokrates compute-witness -a 18 65  $age  $id
> result.txt
if [ $age -le 65  -a  $age -gt 18 ]
then 
	echo 1 >> result.txt
else 
	echo 0 >> result.txt
fi
./zokrates generate-proof
cd ..
cd ..
cd ..
cp ZoKrates/target/release/proof.json .
cp ZoKrates/target/release/result.txt .

