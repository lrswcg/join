var config=require('../config');
var moment=require('moment');
var request=require('request');
var fs=require('fs');
var xml2js=require('xml2js');
var orderDao=require('../dao/orderDao');
var params={};
var refundParams={};
exports.wxpay={
    wxpayRequest:function (req,res) {
	var date=moment(Date.now()).format('YYYYMMDD');
        params.appid=config.appid;
        params.mch_id=config.mch_id;
        params.nonce_str=Math.random().toString(36).substr(2, 15);
        params.body=req.body.body;
        params.out_trade_no=date+Math.random().toString().substr(2, 10);
        params.total_fee=req.body.total_fee;
        params.spbill_create_ip=getClientIp(req);
        params.notify_url=config.notify_url;
        params.trade_type=config.trade_type;
        params.openid=req.body.openid;
        params.key=config.key;
        params.sign=paysignjsapi(params.appid,params.body,params.mch_id,params.nonce_str,params.notify_url,params.openid,params.out_trade_no,params.spbill_create_ip,params.total_fee,params.trade_type,params.key);
	params.username=req.body.username;
	params.phone=req.body.phone;
        var url = "https://api.mch.weixin.qq.com/pay/unifiedorder";
	var formData  = "<xml>";
        var timeStamp=Date.now()/1000;
        var notify_url=encodeURIComponent(params.notify_url);
        formData  += "<appid>"+params.appid+"</appid>";  //appid
        formData  += "<body>"+params.body+"</body>";
        formData  += "<mch_id>"+params.mch_id+"</mch_id>";  //商户号
        formData  += "<nonce_str>"+params.nonce_str+"</nonce_str>"; //随机字符串，不长于32位。
        formData  += "<notify_url>"+params.notify_url+"</notify_url>";
        formData  += "<openid>"+params.openid+"</openid>";
        formData  += "<out_trade_no>"+params.out_trade_no+"</out_trade_no>";
        formData  += "<spbill_create_ip>"+params.spbill_create_ip+"</spbill_create_ip>";
        formData  += "<total_fee>"+params.total_fee+"</total_fee>";
        formData  += "<trade_type>"+params.trade_type+"</trade_type>";
        formData  += "<sign>"+params.sign+"</sign>";
        formData  += "</xml>";
	console.log(formData);
        request({url:url,method:'POST',body: formData},function(err,response,body){
            if(!err && response.statusCode == 200){
                console.log(body);
                //签名
		xml2js.parseString(body,{explicitArray : false},function(err,result){
                	var json=result.xml;
			var prepay_id=json.prepay_id;
			var _paySignjs = paysignjs(params.appid,params.nonce_str,'prepay_id='+prepay_id,'MD5',timeStamp);
               		res.render('jsapipay',{appid:params.appid,nonce_str:params.nonce_str,prepay_id:prepay_id,_paySignjs:_paySignjs,timeStamp:timeStamp})
                });

                //res.render('jsapipay',{rows:body});
                //res.redirect(tmp3[0]);
            }
        });
    },
    cancel:function (req,res,next) {
        params={};
        res.redirect("/");
    },
    saveOrder:function () {
	var order={
		out_trade_no:params.out_trade_no,
		title:params.body,
		username:params.username,
		phone:params.phone,
		total_fee:params.total_fee,
		openid:params.openid,
		status:'已付款',
		createAt:moment(Date.now()).format('YYYY-MM-DD HH:mm'),
		editAt:moment(Date.now()).format('YYYY-MM-DD HH:mm'),

	};
	console.log(order);
        orderDao.add(order,function (err,result) {
		if(err) console.log(err);
		console.log(result);
        })
    },
    notify:function (req,res,next){
	/*var body;
	req.on('data',function(chunk){
		body+=chunk;
	})
	req.on('end',function(){
	    try{
	        body.toString('utf-8');
	        console.log(body);
	    }catch(e){
	        console.log(e);
	    }
	});*/
	console.log(req.body);
	var xml=req.body.xml;
	var sign=xml.sign;
	var return_code=xml.return_code;
	var result_code=xml.result_code;
	if(return_code=='SUCCESS'||result_code=='SUCCESS'){
	    	res.send('<xml> <return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
	}else{
	    	console.log('回调错误');
	}


    }
};

exports.refund={
	getRefundParams:function(req,res,next){
		var date=moment(Date.now()).format('YYYYMMDD');
		refundParams.appid=config.appid;
		refundParams.mch_id=config.mch_id;
		refundParams.nonce_str=Math.random().toString(36).substr(2, 15);
		refundParams.out_trade_no=req.query.out_trade_no;
		refundParams.out_refund_no='R'+date+Math.random().toString().substr(2, 10);
		refundParams.total_fee=req.query.total_fee;
		refundParams.refund_fee=req.query.refund_fee;
		refundParams.op_user_id=config.mch_id;
		refundParams.key=config.key;
		refundParams.sign=refundsign(refundParams.appid,refundParams.mch_id,refundParams.nonce_str,refundParams.op_user_id,refundParams.out_refund_no,refundParams.out_trade_no,refundParams.refund_fee,refundParams.total_fee,refundParams.key);
		res.render('refundconfirm',{});
	},
	test:function(req,res,next){
		var body='<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg> <appid><![CDATA[wx2bbd0d2a0c7e5fc1]]></appid><mch_id><![CDATA[1399979902]]></mch_id> <nonce_str><![CDATA[t3GbKJ7l5pLcDvFx]]></nonce_str> <sign><![CDATA[D598E45B77DEA434D6850855E808C791]]></sign><result_code><![CDATA[SUCCESS]]></result_code><transaction_id><![CDATA[4000312001201611159851437696]]></transaction_id> <out_trade_no><![CDATA[201611153893893312]]></out_trade_no><out_refund_no><![CDATA[R201611150103886937]]></out_refund_no><refund_id><![CDATA[2000312001201611150587502067]]></refund_id> <refund_channel><![CDATA[]]></refund_channel> <refund_fee>1</refund_fee> <coupon_refund_fee>0</coupon_refund_fee> <total_fee>1</total_fee> <coupon_refund_count>0</coupon_refund_count> <cash_refund_fee>1</cash_refund_fee></xml>';
		xml2js.parseString(body,{explicitArray : false},function(err,result){
                                        var json=JSON.stringify(result);
                                      
					console.log(result);
					console.log(result.xml);
					console.log(json);
			
                });
	
	},
	refundRequest:function(req,res,next){
		var url = "https://api.mch.weixin.qq.com/secapi/pay/refund";
        	var formData  = "<xml>";
        	var timeStamp=Date.now()/1000;
        	var notify_url=encodeURIComponent(params.notify_url);
        	formData  += "<appid>"+refundParams.appid+"</appid>";  //appid
        	formData  += "<mch_id>"+refundParams.mch_id+"</mch_id>";  //商户号
        	formData  += "<nonce_str>"+refundParams.nonce_str+"</nonce_str>"; //随机字符串，不长于32位
	        formData  += "<op_user_id>"+refundParams.op_user_id+"</op_user_id>";   
		formData  += "<out_refund_no>"+refundParams.out_refund_no+"</out_refund_no>";
        	formData  += "<out_trade_no>"+refundParams.out_trade_no+"</out_trade_no>";
        	formData  += "<refund_fee>"+refundParams.refund_fee+"</refund_fee>";
        	formData  += "<total_fee>"+refundParams.total_fee+"</total_fee>";
        	formData  += "<sign>"+refundParams.sign+"</sign>";
        	formData  += "</xml>";
        	console.log(formData);
		request({
			url:url,
			method:'POST',
			body: formData,
			agentOptions:{
				pfx:fs.readFileSync(config.PFX),
				passphrase:config.mch_id
			}}
		,function(err,response,body){
            		if(!err && response.statusCode == 200){
                		console.log(body);
                		xml2js.parseString(body,{explicitArray : false},function(err,result){
					var json=result.xml;
					var return_code=json.return_code;
					var result_code=json.result_code;
					if(return_code=='SUCCESS'){
						if(result_code=='SUCCESS'){
							orderDao.getByNo(refundParams.out_trade_no,function(err,result){
								if(err) console.log(err);
								console.log(result);
								result.editAt=moment(Date.now()).format('YYYY-MM-DD HH:mm');
								result.paystatus='已退款';
								result.refund_fee=json.refund_fee;
								orderDao.update(result,function(err,result){
									if(err) console.log(err);
								});
							});
							res.redirect('/');		
						}
						else{
							if(err_msg=='NOTENOUGH')
								res.send('账户余额不足');
							res.send('退款失败');	
						}
					}
				});
           		 }		
       		 });
    	},

}

function refundsign(appid,mch_id,nonce_str,op_user_id,out_refund_no,out_trade_no,refund_fee,total_fee,appkey) {
    var ret = {
        appid: appid,
        mch_id: mch_id,
        nonce_str: nonce_str,
	op_user_id:op_user_id,
        out_refund_no:out_refund_no,
        out_trade_no:out_trade_no,
        refund_fee:refund_fee,
        total_fee:total_fee,
    };
    var string = raw(ret);
    var key=appkey;
    string=string+"&key="+key;
    console.log(string);
    var crypto = require('crypto');
    return crypto.createHash('md5').update(string,'utf8').digest('hex').toUpperCase();
}



function paysignjsapi(appid,body,mch_id,nonce_str,notify_url,openid,out_trade_no,spbill_create_ip,total_fee,trade_type,appkey) {
    var ret = {
        appid: appid,
        body: body,
        mch_id: mch_id,
        nonce_str: nonce_str,
        notify_url:notify_url,
        openid:openid,
        out_trade_no:out_trade_no,
        spbill_create_ip:spbill_create_ip,
        total_fee:total_fee,
        trade_type:trade_type,
    };
    var string = raw(ret);
    var key=appkey;
    string=string+"&key="+key;
    console.log(string);
    var crypto = require('crypto');
    return crypto.createHash('md5').update(string,'utf8').digest('hex').toUpperCase();
}

function paysignjs(appid,nonceStr,package,signType,timeStamp) {
    var ret = {
        appId: appid,
        nonceStr: nonceStr,
        package:package,
        signType:signType,
        timeStamp:timeStamp
    };
    var string = raw1(ret);
    var key = config.key;
    string = string + '&key='+key;
    console.log(string);
    var crypto = require('crypto');
    return crypto.createHash('md5').update(string,'utf8').digest('hex').toUpperCase();
}

function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

function raw1(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

function getXMLNodeValue(node_name,xml){
    try{
	console.log(xml);
    	var tmp = xml.split("<"+node_name+">");
    	var _tmp = tmp[1].split("</"+node_name+">");
    	return _tmp[0];
    }
    catch(err){
    	console.log(err)
    }
}

function getClientIp(req){
    var ipAddress;
    var forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
}
