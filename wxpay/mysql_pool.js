var mysql=require("mysql");
var pool=mysql.createPool({
    host:'123.207.101.166',
    user:'root',
    password:'1013',
    database:'laravel',
    port:3306
});
var query=function (sql,args,callback) {
    pool.getConnection(function (err,conn) {
        if(err)
            callback(err,null);
        else{
            if (!args){
                conn.query(sql,function (err,results) {
                    if(err)
                        callback(err,null);
                    else
                        callback(err,results);
                });

            }
            else{
                conn.query(sql,args,function (err,results) {
                    if(err)
                        callback(err,null);
                    else
                        callback(err,results);
                });

            }
        }
        conn.release();
    })
};

module.exports=query;
