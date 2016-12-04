var express = require('express');
var router = express.Router();
var refundDao=require('../dao/refundDao.js');
var moment=require('moment');

router.get('/refund/request',function(req,res,next){
	var params={};
	params.out_trade_no=req.query.out_trade_no;
	params.title=req.query.title+"-退款申请";
	res.render('refundPost',{title:'退款申请',params:params});
});

router.post('/refund/post',function(req.res,next){
	var refundPost={};
	refundPost.out_trade_no=req.body.out_trade_no;
	refundPost.title=req.body.title;
	refundPost.content=req.body.content;
	refundPost.username=req.body.username;
	refundPost.userid=req.body.userid;
	refundPost.status='申请中';
	refundPost.createAt=moment(Date.now()).format('YYYY-MM-DD HH:mm');
	refundPost.editAt=moment(Date.now()).format('YYYY-MM-DD HH:mm');
	refundDao.getByNo(params.out_trade_no,function(err,result){
		if(result){
			refund.update(params,function(err,result){
				if(err) console.log(err);
		                res.redirect('/refund/request/result');
			})
		}else{
			refundDao.add(params,function(err,result){
               			if(err) console.log(err);
                		res.redirect('/refund/request/result');
		        });
		}
		
	});
});

router.get('/refund/request/result',function(req,res,next){
	res.render('refundResult',{title:'申请结果',result:'申请成功'});
});
module.exports=router;
