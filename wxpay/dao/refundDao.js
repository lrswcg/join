var query=require('../mysql_pool');
var sql={
	add:'insert into refundPost(out_trade_no,title,content,username,userid,total_fee,openid,status,createAt,editAt) value(?,?,?,?,?,?,?,?,?,?)',
	queryAll:'select * from refundPost',
	queryByTitle:'select * from refundPost where title=?',
	queryByOpenid:'select * from refundPost where openid=?',
	queryByStatus:'select * from refundPost where status=?',
	getByNo:'select*from refundPost where out_trade_no=?',
	update:'update refundPost set title=?,total_fee=?,content=?,status=?,editAt=? where out_trade_no=?',
	delete:'delete from refundPost where out_trade_no=?'
};
module.exports={
    add:function (params,callback) {
        query(sql.add,[params.out_trade_no,params.title,params.content,params.username,params.userid,params.total_fee,params.openid,params.status,params.createAt,params.editAt],function (err,result) {
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
        query(sql.update,[params.title,params.total_fee,params.content,params.status,params.editAt,params.out_trade_no],function (err,result) {
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
