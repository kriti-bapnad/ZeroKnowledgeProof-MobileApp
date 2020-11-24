var mysql= require('mysql');

var loginScheme= mysql.Scheme({
    id:{
        type:String,
        require= true
    },
    password:{
        type:String,
        require=true
    }
});

var authenticate= module.exports= mysql.model('authenticate', loginScheme);

module.exports.authenticate= function(login, callback){
    login.authenticate(login,callback)
}