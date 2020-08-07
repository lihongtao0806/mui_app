(function($, owner) {

	/**
	 * 真实环境[上线版本，不允许打印Log]，值为true；
	 * 测试环境，值为false;
	 */
	var APP_LOG = true;

	/**
	 * 手机端打印Log
	 */
	owner.route = function() {
		var url = location.href;
		// console.log(url);
		if (!APP_LOG) {
			var arr = url.split("www");
			url = arr[1];
			var urlArr = url.split("?");
			url = urlArr[0];
			console.log("--->页面路径：" + url);
		} else {
			url = "";
		}
		return url;
	}
	var APP_URL = true;
	// var URL_CLIENT = "http://172.20.95.1:8081/"; 
	// var URL_CLIENT = "http://192.168.3.80:8081/"; //
	var URL_CLIENT = "http://192.168.3.170:8081/";  //义星 
	// var URL_CLIENT = "http://192.168.3.22:8081/";
	var URL_SERVICE = "http://221.181.88.134:7902/inspectapi/";

	owner.url = function(path) {
		if (!APP_URL) {
			console.log("--->url=" + URL_CLIENT + path);
			return URL_CLIENT + path
		} else {
			console.log("--->url=" + URL_SERVICE + path);
			return URL_SERVICE + path
		}
	}

	owner.getUrl = function() {
		if (!APP_URL) {
			return URL_CLIENT;
		} else {
			return URL_SERVICE;
		}
	}

	/**
	 * 检查参数合法性
	 * @param {Object} arg
	 */
	owner.checkLegality = function(arg) {
		if (arg == null || arg == "") {
			return false;
		}
		return true;
	}


	//上传图片最大宽
	owner.maxWidth = function() {
		return 1000
	};
	//上传图片最大高
	owner.maxHeight = function() {
		return 1000
	};

	owner.urlImg = function(path) {
		return owner.prefix() + path;
	}
	owner.max_count_photos = 3;

	owner.count_progress = 0;

	owner.map_style = ''; // 'amap://styles/06ed4d3f4ce5552e9ecfd41eba21fc3d';

	owner.calc_step_number_interval = 10
	owner.calc_step_number_count = 3

	owner.showProgressBar = function(bShow) {
		if (bShow || bShow == undefined) {
			if (owner.count_progress == 0) {
				mui('body').progressbar({
					progress: undefined
				}).show();
			}

			owner.count_progress++;
		} else {
			owner.count_progress--;

			if (owner.count_progress == 0) {
				mui('body').progressbar().hide();
			}
		}
	}
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.account.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if (loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		var authed = users.some(function(user) {
			return loginInfo.account == user.account && loginInfo.password == user.password;
		});
		if (authed) {
			return owner.createState(loginInfo.account, callback);
		} else {
			return callback('用户名或密码错误');
		}
	};

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		if (regInfo.account.length < 5) {
			return callback('用户名最短需要 5 个字符');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		if (!checkEmail(regInfo.email)) {
			return callback('邮箱地址不合法');
		}
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		users.push(regInfo);
		localStorage.setItem('$users', JSON.stringify(users));
		return callback();
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	owner.setSetting = function(key, value) {
		localStorage.setItem(key, value);
	}
	owner.getSetting = function(key) {
		return localStorage.getItem(key) || "{}";
	}

	owner.setSetting2 = function(key, value) {
		plus.storage.setItem(key, value);
	}
	owner.getSetting2 = function(key) {
		return plus.storage.getItem(key) || "";
	}
	owner.removeSetting2 = function(key) {
		plus.storage.removeItem(key);
	}
	owner.removeSetting = function(key) {
		localStorage.removeItem(key);
	}

	/**
	 * 获取本地是否安装客户端
	 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}

	owner.httpGet = function(_url, callback) {
		mui.ajax(_url, {
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 20000, //超时时间设置为10秒；
			//	headers:{'Content-Type':'application/json'},	
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest'
			},
			//	headers:{'content-type':'multipart/form-data','X-Requested-With':'XMLHttpRequest'},
			processData: true,
			success: function(data) {
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//				console.log(_url);
				//				console.log(xhr);
				//				console.log(JSON.stringify(xhr));
				//异常处理；
				callback({
					'return': 1,
					'error': type + " " + errorThrown
				});
			}
		});
	}

	owner.httpPost = function(_url, data, callback) {

	}

	owner.ajax = function(_url, mapInfo, callback) {
		mui.ajax(_url, {
			data: mapInfo,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 20000, //超时时间设置为10秒；
			//	headers:{'Content-Type':'application/json'},	
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest'
			},
			//	headers:{'content-type':'multipart/form-data','X-Requested-With':'XMLHttpRequest'},
			processData: true,
			success: function(data) {
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//				console.log(_url);
				//				console.log(xhr);
				//				console.log(JSON.stringify(xhr));
				//异常处理；
				callback({
					'return': 1,
					'error': type + " " + errorThrown
				});
			}
		});
	}

	owner.ajaxForm = function(_url, mapInfo, callback) {
		mui.ajax(_url, {
			data: mapInfo,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 20000, //超时时间设置为10秒；
			//	headers:{'Content-Type':'application/json'},	
			//	headers:{'content-type':'application/x-www-form-urlencoded','X-Requested-With':'XMLHttpRequest'},
			headers: {
				'content-type': 'multipart/form-data',
				'X-Requested-With': 'XMLHttpRequest'
			},
			processData: true,
			success: function(data) {
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//				console.log(xhr);
				//异常处理；
				callback({
					'return': 1,
					'error': type + " " + errorThrown
				});
			}
		});
	}
	owner.ajaxJson = function(_url, mapInfo, callback) {
		mui.ajax(_url, {
			data: mapInfo,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 20000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/json'
			},
			//	headers:{'content-type':'application/x-www-form-urlencoded','X-Requested-With':'XMLHttpRequest'},
			//			headers:{'content-type':'multipart/form-data','X-Requested-With':'XMLHttpRequest'},
			processData: true,
			success: function(data) {
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//				console.log(xhr);
				//异常处理；
				callback({
					'return': 1,
					'error': type + " " + errorThrown
				});
			}
		});
	}

	owner.ajaxRaw = function(_url, strInfo, callback) {
		mui.ajax(_url, {
			data: strInfo,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 20000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'text/plain',
				'X-Requested-With': 'XMLHttpRequest'
			},
			//		headers:{'content-type':'application/x-www-form-urlencoded','X-Requested-With':'XMLHttpRequest'},
			processData: true,
			success: function(data) {
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				callback({
					'return': 1,
					'error': type + " " + errorThrown
				});
			}
		});
	}

	/**
	 * 打开新的页面，并且传值
	 * @param {Object} str  需要打开的页面
	 * @param {Object} args 需要传递的参数
	 */
	owner.open = function(str, args) {
		mui.openWindow({
			url: str,
			id: str,
			preload: false,
			createNew: true,
			show: {
				aniShow: 'pop-in'
			},
			styles: {
				popGesture: 'hide'
			},
			waiting: {
				autoShow: true
			},
			extras: {
				args: args
			}
		});
	}

	owner.openBack = function(str) {
		mui.openWindow({
			url: str,
			id: str,
			preload: false,
			createNew: true,
			show: {
				aniShow: "slide-in-right"
			},
			styles: {
				popGesture: 'hide'
			},
			waiting: {
				autoShow: false
			}
		});
	}

	owner.getUrlParam = function(key) {
		var href = location.href;
		var arrParams = href.split("?");
		var strParam = "";
		if (arrParams.length > 1)
			strParam = arrParams[1];

		var arrSubParams = strParam.split("&");
		if (arrSubParams.length > 0) {
			for (var i = 0; i < arrSubParams.length; ++i) {
				var arrKeyValue = arrSubParams[i].split('=');
				if (arrKeyValue.length > 0) {
					if (arrKeyValue[0].toLowerCase() == key.toLowerCase()) {
						if (arrKeyValue.length > 1)
							return decodeURI(arrKeyValue[1]);

						return "";
					}
				}
			}
		}

		return "";
	}

	owner.getUrlParam2 = function(key, url) {
		var href = location.href;
		if (url)
			href = url;
		var arrParams = href.split("?");
		var strParam = "";
		if (arrParams.length > 1)
			strParam = arrParams[1];

		var arrSubParams = strParam.split("&");
		if (arrSubParams.length > 0) {
			for (var i = 0; i < arrSubParams.length; ++i) {
				var arrKeyValue = arrSubParams[i].split('=');
				if (arrKeyValue.length > 0) {
					if (arrKeyValue[0].toLowerCase() == key.toLowerCase()) {
						if (arrKeyValue.length > 1)
							return decodeURI(arrKeyValue[1]);

						return "";
					}
				}
			}
		}

		return "";
	}

	owner.getUserInfo = function() {
		return JSON.parse(owner.getSetting('user_data') || "[]")
	}

	owner.getUserId = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.id) {
			return user_data.id;
		}

		return '';
	}

	owner.getUserName = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.description) {
			return user_data.description;
		} else if (user_data && user_data.username) {
			return user_data.username;
		}

		return '';
	}

	owner.getLoginName = function() {
		return owner.getSetting('login_name');
	}
	//
	owner.isAdmin = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.user_type) {
			return user_data.user_type == "超级管理员";
		}

		return false;
	}
	//是否是监理
	owner.isJl = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.user_type) {
			return user_data.user_type == "监理员";
		}

		return false;
	}

	//站长
	owner.isZz = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.user_type) {
			return user_data.user_type == "站长";
		}

		return false;
	}

	//是否是管理员
	owner.isGly = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.user_type) {
			return user_data.user_type == "管理员";
		}

		return false;
	}

	owner.isXc = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.user_type) {
			return user_data.user_type == "巡查员";
		}

		return false;
	}
	owner.isYw = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.user_type) {
			return user_data.user_type == "运维人员";
		}

		return false;
	}

	owner.isYf = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.userType) {
			return user_data.userType == 6;
		}

		return false;
	}

	// hd_xc
	// hd_jl
	// hd_admin
	// sz_xc
	// sz_yf
	// sz_admin
	owner.getDepartUserRole = function() {
		// role name
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		var strDepartment = "";
		var strUserType = "";
		if (user_data && user_data.userType) {
			switch (user_data.userType) {
				case 2:
					strUserType = "web测试";
					break;
				case 3:
					strUserType = "管理员";
					break;
				case 4:
					strUserType = "巡查员";
					break;
				case 5:
					strUserType = "监理员";
					break;
				case 6:
					strUserType = "养护单位";
					break;
				default:
					strUserType = "其它用户类型" + user_data.userType;
					break;
			}
		}

		if (user_data && user_data.departmentName)
			strDepartment = user_data.departmentName;

		if (strDepartment == '' && strUserType == '')
			return '';

		var str = '';
		if (strDepartment)
			str += strDepartment;

		if (str && strUserType)
			str += " - ";

		if (strUserType)
			str += strUserType;

		return str;
	}

	owner.getUserRole = function() {
		// role name
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);
		return user_data.userType
		var strUserType = "";
		if (user_data && user_data.userType) {
			switch (user_data.userType) {
				case 2:
					strUserType = "web测试";
					break;
				case 3:
					strUserType = "管理员";
					break;
				case 4:
					strUserType = "巡查员";
					break;
				case 5:
					strUserType = "监理员";
					break;
				case 6:
					strUserType = "养护单位";
					break;
				default:
					strUserType = "其它用户类型" + user_data.userType;
					break;
			}
		}

		return strUserType;
	}

	// {"code":0,"data":{"departmentName":"水闸科","departmentId":47,"id":123,"userType":5,"userRegionId":"00","username":"szkjly"},"desc":"登录成功"}
	owner.getDepartmentName = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);
		if (user_data && user_data.departmentName) {
			return user_data.departmentName;
		}

		return '';
	}

	owner.getDepartmentId = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);
		if (user_data && user_data.departmentId) {
			return user_data.departmentId;
		}

		return '';
	}

	owner.getUserRegionId = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.userRegionId) {
			return user_data.userRegionId;
		}

		return '';
	}

	owner.getCompanyName = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data && user_data.companyName) {
			return user_data.companyName;
		}

		return '';
	}

	owner.isHdk = function() {
		return owner.getDepartmentId() == 46;
	}

	owner.isSzk = function() {
		return owner.getDepartmentId() == 47;
	}

	owner.isTest = function() {
		return owner.getUserRole() == 'web测试';
	}

	// 河道科 - 巡查员
	owner.isHdXc = function() {
		return owner.getDepartUserRole() == "河道科 - 巡查员";
	}

	// 河道科 - 监理员
	owner.isHdJl = function() {
		return owner.getDepartUserRole() == "河道科 - 监理员";
	}

	// 河道科 - 管理员
	owner.isHdAdmin = function() {
		return owner.getDepartUserRole() == "河道科 - 管理员";
	}

	// 河道科 - 养护单位
	owner.isHdYh = function() {
		return owner.getDepartUserRole() == "河道科 - 养护单位";
	}

	// 水闸科 - 巡查员
	owner.isSzXc = function() {
		return owner.getDepartUserRole() == "水闸科 - 巡查员";
	}

	// 水闸科 - 养护单位
	owner.isSzYh = function() {
		return owner.getDepartUserRole() == "水闸科 - 养护单位";
	}

	// 水闸科 - 监理员
	owner.isSzJl = function() {
		return owner.getDepartUserRole() == "水闸科 - 监理员";
	}

	// 水闸科 - 管理员
	owner.isSzAdmin = function() {
		return owner.getDepartUserRole() == "水闸科 - 管理员";
	}

	owner.getUserToken = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);
		if (user_data && user_data.userToken) {
			return user_data.userToken;
		}

		return '';
	}

	owner.needAttendance = function() {
		var user_data = owner.getSetting('user_data');
		if (user_data)
			user_data = JSON.parse(user_data);

		if (user_data.user_type)
			return user_data.user_type != '超级管理员' && user_data.user_type != '管理员';

		return false;
	}

	owner.isLogin = function() {
		return owner.getUserRole() != '';
	}

	owner.formatUnixtime = function(value) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();
		return unixTimestamp.toLocaleString();
	}

	owner.plusZero = function(value) {
		if (value < 10)
			return "0" + value;

		return value;
	}

	owner.formatUnixtime2 = function(value, hasSecond) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		var strDate = unixTimestamp.getFullYear() + '-' + owner.plusZero((unixTimestamp.getMonth() + 1)) + '-' + owner.plusZero(
			unixTimestamp.getDate());
		strDate += " " + owner.plusZero(unixTimestamp.getHours()) + ":" + owner.plusZero(unixTimestamp.getMinutes());

		if (hasSecond)
			strDate += ":" + owner.plusZero(unixTimestamp.getSeconds());

		return strDate;
	}

	owner.formatUnixtime3 = function(value, plusDays, bZeroTime) {
		var unixTimestamp = new Date(value);
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		if (plusDays) {
			unixTimestamp.setTime(unixTimestamp.getTime() + plusDays * 60 * 60 * 24 * 1000);
		}

		var strDate = unixTimestamp.getFullYear() + '-' + owner.plusZero((unixTimestamp.getMonth() + 1)) + '-' + owner.plusZero(
			unixTimestamp.getDate());

		if (bZeroTime) {
			strDate += " 00:00:00";
		} else {
			strDate += " " + owner.plusZero(unixTimestamp.getHours()) + ":" + owner.plusZero(unixTimestamp.getMinutes());
			strDate += ":" + owner.plusZero(unixTimestamp.getSeconds());
		}

		return strDate;
	}

	owner.formatSeconds = function(value) {
		var result = [0, 0, 0];
		var secondTime = parseInt(value); // 秒
		var minuteTime = 0; // 分
		var hourTime = 0; // 小时
		if (secondTime > 60) { //如果秒数大于60，将秒数转换成整数
			//获取分钟，除以60取整数，得到整数分钟
			minuteTime = parseInt(secondTime / 60);
			//获取秒数，秒数取佘，得到整数秒数
			secondTime = parseInt(secondTime % 60);
			//如果分钟大于60，将分钟转换成小时
			if (minuteTime > 60) {
				//获取小时，获取分钟除以60，得到整数小时
				hourTime = parseInt(minuteTime / 60);
				//获取小时后取佘的分，获取分钟除以60取佘的分
				minuteTime = parseInt(minuteTime % 60);
			}
		}

		result[2] = parseInt(secondTime);

		if (minuteTime > 0) {
			result[1] = parseInt(minuteTime);
		}
		if (hourTime > 0) {
			result[0] = parseInt(hourTime);
		}
		return result;
	}

	owner.formatSecondsStr = function(value) {
		var arr = owner.formatSeconds(value);
		var str = '';
		if (arr[0] > 0)
			str += arr[0] + '小时';
		if (arr[1] > 0)
			str += arr[1] + '分';
		if (arr[2] > 0)
			str += arr[2] + '秒';

		if (str == '')
			str = '0小时';

		return str;
	}

	owner.minute2hour = function(val) {
		return parseInt(val * 100 / 60) / 100.0;
	}

	/**
	 * 获取标准时间字符串
	 * yyyy-MM-dd HH:mm:ss
	 */
	owner.getFormatDayTime = function(date) {
		if (date == null || date == "") {
			date = new Date();
		}
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hour = date.getHours();
		var minute = date.getMinutes();
		var second = date.getSeconds();
		var day = "" + year + '-' + app.plusZero(month) + '-' + app.plusZero(day) + ' ' + app.plusZero(hour) + ':' +
			app.plusZero(minute) + ':' + app.plusZero(second);
		return day;
	}

	owner.getDay = function(value) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		var strYear = unixTimestamp.getFullYear();
		var strMonth = unixTimestamp.getMonth() + 1;

		return strYear + '-' + owner.plusZero(strMonth) + '-' + owner.plusZero(unixTimestamp.getDate());
	}



	owner.getWeekBegin = function(value) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		var uTime = new Date(unixTimestamp.getTime() - unixTimestamp.getDay() * 24 * 60 * 60 * 1000);

		return uTime.getFullYear() + '-' + owner.plusZero(uTime.getMonth() + 1) +
			"-" + owner.plusZero(uTime.getDate());
	}

	owner.getWeekEnd = function(value) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		var uTime = new Date(unixTimestamp.getTime() + (6 - unixTimestamp.getDay()) * 24 * 60 * 60 * 1000);

		return uTime.getFullYear() + '-' + owner.plusZero(uTime.getMonth() + 1) +
			"-" + owner.plusZero(uTime.getDate());
	}

	owner.getMonthBegin = function(value) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		var strYear = unixTimestamp.getFullYear();
		var strMonth = unixTimestamp.getMonth() + 1;

		return strYear + '-' + owner.plusZero(strMonth) + '-01';
	}

	owner.getMonthEnd = function(value) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		var strYear = unixTimestamp.getFullYear();
		var strMonth = unixTimestamp.getMonth() + 1;

		// next month
		if (strMonth == 12) {
			strMonth = 1;
			strYear++;
		} else {
			strMonth++;
		}

		var dayNextMonthBegin = new Date(Date.UTC(strYear, strMonth - 1, 1, 0, 0, 0));
		dayNextMonthBegin.setHours(0);
		var dayMonthEnd = new Date(dayNextMonthBegin.getTime() - 100 * 1000);

		return dayMonthEnd.getFullYear() + '-' + owner.plusZero(dayMonthEnd.getMonth() + 1) +
			"-" + owner.plusZero(dayMonthEnd.getDate());
	}

	owner.getSeasonBegin = function(value) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		var strYear = unixTimestamp.getFullYear();
		var strMonth = unixTimestamp.getMonth() + 1;

		if (strMonth <= 3) {
			return strYear + '-01-01';
		} else if (strMonth <= 6) {
			return strYear + '-04-01';
		} else if (strMonth <= 9) {
			return strYear + '-07-01';
		}

		return strYear + '-10-01';
	}

	owner.getSeasonEnd = function(value) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		var strYear = unixTimestamp.getFullYear();
		var strMonth = unixTimestamp.getMonth() + 1;

		if (strMonth <= 3) {
			return strYear + '-03-30';
		} else if (strMonth <= 6) {
			return strYear + '-06-30';
		} else if (strMonth <= 9) {
			return strYear + '-09-30';
		}

		return strYear + '-12-31';
	}

	owner.getYearBegin = function(value) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		var strYear = unixTimestamp.getFullYear();
		var strMonth = unixTimestamp.getMonth() + 1;

		return strYear + '-01-01';
	}

	owner.getYearEnd = function(value) {
		var unixTimestamp = null;
		if (value)
			unixTimestamp = new Date(value);
		else
			unixTimestamp = new Date();

		var strYear = unixTimestamp.getFullYear();
		var strMonth = unixTimestamp.getMonth() + 1;

		return strYear + '-12-31';
	}

	owner.formatMeters = function(value) {
		if (value || value == 0)
			return value / 1000.0;

		return ' ';
	}

	owner.formatPercent = function(value) {
		if (value) {
			return parseInt(value * 100) / 100.0;
		}
		return 0;
	}

	owner.switch = function(strId, bOn, bInit) {
		var obj = document.getElementById(strId);
		if (bInit) {
			if (bOn) {
				obj.classList.add('mui-active');
			} else {
				obj.classList.remove('mui-active');
			}
		} else {
			if (bOn) {
				if (!obj.classList.contains('mui-active')) {
					mui('#' + strId).switch().toggle();
				}
			} else {
				if (obj.classList.contains('mui-active')) {
					mui('#' + strId).switch().toggle();
				}
			}
		}
	}

	owner.eventClickYear = function(ctrlBtn, callback) {
		// years
		var arrData = new Array();

		var currentYear = (new Date()).getFullYear();
		for (var i = 0; i < 5; ++i) {
			arrData.push({
				value: (currentYear - i),
				text: (currentYear - i) + "年"
			});
		}

		var yearsPicker = new mui.PopPicker();
		yearsPicker.setData(arrData);

		ctrlBtn.addEventListener('tap', function() {
			yearsPicker.show(function(items) {
				ctrlBtn.innerText = items[0].text;
				if (callback) {
					callback(items[0].value);
				}
				//返回 false 可以阻止选择框的关闭
				//return false;
			});
		})
	}

	owner.getGeoAddress = function(lon, lat, ctrl_return) {
		var geocoder = new AMap.Geocoder();
		var arrLatLon = [lon, lat];
		geocoder.getAddress(arrLatLon, function(status, result) {
			if (status === 'complete' && result.info === 'OK') {
				ctrl_return.innerHTML = result.regeocode.formattedAddress;
			}
		})
	}

	owner.pickDate = function(_self, hasSecond) {
		if (_self.picker) {
			console.log(1);
			_self.picker.show(function(rs) {
				_self.innerText = rs.text;
				if (hasSecond)
					_self.innerText += ":00";
				_self.picker.dispose();
				_self.picker = null;
			});
		} else {
			console.log(2);
			var optionsJson = _self.getAttribute('data-options') || '{}';
			var options = JSON.parse(optionsJson);
			var id = _self.getAttribute('id');
			/*
			 * 首次显示时实例化组件
			 * 示例为了简洁，将 options 放在了按钮的 dom 上
			 * 也可以直接通过代码声明 optinos 用于实例化 DtPicker
			 */
			_self.picker = new mui.DtPicker(options);
			_self.picker.show(function(rs) {
				/*
				 * rs.value 拼合后的 value
				 * rs.text 拼合后的 text
				 * rs.y 年，可以通过 rs.y.vaue 和 rs.y.text 获取值和文本
				 * rs.m 月，用法同年
				 * rs.d 日，用法同年
				 * rs.h 时，用法同年
				 * rs.i 分（minutes 的第二个字母），用法同年
				 */
				_self.innerText = rs.text;
				if (hasSecond)
					_self.innerText += ":00";
				/* 
				 * 返回 false 可以阻止选择框的关闭
				 * return false;
				 */
				/*
				 * 释放组件资源，释放后将将不能再操作组件
				 * 通常情况下，不需要示放组件，new DtPicker(options) 后，可以一直使用。
				 * 当前示例，因为内容较多，如不进行资原释放，在某些设备上会较慢。
				 * 所以每次用完便立即调用 dispose 进行释放，下次用时再创建新实例。
				 */
				_self.picker.dispose();
				_self.picker = null;
			});
		}
	}

	owner.inputCtrl = function(ctrl, e, str, initValue) {
		e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['取消', '确定'];
		mui.prompt(str, str, '修改', btnArray, function(e) {
			if (e.index == 1) {
				if (e.value == '')
					ctrl.innerText = initValue;
				else
					ctrl.innerText = e.value;
			}
		}, 'div')

		if (initValue != ctrl.innerText)
			document.querySelector('.mui-popup-input input').value = ctrl.innerText;
	}

	var maxFiles = 0;
	var loadFiles = 0;
	var formData = null;
	var xhr = null;

	function onLoadFileRead() {
		loadFiles++;
		//		console.log(loadFiles);
		if (maxFiles == loadFiles) {
			//			console.log('send');
			xhr.send(formData);
		}
	}

	owner.uploadFiles = function(arr, url, key, mapData, callback) {
		xhr = new XMLHttpRequest(); //第一步    

		//定义表单变量    
		//    var file = document.getElementById('file').files;    
		//console.log(file.length);    
		//新建一个FormData对象    
		formData = new FormData(); //++++++++++
		//      console.log(mapData.forensicsId);
		formData.append('forensicsId', mapData.forensicsId);
		//追加文件数据  
		loadFiles = 0;
		maxFiles = arr.length;
		/*
        for(i=0; i<arr.length; i++){
//      	console.log(key + "["+i+"]");
//      	console.log(arr[i]);
        	
        	var fr = new FileReader();
        	var new_file = new File([],arr[i]);
        	
        	fr.onload = onLoadFileRead;
        	
        	fr.readAsArrayBuffer(new_file);
        	
             formData.append(key + "["+i+"]", new_file); //++++++++++    
        }*/

		//formData.append("file", file[0]); //++++++++++    

		//post方式    
		xhr.open('POST', url); //第二步骤 
		xhr.setRequestHeader('Content-Type', 'multipart/form-data');
		//发送请求    
		xhr.send(formData); //第三步骤    
		//ajax返回    
		xhr.onreadystatechange = function() { //第四步    
			if (callback) {
				callback(xhr, xhr.status);
			}
		};

		//设置超时时间    
		xhr.timeout = 100000;
		xhr.ontimeout = function(event) {
			if (callback)
				callback(xhr, xhr.status);
		}
	}
	owner.ajaxBack = function() {
		mui.back();
		setTimeout(function() {
			mui.back();
			console.log("mui.back();")
		}, 1000);
	}
	owner.isEmpty = function(val) {
		return val == undefined || val == null || val == '';
	}
	owner.previewImage = function(select) {
		var images = [].slice.call(document.querySelectorAll(select + ' img'));
		var urls = [];
		images.forEach(function(item) {
			urls.push(item.src.replace("/thumb", ""));
		});
		mui(select).on('tap', 'img', function() {
			var index = images.indexOf(this);
			plus.nativeUI.previewImage(urls, {
				current: index,
				loop: true,
				indicator: 'number'
			});
		});
	}
	owner.compare = function(curV, reqV) {
		if (curV && reqV) {
			//将两个版本号拆成数字
			var arr1 = curV.split('.'),
				arr2 = reqV.split('.');
			var minLength = Math.min(arr1.length, arr2.length),
				position = 0,
				diff = 0;
			//依次比较版本号每一位大小，当对比得出结果后跳出循环（后文有简单介绍）
			while (position < minLength && ((diff = parseInt(arr1[position]) - parseInt(arr2[position])) == 0)) {
				position++;
			}
			diff = (diff != 0) ? diff : (arr1.length - arr2.length);
			//若curV大于reqV，则返回true
			return diff > 0;
		} else {
			//输入为空
			console.log("版本号不能为空");
			return false;
		}
	}
	owner.get_time = function(callback) {
		app.ajax(app.url("query/get_time"), {}, function(ret) {
			if (ret.code == 0) {
				console.log("query/get_time success")
				callback(ret.data)
			} else {
				console.log("query/get_time error")
				callback(new Date().format("yyyy-MM-dd hh:mm:ss"))
			}
		})
	}
}(mui, window.app = {}));

$('.link_open').click(function() {
	// mui('#' + $(this).parents('div').attr('id')).popover('hide');

	if ($(this).attr('href')) {
		console.log("link_open 执行了")
		app.open($(this).attr('href'));
	}


	return false;
})

Date.prototype.format = function(format) {
	var args = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter
		"S": this.getMilliseconds()
	};
	if (/(y+)/.test(format))
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var i in args) {
		var n = args[i];
		if (new RegExp("(" + i + ")").test(format))
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
	}
	return format;
};

Array.prototype.indexOf = function(val) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == val) return i;
	}
	return -1;
};

Array.prototype.remove = function(val) {
	var index = this.indexOf(val);
	if (index > -1) {
		this.splice(index, 1);
	}
};

function get_error_msg(ret, msg) {
	var var_mg = ""
	if (ret.msg) var_mg = ret.msg
	if (ret.error) var_mg = ret.error
	if (ret.message) var_mg = ret.message
	if (var_mg) return var_mg
	else {
		if (msg) return msg
		else return ""
	}
}
