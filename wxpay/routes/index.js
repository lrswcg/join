var express = require('express');
var router = express.Router();
var wxpay=require('./wxpay');
var mysql=require('../mysql_pool')
var pay=wxpay.wxpay;
var refund=wxpay.refund;
/* GET home page. */
router.get('/addOrder',function (req,res,next) {
    res.render("orderPage",{});
});
router.post('/addOrder',pay.wxpayRequest);
router.get('/',function (req,res,next) {
    res.render("index",{});
});
router.get('/pay/notify',function(req,res,next){
	res.send('');
});
router.post('/pay/notify',pay.notify);
router.get('/pay/result/:result',function(req,res,next){
	var result=req.params.result;	
	if(result=='success'){
		pay.saveOrder();
		res.send(''+req.params.result);
	}else{
		pay.cancel(req,res,next);
	}
});
router.get('/refund',refund.getRefundParams);
router.get('/refund/confirm',refund.refundRequest);
router.get('/test',refund.test);
module.exports = router;
