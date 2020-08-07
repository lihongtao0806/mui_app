/**
 * 返回按钮监听
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	owner.indexBack = function(uploadInterval) {
		var backButtonPress = 0;
		mui.back = function(event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				if (uploadInterval != null) {
					uploadInterval = null;
				}
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	};
	
	owner.saveBack = function(uploadInterval) {
		var old_back = mui.back;
		mui.back = function() {
			//上一个界面刷新；
			var self = plus.webview.currentWebview();
			var opener = self.opener();
			mui.fire(opener, 'openMapMoveendListener', {
				"openMapMoveendListener": {}
			});
			//继续当前页面原有返回逻辑  
			old_back();
		}
	};
	
}(mui, window.backService = {}));
