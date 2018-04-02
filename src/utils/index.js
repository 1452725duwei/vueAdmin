export var HOST_URL = 'http://192.168.2.65:8080/shangcheng_admin';
import { Message } from 'element-ui';
var Cookies = require("js-cookie");
var CryptoJS = require("crypto-js");

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function formatTime(time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) { // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  }
}

var nonce='';
export function simplePostData(config) {
  var method = config.method
  if(!method) {
    method = "POST";
	}
	//生成签名
	var sign = generateSign(Cookies.get('tokenId'),nonce,Cookies.get("token"));
	//数据加密处理
	var data = config.data;
	if(config.encryptFunction != undefined){
		data = config.encryptFunction(data);
	}
	//head信息
//	var signConfig = {headers : {'Authorization' : $.cookie('userId')+';'+nonce+';'+sign }};
//	var httpConfig = $.extend(true, config.httpConfig, signConfig);
	//提交到服务器
	console.log(config);
	config.$http({
		method: method,
		url: config.url,
		data: data,
		headers: {
			'Authorization' : Cookies.get('tokenId')+'__'+nonce+'__'+sign
		},
		//withCredentials:true
	}).then(function(response) {
		//response {body,bodytext(string),headers,ok(true,false) status(200)statusText("ok"),url
		var errorCode = response.body.errorCode;
		if(errorCode == 0) {
			config.callbackFunction(response);
		} else {
			handleError(response,config.errorCallbackFunction,config.errorFlag);
		}
	},function(result,status,headers,request) {
		if(status == '401'){
			// 验证信息过期则重发请求
			if(headers('stale') == 'true'){
				saveNonce(status,headers);
				simplePostData(config);
			} else {
				// 验证错误则重新登录
				Message('您的登录已超时，请重新登录！');
				location.href="/login";
			}
		} else {
				Message('服务器错误，请联系管理员！');
		}
	})
}

/**
 * 对返回的错误做处理
 * @param {Object} result
 * @param {errorCallbackFunction} 错误处理方法,返回boolean，表示错误是否已经处理
 */
export function handleError(response,errorCallbackFunction,errorFlag){
	console.log(111);
	//若定义了其他错误处理方法则先运行此方法
	if(typeof(errorCallbackFunction)!='undefined'){
		var isHandled = errorCallbackFunction(response);
		if(isHandled && errorFlag) return;
	}
				
	var errorCode = response.body["errorCode"];
	var errorInfo = response.body["errorInfo"];
	
	switch (errorCode){
		//token不正确跳到登录页面
		case 10104: location.href = "login.html";break;
		//无权限显示无权限
		//case 20003: alert("对不起，您无该操作权限");break;
		//其他情况显示错误信息，无错误信息显示错误码
		default: 
			if(errorInfo !=null && errorInfo != "") {
				Message('错误: ' + errorInfo);
			} else {
				Message('错误: ' + errorCode);
			}
			break;
	}
}

/***
 * 获取随机数
 */
export function saveNonce(status,headers){
	nonce = getNonce(headers('authorization-info'));
	$.cookie('nonce', nonce);
}

/**
 * 生成签名
 */
export function generateSign(userId,nouce,token){
	return CryptoJS.SHA1(token + userId + ":" + nouce)
}

/**
 * 生成随机id
 */
export function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

/**
 * 根据响应头中的authorizationInfo获取nonce
 */
export function getNonce(authorization){
	return authorization.split("=")[1];
}

/**
 * 向url中添加签名信息
 */
export function getSignUrl(url){
	var sign = generateSign($.cookie('userId'),nonce,$.cookie("token"));
	return url+'?authorization='+$.cookie('userId')+';'+nonce+';'+sign;
}

/**
 * 判断对象是否为空
 * @param {Object} obj
 */
export function isEmpty(obj){
    for ( var name in obj ) {
        return false;
    }
    return true;
}

/**
 * 将空对象转为空字符串
 */
export function emptyToBlank(obj){
	if(isEmpty(obj)) return "";
	return obj;
}

/**
 * 将null及"null"字符串转为空字符串
 */
export function nullToBlank(obj){
	if(isEmpty(obj)) return "";
	if(obj=="null") return "";
	return obj;
}