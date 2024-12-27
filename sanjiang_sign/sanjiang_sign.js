/*



三江签到脚本
作者：fengyuan2333
github:https://github.com/fengyuan2333
更新时间: 2024/12/27
脚本兼容: QuantumultX, Surge4, Loon, JsBox, Node.js


获取Cookie说明：
ios打开三江，提示保存cookie成功即可继续。



脚本将在每天上午9:00执行, 您可以修改执行时间。

如果使用Node.js, 需自行安装'request'模块. 例: npm install request -g

Node.js环境变量相关：
Cookie：Sanjiang_COOKIE
Debug调试：Sanjiang_DEBUG
Bark通知推送Key：BARK_PUSH
Bark服务端(默认官方)：BARK_SERVER


JsBox, Node.js用户获取Cookie说明：
方法一手机：开启抓包, 打开三江 ， 返回抓包APP搜索URL关键字 save 复制token.

*/


/*********************
QuantumultX 远程脚本配置:
**********************
[task_local]
# 微博超话签到
0 9 * * * https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/sanjiang_sign/sanjiang_sign.js

[rewrite_local]
# 获取Cookie
^https?://app\.sanjiang\.com\/users\/userInfo url script-request-header https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/sanjiang_sign/sanjiang_sign.js

[mitm]
hostname= app.sanjiang.com

**********************
Surge 4.2.0+ 脚本配置:
**********************
[Script]
三江签到 = type=cron,cronexp=0 9 * * *,timeout=120,script-path=script-request-header https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/sanjiang_sign/sanjiang_sign.js

三江获取Cookie = type=http-request,pattern=^https?://app\.sanjiang\.com\/users\/userInfo,script-path=script-request-header https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/sanjiang_sign/sanjiang_sign.js

[MITM]
hostname= app.sanjiang.com

************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# 三江签到
cron "0 9 * * *" script-path=^https?://app\.sanjiang\.com\/users\/userInfo,script-path=script-request-header https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/sanjiang_sign/sanjiang_sign.js

# 获取Cookie
http-request ^https?://app\.sanjiang\.com\/users\/userInfo script-path=^https?://app\.sanjiang\.com\/users\/userInfo,script-path=script-request-header https://raw.githubusercontent.com/fengyuan2333/Script/refs/heads/main/sanjiang_sign/sanjiang_sign.js
[Mitm]
hostname= app.sanjiang.com

*/





let USER_URL = "https://app.sanjiang.com/users/userInfo";//用户信息
let SIGN_URL = "https://app.sanjiang.com/dailySign/save";//签到信息
var headers1 = {

    'content-type':'application/json',
    'Accept-Encoding':'gzip,compress,br,deflate',
    'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.54(0x18003637) NetType/WIFI Language/zh_CN',
    'Host':'app.sanjiang.com',
    'addressId':'',
    'Connection':'keep-alive',
    'serverTime':'',
    'platform':'1',
    'terminal':'40',
};


var cookie='';

var barkKey = ''; //Bark APP 通知推送Key

var barkServer = ''; //Bark APP 通知服务端地址(默认官方)

var retry=5;//失败时重试次数;
var retry_time=1000//重试间隔,单位:ms;
var sign_time=100//超话签到间隔,单位ms;

var LogDetails = false; // 响应日志

var pushMsg = [];



var $nobyda = nobyda();



(async () => {


    cookie = cookie || $nobyda.read("CookieSanjiang")
  LogDetails = $nobyda.read("Sanjiang_LogDetails") === "true" ? true : LogDetails
  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    cookie = cookie || process.env.Sanjiang_COOKIE;
    LogDetails = LogDetails || process.env.Sanjiang_DEBUG;
    barkKey = barkKey || process.env.BARK_PUSH;
    barkServer = barkServer || process.env.BARK_SERVER;
  }



  if ($nobyda.isRequest) {
    GetCookie()
  } else if (cookie) {
    if (cookie.includes("-")){



var succeeded=false;

var username='';
var username_return={'issuccess':false};
var loperror=0;
var message_to_push = "";
var message_to_push_count=0;
var headersQ=headers1;
headersQ['x-auth-token']=cookie;
while (succeeded==false && loperror<=retry){
    try {



        var username_return= await get_username_wait(headersQ);
        var sign_return= await get_sign(headersQ);

if (username_return['issuccess']==true && sign_return['issuccess']==true){
    username=username_return['username'];
    succeeded=true;
    break
}else{
console.log('失败，请检查cookie');
break;

}






                // console.log('跳出循环');


    console.log('三江购物签到结果');
console.log(sign_return['data']);






    }catch(error){
    console.log('出错,等待2秒后进行第'+(loperror+1)+'次重试');
    console.log(error);
    $nobyda.sleep(2000);
    // await new Promise(r => setTimeout(r, 60000));
    console.log('2秒等待完成');
    loperror++;
    }
}


if(username_return['issuccess']){
    $nobyda.notify("三江购物签到执行完成", '@'+username,sign_return['data'] );
}else{
    $nobyda.notify("三江购物签到执行失败", '', username_return['errmsg']);
}

        await $nobyda.time();
    } else {
      console.log(`Cookie缺少关键值，需重新获取`)
    }
  } else {
    $nobyda.notify("三江购物签到", "", "签到终止, 未获取Cookie");
  }
})().finally(() => {
  $nobyda.done();
})



function GetCookie() {
  if (!$request.url.includes("sanjiang.com")) {
    $nobyda.notify(`写入三江购物Cookie失败`, "", "请更新脚本配置(URL正则/MITM)");
    return
  }
  var CKA = $request.headers['x-auth-token'] ;
  var sanjiang = CKA && CKA !== ''  && CKA;
  var RA = $nobyda.read("CookieSanjiang")
  if (CKA && sanjiang) {
    if (RA != sanjiang) {
      var OldTime = $nobyda.read("CookieSanjiangTime")
      if (!$nobyda.write(sanjiang, "CookieSanjiang")) {
        $nobyda.notify(`${RA ? `更新` : `首次写入`}三江购物签到Cookie失败‼️`, "", "")
      } else {
        if (!OldTime || OldTime && (Date.now() - OldTime) / 1000 >= 1) {
          $nobyda.write(JSON.stringify(Date.now()), "CookieSanjiangTime")
          $nobyda.notify(`${RA ? `更新` : `首次写入`}三江购物签到Cookie成功 🎉`, "", "")
        } else {
          console.log(`\n更新三江购物Cookie成功! 🎉\n检测到频繁通知, 已转为输出日志`)
        }
      }
    } else {
      console.log("\n三江购物-与本机储存Cookie相同, 跳过写入 ⚠️")
    }
  } else {
    $nobyda.notify(`三江购物`, "", "写入Cookie失败，关键值缺失 ⚠️")
  }
}

function get_username_wait(headerss){
  return new Promise(resolve => {

      var URL = {
          url:USER_URL,
          headers:headerss,
      }
      var returnmsg={
          issuccess:false,
              username:''
      }

    $nobyda.get(URL, function (error, response, data) {
      const Details = LogDetails ? `msg:\n${data || error}` : '';

      try {


        if (error || response.statusCode !=200){
             throw new Error(`请求失败`+data);
             resolve();
        }

        const obj = JSON.parse(data);
            try{
                username1=obj['data']['username'];
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
        console.log(response);
      }



      resolve(returnmsg);
    })
  })


}
function get_sign(headerss){
  return new Promise(resolve => {

      var URL = {
          url:SIGN_URL,
          headers:headerss,
      }
      var returnmsg={
          issuccess:false,
              username:''
      }

    $nobyda.get(URL, function (error, response, data) {
      const Details = LogDetails ? `msg:\n${data || error}` : '';

      try {


        if (error || response.statusCode !=200){
             throw new Error(`请求失败`+data);
             resolve();
        }

        const obj = JSON.parse(data);
            try{
                username1=obj['data'] || obj['codeMessage'] || data;
                returnmsg['issuccess']=true;
                returnmsg['data']=username1;
                taskListMsg='获取成功';

            } catch(error){

                taskListMsg='获取失败';
                returnmsg['errmsg']=obj['errmsg'];



            }

      } catch (e) {
        taskListMsg = `${e.message || e} ‼️`;
        console.log('错误');
        console.log(taskListMsg);
        console.log(response);
      }


      resolve(returnmsg);
    })
  })


}

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
