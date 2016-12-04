var query=require('../mysql_pool');
var sql={
	add:'INSERT INTO orders(out_trade_no,title,username,phone,total_fee,refund_fee,openid,paystatus,createAt,editAt) VALUES(?,?,?,?,?,?,?,?,?,?)',
	queryAll:'select * from orders',
	queryByTitle:'select * from orders where title=?',
	queryByOpenid:'select * from orders where openid=?',
	queryByStatus:'select * from orders where paystatus=?',
	getByNo:'select*from orders where out_trade_no=?',
	update:'update orders set title=?,total_fee=?,refund_fee=?,openid=?,paystatus=?,editAt=? where out_trade_no=?',
	delete:'delete from orders where out_trade_no=?'
};
module.exports={
    add:function (params,callback) {
        query(sql.add,[params.out_trade_no,params.title,params.username,params.phone,params.total_fee,'0',params.openid,params.status,params.createAt,params.editAt],function (err,result) {
            if(err) callback(err,null);
            else {
                callback(err,result);
            }
        })
    },
    delete:function (id,callback) {
        query(sql.delete, [id], function (err, result) {
            if (err) callback(err, null);
            else {
                callback(err, result);
            }
        })
    },
    queryAll:function (callback) {
        query(sql.queryAll, function (err, results) {
            if (err) callback(err, null);
            else {
                callback(err, results);
            }
        })
    },
    update:function (params,callback) {
        query(sql.update,[params.title,params.total_fee,params.refund_fee,params.openid,params.paystatus,params.editAt,params.out_trade_no],function (err,result) {
            if (err) callback(err,null);
            else {
                callback(err,result);
            }
        })
    },
    getByNo:function (id,callback) {
        query(sql.getByNo, [id], function (err, results) {
            if (err) callback(err, null);
            else {
                callback(err, results[0]);
            }
        })
    },
    queryOpt:function (key,value,callback) {
        var opt;
	if(key=='title')
		opt=sql.queryByTitle;
	else if(key=='openid')
		opt=sql.queryByOpenid;
	else if(key=='status')
		opt=sql.queryByStatus;
        query(opt,[value],function (err,results) {
            if(err) callback(err,null);
            else callback(err, results);
        });
    }
};
