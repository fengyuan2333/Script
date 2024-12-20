/*



微博超话签到脚本
作者：fengyuan2333
github:https://github.com/fengyuan2333
更新时间: 2024/12/20
脚本兼容: QuantumultX, Surge4, Loon, JsBox, Node.js


获取Cookie说明：
ios打开微博轻享版，并点到超话界面，提示保存cookie成功即可继续。



脚本将在每天上午9:00执行, 您可以修改执行时间。

如果使用Node.js, 需自行安装'request'模块. 例: npm install request -g

Node.js环境变量相关：
Cookie：IQIYI_COOKIE
Debug调试：IQIYI_DEBUG
Bark通知推送Key：BARK_PUSH
Bark服务端(默认官方)：BARK_SERVER


JsBox, Node.js用户获取Cookie说明：
方法一手机：开启抓包, 打开微博轻享版 ——》 关注的超话 ， 返回抓包APP搜索URL关键字 api/weibo.cn/2/cardlist 复制链接填入以下脚本变量或环境变量中即可

*/





let API_URL = "https://api.weibo.cn/2/cardlist";
let SIGN_URL = "https://api.weibo.cn/2/page/button";
// let headers1 = {
//     "Accept": "*/*",
//     "User-Agent": "Weibo/81434 (iPhone; iOS 17.0; Scale/3.00)",
//     "SNRT": "normal",
//     "X-Sessionid": "6AFD786D-9CFA-4E18-BD76-60D349FA8CA2",
//     // "Accept-Encoding": "gzip, deflate",
//     "Accept-Encoding": "",
//     "X-Validator": "QTDSOvGXzA4i8qLXMKcdkqPsamS5Ax1wCJ42jfIPrNA=",
//     "Host": "api.weibo.cn",
//     "x-engine-type": "cronet-98.0.4758.87",
//     "Connection": "keep-alive",
//     "Accept-Language": "en-US,en",
//     "cronet_rid": "6524001",
//     "Authorization": "",
//     "X-Log-Uid": "5036635027",
// };

let headers1={  'sec-fetch-dest':'document',
    'accept-language':'zh-CN,zh-Hans;q=0.9',
    'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-encoding':'gzip, deflate, br',
    'sec-fetch-site':'none',
    'sec-fetch-mode':'navigate'};

var cookie='';

var barkKey = ''; //Bark APP 通知推送Key

var barkServer = ''; //Bark APP 通知服务端地址(默认官方)



/*********************
QuantumultX 远程脚本配置:
**********************
[task_local]
# 微博超话签到
0 9 * * * https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/weibo_sign/weibo_sign.js

[rewrite_local]
# 获取Cookie
^https?://m?api\.weibo\.c(n|om)\/2\/(cardlist) url script-request-header https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/weibo_sign/weibo_sign.js

[mitm]
hostname= api.weibo.cn

**********************
Surge 4.2.0+ 脚本配置:
**********************
[Script]
微博超话签到 = type=cron,cronexp=0 9 * * *,timeout=120,script-path=script-request-header https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/weibo_sign/weibo_sign.js

微博超话获取Cookie = type=http-request,pattern=^https?://m?api\.weibo\.c(n|om)\/2\/(cardlist),script-path=script-request-header https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/weibo_sign/weibo_sign.js

[MITM]
hostname= api.weibo.cn

************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# 微博超话签到
cron "0 9 * * *" script-path=https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/weibo_sign/weibo_sign.js

# 获取Cookie
http-request ^https?://m?api\.weibo\.c(n|om)\/2\/(cardlist) script-path=https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/weibo_sign/weibo_sign.js

[Mitm]
hostname= api.weibo.cn

*/



var LogDetails = false; // 响应日志

var pushMsg = [];



var $nobyda = nobyda();

(async () => {


    cookie = cookie || $nobyda.read("CookieWeiBo")
  LogDetails = $nobyda.read("WeiBo_LogDetails") === "true" ? true : LogDetails
  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    cookie = cookie || process.env.WEIBO_COOKIE;
    LogDetails = LogDetails || process.env.WEIBO_DEBUG;
    barkKey = barkKey || process.env.BARK_PUSH;
    barkServer = barkServer || process.env.BARK_SERVER;
  }



  if ($nobyda.isRequest) {
    GetCookie()
  } else if (cookie) {
    if (cookie.includes("gsid")){



var succeeded=false;
var jsonParams = urlParamsToJson(cookie);
var username='';
var username_return={'issuccess':false};

var message_to_push = "";
while (succeeded==false){
    try {

var username_return= await get_username_wait(jsonParams['str']);

var isskip=false;

if (username_return['issuccess']==true){
    username=username_return['username'];


}else{
    isskip=true;
    break;

}

// username= await get_username_wait(jsonParams['str']);


var since_id=await get_since_id(jsonParams['str']);

jsonParams['json']['count']='1000';
jsonParams['json']['page']='1';
headers1['Authorization']=generate_authorization(jsonParams['json']);

var jsonParams2=ParamsJsonUpdate(jsonParams);


while(isskip==false){

                // # 重置 output 为空字符串
                var output = "";
                // # 假设您有一个函数 get_topics 来获取主题列表
                var topics = await get_topics(jsonParams2['str'], headers1);
                // console.log(topics);
                var isjump=false;
                for (let key in topics) {
                    if(topics[key]['sign_action']!=null){
                        // console.log(topics[key]);
                        // console.log('说明需要签到，不跳过');
                        isjump=true;
                    }
                    else{
                        // console.log('说明无需签到，跳过');
                    }
                }
                if(isjump==false){
                    // console.log('跳过了');
                    break;
                }
                for (let key in topics) {
                    output +='超话标题:'+topics[key]['title']+"状态:"+topics[key]['sign_status'];
                }
                // console.log(111);
                for (let key in topics) {
                    if(topics[key]['sign_action']!=null){
                        // console.log('进入签到================')
                        var action=topics[key]['sign_action'];
                        var title=topics[key]['title'];
                        var message=await sign_topic(title,action,jsonParams2['str']);
                        console.log('延迟测试2秒');

                        $nobyda.sleep(2000);
                        console.log('2秒完成');
                        message_to_push += message+'\n';
                    }
                }
                }
succeeded=true;
                // console.log('跳出循环');

// print('微博签到结果',message_to_push)
    console.log('微博签到结果');
console.log(message_to_push);






    }catch(error){
    console.log('出错,等待60秒');
    console.log(error);
    await new Promise(r => setTimeout(r, 60000));
    console.log('60秒等待完成');
    }
}


if(username_return['issuccess']){
    $nobyda.notify("微博超话签到执行完成", "用户名："+username, message_to_push);
}else{
    $nobyda.notify("微博超话签到执行失败", '', username_return['errmsg']);
}

        await $nobyda.time();
    } else {
      console.log(`Cookie缺少关键值，需重新获取`)
    }
  } else {
    $nobyda.notify("微博超话签到", "", "签到终止, 未获取Cookie");
  }
})().finally(() => {
  $nobyda.done();
})

// # 提取cookie中的gsid
function generate_authorization(cookie){
    // gsid = cookie.get("gsid")
    // if gsid is not None:
    //     return f"WB-SUT {gsid}"
    // else:
    //     return None
    var gsid=cookie['gsid'];
    return('WB-SUT '+gsid)
}

//提取username
function get_username_wait(params){
  return new Promise(resolve => {

      var URL = {
          url:'https://api.weibo.cn/2/profile/me?'+params,
          headers:headers1,
      }
      var returnmsg={
          issuccess:false,
              username:''
      }

    $nobyda.get(URL, function (error, response, data) {
    var username1='';

      const Details = LogDetails ? `msg:\n${data || error}` : '';
      try {
        if (error) throw new Error(`请求失败`);
        const obj = JSON.parse(data);
            try{
                username1=obj['mineinfo']['screen_name'];
                returnmsg['issuccess']=true;
                returnmsg['username']=username1;
                taskListMsg='获取成功';

            } catch(error){

                taskListMsg='获取失败';
                returnmsg['errmsg']=obj['errmsg'];



            }

      } catch (e) {
        taskListMsg = `${e.message || e} ‼️`;
        console.log('错误');
        console.log(taskListMsg);
      }

        console.log('用户名:'+username1);

      resolve(returnmsg);
    })
  })


}





// # 获取get_since_id
function get_since_id(params, headers){
  return new Promise(resolve => {
      var URL = {
            url:API_URL+"?"+params,
            headers:headers1
      }

    $nobyda.get(URL, function (error, response, data) {
    var username='';

      const Details = LogDetails ? `msg:\n${data || error}` : '';
      try {
        if (error) throw new Error(`请求失败`);

        const obj = JSON.parse(data);

      } catch (e) {
        // taskListMsg = `${e.message || e} ‼️`;
        console.log('错误');
        console.log(taskListMsg);
      }
        // console.log('since_id 完成');
      resolve();
    })
  })









}




// # 获取超话列表
function get_topics(params){

    return new Promise(resolve => {


        var URL={
        url:API_URL+'?'+params,
            headers:headers1
    }

     $nobyda.get(URL, function (errormsg, response, data) {
         // console.log(response.statusCode);
         // console.log(11);
        if(errormsg!==null){
        console.log('失败:'+errormsg)
        }else if (response.statusCode== 200) {
            var datas=JSON.parse(data);
            var cards=datas['cards'];


            var topics = [];
            for (let key in cards) {
                if  (cards[key]['card_type']=='11'){
                    var card_group = cards[key]["card_group"];
                    for (let key in card_group) {

                        if(card_group[key]['card_type']=='8'){
                            var sign_action = null;


                            // console.log('看次数===========================');
                            if (card_group[key]['buttons'].length>0){
                                var button=card_group[key]["buttons"][0];
                                if(button['params']){

                                    var sign_action=button["params"]["action"];
                                }
                                else{

                                    button['params'];
                                }

                            }
                        var topic={
                        "title": card_group[key]["title_sub"],
                        "desc": card_group[key]["desc1"],
                        // "sign_status": item.get("buttons", [{}])[0].get("name", ""),
                        "sign_status": card_group[key]["buttons"][0]['name'],
                        "sign_action": sign_action

                        }
                        topics.push(topic);

                        }

                    }


                }

            }

            var output='';
            for (let key in topics) {
            // output += "超话标题:'{}'，状态:'{}'\n".format(topic["title"], topic["sign_status"])
                output+='超话标题:'+topics[key]['title']+',状态:'+topics[key]['sign_status']+'\n';

            }

            // console.log('超话状态');
            // console.log(topics);
console.log(output);

            // return topics;
            resolve(topics);


        }else{
            console.log('获取超话列表出现错误');
            // console.log(response);

            console.log(response);
            console.log('response===========');

            console.log(data);
            console.log('data==============');


        }
        // return '1';
        //  console.log('超话列表获取出错');
        resolve()
    });



     })


}

// # 超话签到
function sign_topic(title, action, params) {
  return new Promise(resolve => {

      // var URL = {
      //     url:'https://api.weibo.cn/2/profile/me?'+params,
      //     headers:headers1,
      // }

    message = "";
    // action = re.search(r"request_url=(.+)", action).group(1)
    action = action.replace('/2/page/button?', '&');



    URL = {
        url: SIGN_URL + "?" + params + action,
        headers: headers1
    }
    $nobyda.get(URL, function (errormsg, response, data) {
        if (errormsg !== null) {
            console.log('失败:' + errormsg)
        } else if (response.statusCode == 200) {
            // console.log(data);
            var datas = JSON.parse(data);
            // console.log(datas['mineinfo']['screen_name']);
            if (datas['msg'] == '已签到') {
                var qd_output = "超话标题:" + title + "，状态:'签到成功！";
                console.log(qd_output);
                message += qd_output;
            } else {
                console.log('签到失败!');
            }
            // return message;
            resolve(message);

        } else {
            console.log('出现错误');
            console.log(response);
        }
        resolve();
    });


});

}


function GetCookie() {
  if (!$request.url.includes("weibo.cn")) {
    $nobyda.notify(`写入微博Cookie失败`, "", "请更新脚本配置(URL正则/MITM)");
    return
  }
  var CKA = $request.url;//当前请求cookie
  var Weibo = CKA && CKA.includes("gsid=") && CKA;//看cookie是否包含值
  var RA = $nobyda.read("CookieWeiBo")//老的cookie
  if (CKA && Weibo) {
    if (RA != CKA) {
      var OldTime = $nobyda.read("CookieWeiBoTime")
        //写入COOKIE
      if (!$nobyda.write(Weibo, "CookieWeiBo")) {
        $nobyda.notify(`${RA ? `更新` : `首次写入`}微博超话签到Cookie失败‼️`, "", "")
      } else {
            //秒
        if (!OldTime || OldTime && (Date.now() - OldTime) / 1000 >=1) {
          $nobyda.write(JSON.stringify(Date.now()), "CookieWeiBoTime")
          $nobyda.notify(`${RA ? `更新` : `首次写入`}微博超话签到Cookie成功 🎉`, "", "")
        } else {
          console.log(`\n更新微博超话Cookie成功! 🎉\n检测到频繁通知, 已转为输出日志`)

        }
      }
    } else {
      console.log("\n微博超话-与本机储存Cookie相同, 跳过写入 ⚠️")
    }
  } else {
    $nobyda.notify(`微博超话`, "", "写入Cookie失败，关键值缺失 ⚠️")
  }
}






//感谢NobyDa 提供 github:https://github.com/NobyDa
function nobyda() {
  const times = 0
  const start = Date.now()
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
  const isLoon = typeof $loon != "undefined"
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
  const isNode = typeof require == "function" && !isJSBox;
  const node = (() => {
    if (isNode) {
      const request = require('request');
      return ({
        request
      })
    } else {
      return (null)
    }
  })()
  const notify = (title, subtitle, message) => {
    if (isQuanX) $notify(title, subtitle, message)
    if (isSurge) $notification.post(title, subtitle, message)
    if (isNode) log('\n' + title + '\n' + subtitle + '\n' + message)
    if (isJSBox) $push.schedule({
      title: title,
      body: subtitle ? subtitle + "\n" + message : message
    })
  }
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key)
    if (isSurge) return $persistentStore.write(value, key)
  }
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key)
    if (isSurge) return $persistentStore.read(key)
  }
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status
      } else if (response.statusCode) {
        response["status"] = response.statusCode
      }
    }
    return response
  }
  const get = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) $httpClient.get(options, (error, response, body) => {
      callback(error, adapterStatus(response), body)
    })
    if (isNode) {

      node.request(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function (resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data);
        callback(error, adapterStatus(resp.response), body)
      };
      $http.get(options);
    }
  }
  const post = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "POST"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function (resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data)
        callback(error, adapterStatus(resp.response), body)
      }
      $http.post(options);
    }
  }






  const log = (message) => console.log(message)
  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2)
    return console.log('\n签到用时: ' + end + ' 秒')
  }

  const wait = (time) =>{
      return new Promise((resolve) => setTimeout(resolve, time));
  }


  const sleep = (delay)=> {
    var start = (new Date()).getTime();
    while((new Date()).getTime() - start < delay) {
      // console.log('测试212');
        continue;
    }
}



  const done = (value = {}) => {
    if (isQuanX) return $done(value)
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    isRequest,
    isNode,
    notify,
    write,
    read,
    get,
    post,
    log,
    time,
    times,
      wait,
      sleep,
    done
  }
};



function urlParamsToJson(url) {
  const params = {};

  if (url.indexOf('?') !== -1) {
    var queryString = url.split('?')[1];
    const paramList = queryString.split('&');
    paramList.reduce((acc, param) => {
      const [key, value] = param.split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    }, params);
  }
 var return_msg={
      json:params,
     jsonstr:JSON.stringify(params),
     str: queryString
 }
  // return JSON.stringify(params);
  return return_msg;
}


function jsonToUrlParams(json) {
    return Object.keys(json).map(function(key) {
        return encodeURIComponent(key) + '=' +
            encodeURIComponent(json[key]);
    }).join('&');
}


function ParamsJsonUpdate(json1){
     var return_msg={
      json:json1['json'],
     jsonstr:JSON.stringify(json1['json']),
     str: jsonToUrlParams(json1['json'])
 }
 return return_msg

}



function k(e, t) {
  var a = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}
    , n = a.split
    , c = void 0 === n ? "|" : n
    , r = a.sort
    , s = void 0 === r || r
    , o = a.splitSecretKey
    , i = void 0 !== o && o
    , l = s ? Object.keys(t).sort() : Object.keys(t)
    , u = l.map((function (e) {
      return "".concat(e, "=").concat(t[e])
    }
    )).join(c) + (i ? c : "") + e;
  return md5(u)
}

// Modified from https://github.com/blueimp/JavaScript-MD5
function md5(string) { function RotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)) } function AddUnsigned(lX, lY) { var lX4, lY4, lX8, lY8, lResult; lX8 = (lX & 0x80000000); lY8 = (lY & 0x80000000); lX4 = (lX & 0x40000000); lY4 = (lY & 0x40000000); lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF); if (lX4 & lY4) { return (lResult ^ 0x80000000 ^ lX8 ^ lY8) } if (lX4 | lY4) { if (lResult & 0x40000000) { return (lResult ^ 0xC0000000 ^ lX8 ^ lY8) } else { return (lResult ^ 0x40000000 ^ lX8 ^ lY8) } } else { return (lResult ^ lX8 ^ lY8) } } function F(x, y, z) { return (x & y) | ((~x) & z) } function G(x, y, z) { return (x & z) | (y & (~z)) } function H(x, y, z) { return (x ^ y ^ z) } function I(x, y, z) { return (y ^ (x | (~z))) } function FF(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b) }; function GG(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b) }; function HH(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b) }; function II(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b) }; function ConvertToWordArray(string) { var lWordCount; var lMessageLength = string.length; var lNumberOfWords_temp1 = lMessageLength + 8; var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64; var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16; var lWordArray = Array(lNumberOfWords - 1); var lBytePosition = 0; var lByteCount = 0; while (lByteCount < lMessageLength) { lWordCount = (lByteCount - (lByteCount % 4)) / 4; lBytePosition = (lByteCount % 4) * 8; lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition)); lByteCount++ } lWordCount = (lByteCount - (lByteCount % 4)) / 4; lBytePosition = (lByteCount % 4) * 8; lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition); lWordArray[lNumberOfWords - 2] = lMessageLength << 3; lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29; return lWordArray }; function WordToHex(lValue) { var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount; for (lCount = 0; lCount <= 3; lCount++) { lByte = (lValue >>> (lCount * 8)) & 255; WordToHexValue_temp = "0" + lByte.toString(16); WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2) } return WordToHexValue }; function Utf8Encode(string) { string = string.replace(/\r\n/g, "\n"); var utftext = ""; for (var n = 0; n < string.length; n++) { var c = string.charCodeAt(n); if (c < 128) { utftext += String.fromCharCode(c) } else if ((c > 127) && (c < 2048)) { utftext += String.fromCharCode((c >> 6) | 192); utftext += String.fromCharCode((c & 63) | 128) } else { utftext += String.fromCharCode((c >> 12) | 224); utftext += String.fromCharCode(((c >> 6) & 63) | 128); utftext += String.fromCharCode((c & 63) | 128) } } return utftext }; var x = Array(); var k, AA, BB, CC, DD, a, b, c, d; var S11 = 7, S12 = 12, S13 = 17, S14 = 22; var S21 = 5, S22 = 9, S23 = 14, S24 = 20; var S31 = 4, S32 = 11, S33 = 16, S34 = 23; var S41 = 6, S42 = 10, S43 = 15, S44 = 21; string = Utf8Encode(string); x = ConvertToWordArray(string); a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476; for (k = 0; k < x.length; k += 16) { AA = a; BB = b; CC = c; DD = d; a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478); d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756); c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB); b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE); a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF); d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A); c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613); b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501); a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8); d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF); c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE); a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122); d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193); c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E); b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821); a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562); d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340); c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51); b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA); a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D); d = GG(d, a, b, c, x[k + 10], S22, 0x2441453); c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8); a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6); d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6); c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87); b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED); a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905); d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8); c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9); b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A); a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942); d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681); c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C); a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44); d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9); c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60); b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70); a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6); d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA); c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085); b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05); a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039); d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5); c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665); a = II(a, b, c, d, x[k + 0], S41, 0xF4292244); d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97); c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039); a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3); d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92); c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1); a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F); d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0); c = II(c, d, a, b, x[k + 6], S43, 0xA3014314); b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1); a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82); d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235); c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB); b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391); a = AddUnsigned(a, AA); b = AddUnsigned(b, BB); c = AddUnsigned(c, CC); d = AddUnsigned(d, DD) } var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d); return temp.toLowerCase() }

function w() {
  var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    , t = [];
  return Object.keys(e).forEach((function (a) {
    t.push("".concat(a, "=").concat(e[a]))
  }
  )),
    t.join("&")
}
