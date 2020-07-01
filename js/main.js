// 统一获取所需变量
const phone = $('#phone');
const password = $('#password');
const code = $('#code');

// 正则
// 验证手机号
const phone_pattern = /^(0|86|17951)?(1[0-9][0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/;
// 验证设备
const frontEnd = /(nokia|iphone|android|ipad|motorola|^mot-|softbank|foma|docomo|kddi|up\.browser|up\.link|htc|dopod|blazer|netfront|helio|hosin|huawei|novarra|CoolPad|webos|techfaith|palmsource|blackberry|alcatel|amoi|ktouch|nexian|samsung|^sam-|s[cg]h|^lge|ericsson|philips|sagem|wellcom|bunjalloo|maui|symbian|smartphone|midp|wap|phone|windows ce|iemobile|^spice|^bird|^zte-|longcos|pantech|gionee|^sie-|portalmmm|jig\s browser|hiptop|^ucweb|^benq|haier|^lct|opera\s*mobi|opera*mini|320x320|240x320|176x220)/i;

/**
 * @description 获取 Query 参数
 * @param {string} name  url字符串
 * @return {string|null}
 * @constructor
 */
const GetQueryString = function (name) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  let url = decodeURIComponent(window.location.search);
  let r = url.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
};


/**
 * @description 获取短信验证码
 * @param {number} mobile  电话号
 * @param {number} template_id_code  模板字符串
 * @return {{getAllResponseHeaders: (function(): *), abort: (function(*=): *), setRequestHeader: (function(*=, *): *), readyState: number, getResponseHeader: (function(*): *), overrideMimeType: (function(*): *), statusCode: (function(*=): E)}|*}
 */
const reqCode = ({mobile, template_id_code = 'SMS_register'}) => $.ajax(
  {
    type: "POST",
    url: 'http://www.duiyu99.cn/send_sms',
    data: {mobile, template_id_code}
  }
);

/**
 * @description 注册
 * @param {number} phone 手机号
 * @param {number} code 验证码
 * @param {string} password 密码
 * @param {string} inviter_uid 邀请人ID
 * @return {{getAllResponseHeaders: (function(): *), abort: (function(*=): *), setRequestHeader: (function(*=, *): *), readyState: number, getResponseHeader: (function(*): *), overrideMimeType: (function(*): *), statusCode: (function(*=): E)}|*}
 */
const gerRegister = ({phone, code, password, inviter_uid = 2}) => $.ajax({
  type: "POST",
  url: 'http://www.duiyu99.cn/register',
  data: {phone, inviter_uid, code, password}
});

/**
 * @description 全局 Toast 弹窗
 * @param {string} text 提示文字
 * @param {number} time 时长
 * @param {String} el 选择的元素
 */
const toast = (text, time = 1.5, el = '.wrap') => {
  let context = `
  <div class="toast-wrap">
    <div class="toast">${text}</div>
  </div>`;

  $(el).append(context);
  $('.toast-wrap').slideDown('');
  setTimeout(() => {
    $('.toast-wrap').slideUp('', () => {
      $('.toast-wrap').remove()
    });
  }, time * 1000)
};



// 检测是否是移动端
const isPhone = () => {
  if (!frontEnd.test(window.navigator.userAgent)) {
    document.write(`<div style="text-align: center;padding-top: 38vh">该页面只能在移动端使用</div>`)
  }
};

window.onload = isPhone
window.onresize = isPhone

// 监听手机号输入
const phoneChange = () => {
  const input = phone.val();
  if (!phone_pattern.test(input)) {
    toast('手机号码输入有误')
  }
};
phone.on('change', phoneChange);

phone.on('input', () => {
  const input = phone.val();
  let output = Number.isNaN(parseInt(input)) ? '' : parseInt(input).toString().slice(0, 11);
  phone.val(output);
});

// 检测密码
const passwordChange = () => {
  const input = password.val();
  if (input.length < 8) {
    toast('密码小于8位')
  }
};
password.on('change', passwordChange);


// 获取验证码
const getCode = e => {
  e.stopPropagation();
  e.preventDefault();
  const phoneNumber = phone.val();
  if (!phoneNumber) {
    toast('请输入手机号码');
    return
  }
  if (!phone_pattern.test(phoneNumber)) {
    toast('手机号码格式有误');
    return;
  }

  reqCode({mobile: phoneNumber})
    .done(response => {
      if (response.code === 1) {
          toast(response.message);
          let time = 60;
          let timer = setInterval(() => {
            time--;
            if (!time) {
              clearInterval(timer);
              time = 60;
              document.querySelector('.get-code').innerHTML = '获取验证码';
              return
            }
            document.querySelector('.get-code').innerHTML = time + 's'
          }, 1000);
        } else {
          toast(response.message)
        }
      }
    )
};

const getCodeNode = document.querySelector('.get-code');
getCodeNode.ontouchend = e => getCode(e);

// 注册
const register = () => {
  const phoneNumber = phone.val();
  const passwordText = password.val();
  const codeText = code.val();
  if (!phoneNumber) {
    toast('请填写手机号码');
    return;
  }
  if (!passwordText) {
    toast('请填写密码');
    return;
  }
  if (!codeText) {
    toast('请填写验证码');
    return;
  }

  let inviter_uid = GetQueryString('inviter_uid');

  gerRegister({code: codeText, phone: phoneNumber, password: passwordText, inviter_uid})
    .done(
      res => {
        if (typeof res === 'string') {
          res = JSON.parse(res)
        }
        if (res.code !== 1) {
          toast(res.message);
          return
        }
        toast('用户注册成功');
        window.location.href = './invitation_success.html'
      }
    )
};

$('.button').on('touchend', register);
