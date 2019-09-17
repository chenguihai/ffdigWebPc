const dev_baseUrl = "http://10.28.1.101:56771/"; //刘雄本机开发者使用

// const dev_baseUrl = "http://ffdig-api.gw-ec.com/"; //杨冰本机开发/者使用   新的
// const dev_baseUrl = "http://api.ffdig.com/"; //

// const prod_baseUrl = "http://api.ffdig.com/";//正式环境
// const serverUrl = "http://www.ffdig.com/";//正式环境

// const prod_baseUrl = "http://10.28.1.101:56771/"; //测试环境  新的
const prod_baseUrl = "http://ffdig-api.gw-ec.com/"; //测试环境  新的
const serverUrl = "http://ffdig.gw-ec.com/"; //测试环境

const appID = "wx6dd0660878e55b06";
const isMock = true;
const is_dev = !(process.env.NODE_ENV === "production");
const baseUrl = is_dev ? dev_baseUrl : prod_baseUrl;
export default {
    baseUrl, is_dev, isMock, prod_baseUrl, serverUrl, appID
}


// 测试环境不要添加百度统计  app.js
// 测试环境不要添加百度统计  app.js
// 测试环境不要添加百度统计  app.js
// 测试环境不要添加百度统计  app.js56771