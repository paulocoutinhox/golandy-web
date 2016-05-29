var Utils = new function() {

	this.isUndefined = function (data) {
		return ('undefined' == typeof data);
	};

	this.isNull = function (data) {
		return (null == data);
	};

	this.redirect = function (url) {
		window.location.href = url;
	};

	this.getQueryParam = function (name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	};

};