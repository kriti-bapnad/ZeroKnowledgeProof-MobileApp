
module.exports = {
  

  networks: {
   	development:{
		host:"18.223.168.82",
		port:"30545",
		network_id:"*",
		gas: 3348175	
	}
  },

  mocha: {
    
  },

  
  compilers: {
    solc: {
      	version:"^0.5.0",
	docker: false
    }
  }
}
