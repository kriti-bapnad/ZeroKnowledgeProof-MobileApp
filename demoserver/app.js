var express= require('express');
var app= express();
var cors = require('cors');
var bodyParser= require('body-parser');
var mysql= require('mysql');
var lzstring= require('lz-string');

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
app.use(cors());

var mysqlConf= mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'new_database'
})
mysqlConf.connect();
app.listen('3000');

app.post('/authenticate', function(req, res){
    //sql query to get data using id
    mysqlConf.query('SELECT * FROM data WHERE id=?',[req.body.id],(err, rows)=>{
        res.setHeader("Content-Type", "text/html");
        var collection={};
        collection.output =false;
        if(!err){
            if(rows.length==1){
                if(req.body.password== rows[0].password){
                    //if password matches with the password saved in database return true;
                    collection.output=true;
                    collection.name=rows[0].name;
                }
            }
        }
        else{
            console.log(err);
        }
        res.send(collection);
    })
});

app.post('/authenticate/verifier', function(req, res){
    //sql query to get data using id
    mysqlConf.query('SELECT * FROM verifierData WHERE id=?',[req.body.id],(err, rows)=>{
        res.setHeader("Content-Type", "text/html");
        var output =false;
        if(!err){
            if(rows.length==1){
                if(req.body.password== rows[0].password){
                    //if password matches with the password saved in database return true
                    output=true;
                }
            }
        }
        else{
            console.log(err);
        }
        res.send(output);
    })
});

app.post('/generateQr', function(req,res){
    var id= req.body.id;
    const fs = require('fs');
    var output="";
    var temp="";
    //sql query to get data using id
    mysqlConf.query('SELECT * FROM data WHERE id=?',[id],(err, row)=>{
        if(!err){
            //caluculating actual age using data of birth and current date
            var age1;
            var today = new Date();
            var birthDate = new Date(row[0].date_birth);
            var age1 = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age1--;
            }
            //storing age in data.sh file
			fs.writeFile('data.sh', '', function(){console.log(age1)});
            fs.appendFile('data.sh',"age="+age1 +"\n", (err)=>{
			    if(err){
				    throw err;
			    }
			})
			fs.appendFile('data.sh', "id="+ id+"\n", (err)=>{
				if(err){
        				throw err;
				}
            })
            //running proof.sh shell script to generate proof.json and result.txt file using data save in data.sh file
		    const exec = require('child_process').exec;
            const myShellScript = exec('sh proof.sh');
            // myShellScript.stdout.on('data', (data)=>{
            //     //console.log(data); 
            // });
            // myShellScript.stderr.on('data', (data)=>{
            //     //console.error(data);
            // });
            myShellScript.on('close', d => {
                //reading result.txt file for actual result
                fs.readFile('result.txt','utf-8',(err, data)=>{
                    if(!err){
                    output=data.charAt(0);
                    console.log(output);
                    }
                });
                //reading proof.json file 
                 fs.readFile('proof.json', (err, data) => {
                    if (err) throw err;
                    let proof = JSON.parse(data);
                    for(var i=0; i<5; i++){
                        temp+=proof.inputs[i];
                        temp+="z";
                    }
                    //convert proof into string
                    temp+=proof.proof.a[0];
                    temp+="z";
                    temp+=proof.proof.a[1];
                    temp+="z";
                    temp+=proof.proof.b[0][0];
                    temp+="z";
                    temp+=proof.proof.b[0][1];
                    temp+="z";
                    temp+=proof.proof.b[1][0];
                    temp+="z";
                    temp+=proof.proof.b[1][1];
                    temp+="z";
                    temp+=proof.proof.c[0];
                    temp+="z";
                    temp+=proof.proof.c[1];
                    temp+="z";
                    temp+=output;
                     //compressing proof
                     let proof1=lzstring.compressToEncodedURIComponent(temp);
                     console.log(temp);
                     console.log(proof1);
                     res.json(proof1)
                });
            })
        }
    })
    
});

app.post('/verifyQr', function(req,response){
    var temp= req.body.proof;
    console.log(temp);
    //decompressing proof
    var proof=lzstring.decompressFromEncodedURIComponent(temp);
    console.log(proof);
    var input;
    var a;
    var b;
    var c;
    var result;
    var collection={};
    collection.verified=false;
    collection.valid=false;
    //console.log(proof);
    //converting string into arrays formate
    if(proof!=null && proof.length==872){
    var decodeArray= proof.split("z");
    input=[decodeArray[0],decodeArray[1],decodeArray[2],decodeArray[3],decodeArray[4]];
    a=[decodeArray[5],decodeArray[6]];
    b=[[decodeArray[7],decodeArray[8]],[decodeArray[9],decodeArray[10]]];
    c=[decodeArray[11],decodeArray[12]];
    result=decodeArray[13].toString().charAt(0);
    const web= require('web3');
    const provider = new web.providers.HttpProvider("http://18.223.168.82:30545");
    const web3= new web(provider);
    //setting up web3 for connection
    web3.eth.net.isListening()
    .then(() => console.log('web3 is connected'))
    .catch(e => console.log('Wow. Something went wrong'));
    const abi=[
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "string",
              "name": "s",
              "type": "string"
            }
          ],
          "name": "Verified",
          "type": "event"
        },
        {
          "constant": false,
          "inputs": [
            {
              "internalType": "uint256[2]",
              "name": "a",
              "type": "uint256[2]"
            },
            {
              "internalType": "uint256[2][2]",
              "name": "b",
              "type": "uint256[2][2]"
            },
            {
              "internalType": "uint256[2]",
              "name": "c",
              "type": "uint256[2]"
            },
            {
              "internalType": "uint256[5]",
              "name": "input",
              "type": "uint256[5]"
            }
          ],
          "name": "verifyTx",
          "outputs": [
            {
              "internalType": "bool",
              "name": "r",
              "type": "bool"
            }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }
    ];
    //contract address
    const address= "0x7f0483Ef00f0d9198756E4852cC3D83e23eD7740";
    //accesing contract using address and abi
    const contract= new web3.eth.Contract(abi,address);
    //verifying proof using verifyTx function
    contract.methods.verifyTx(a,b,c,input).call((err, response1)=> {
    if(!err){
        console.log(response1);
        collection.verified=response1;
        if(result=='1'){
            collection.valid=true;
        }  
    }
    else{
        console.log(err); 
    }
    response.json(collection);
    });
    }
    else{
        response.json(collection);
    }
});

app.post('/profileGenerate',function(req,response){
    var id = req.body.id;
    let collection={};
    mysqlConf.query('SELECT * FROM data WHERE id=?',[id],(err, row)=>{
        if(!err){
            collection.id=id;
            collection.dateOfBirth=row[0].date_birth;
            collection.address=row[0].address;
            collection.validity=row[0].validity;
            collection.name=row[0].name;
            response.json(collection)
        }
    })
});

console.log("server started on 3000");


