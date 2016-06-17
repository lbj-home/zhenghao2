if (!Object.create) {
	Object.create = function (o) {
		function F(){}
		F.prototype = o;
		return new F();
	};
}
//定义类的语法甘露：Class()
//最后一个参数是JSON表示的类定义
//如果参数数量大于1个，则第一个参数是基类
//第一个和最后一个之间参数，将来可表示类实现的接口
//返回值是类，类是一个构造函数
function Class(){
	var aDefine = arguments[arguments.length-1]; //最后一个参数是类定义
	if(!aDefine) return;
	var aBase = arguments.length>1 ? arguments[0] : object; //解析基类

	function prototype_(){}; //构造prototype的临时函数，用于挂接原型链
	prototype_.prototype = aBase.prototype;  //准备传递prototype
	var aPrototype = new prototype_();	//建立类要用的prototype

	for(var member in aDefine){//复制类定义到当前类的prototype
		if(member!="Create"){//构造函数不用复制
			aPrototype[member] = aDefine[member];
		}
	}
	//根据是否继承特殊属性和性能情况，可分别注释掉下列的语句
	if(aDefine.toString != Object.prototype.toString){ aPrototype.toString = aDefine.toString; }
	if(aDefine.toLocaleString != Object.prototype.toLocaleString){ aPrototype.toLocaleString = aDefine.toLocaleString; }
	if(aDefine.valueOf != Object.prototype.valueOf){ aPrototype.valueOf = aDefine.valueOf; }
	if(aDefine.Create){//若有构造函数
		var aType = aDefine.Create  //类型即为该构造函数
	}else{//否则为默认构造函数
		aType = function(){
			this.base.apply(this, arguments);   //调用基类构造函数
		};
	}
	aType.prototype = aPrototype;   //设置类(构造函数)的prototype
	aType.Base = aBase;			 //设置类型关系，便于追溯继承关系
	aType.prototype.Type = aType;   //为本类对象扩展一个Type属性
	return aType;   //返回构造函数作为类
};

//根类object定义：
function object(){}//定义小写的object根类，用于实现最基础的方法等
object.prototype.isA = function(aType){//判断对象是否属于某类型
	var self = this.Type;
	while(self){
		if(self == aType) return true;
		self = self.Base;
	};
	return false;
};
object.prototype.base = function(){  //调用基类构造函数
	var Base = this.Type.Base;  //获取当前对象的基类
	if(!Base.Base){//若基类已没有基类
		Base.apply(this, arguments)	 //则直接调用基类构造函数
	}else{//若基类还有基类
		var keep = this.Type;
		this.Type = Base;
		Base.apply(this,arguments)
		this.Type = keep;
	};
};

var Mo = {
	bindEvent: function( obj, event, handler ){
		if( document.all ){
			obj.attachEvent( event, handler );
		}else{
			obj.addEventListener( event.substr(2), handler, true );
		}
	},
	getPosition: function(e){
		l = e.offsetLeft;
		t = e.offsetTop;
		while( e=e.offsetParent ){
			l += e.offsetLeft;
			t += e.offsetTop;
		}
		return {left:l,top:t};
	},
	toggle: function(){
		for (var i = 0; i < arguments.length; i++){
			var e = document.getElementById(arguments[i]);
			if( document.all ){
				d = e.currentStyle.display;
			}else{
				d = document.defaultView.getComputedStyle(e,null).getPropertyValue("display");
			}
			e.style.display = (d == 'none' ? this.getDefaultDisplay(e) : 'none');
		}
	},
	display: function(els, action){
		var attr,value;
		switch(action){
			case 'block':
				attr = 'display'; value= 'block'; break;
			case 'inline':
				attr = 'display'; value= 'inline'; break;
			case 'none':
				attr = 'display'; value= 'none'; break;
			case 'visible':
				attr = 'visibility'; value= 'visible'; break;
			case 'hidden':
				attr = 'visibility'; value= 'hidden'; break;
		}
		for(var i=0;i<els.length;i++){
			e = els[i];
			if( typeof(e) == "string" ){
				e = document.getElementById(els[i]);
			}
			e.style[attr] = value;
		}
	},
	hide: function(){this.display(arguments,'none');},
	show: function(){this.display(arguments,'block');},
	showInline: function(){this.display(arguments, 'inline');},
	visible: function(){this.display(arguments,'visible');},
	hidden: function (e){this.display(arguments,'hidden');},
	center: function (e,fixtop){
		if( typeof(e) == "string" ){ e = document.getElementById(e); }
		e.style.position="absolute";
		fixtop = fixtop || 0;
		var scrollx = top.document.documentElement.scrollLeft;
		var scrolly = top.document.documentElement.scrollTop;
		var ttop = ((top.document.documentElement.clientHeight - e.offsetHeight)/2 + scrolly + fixtop);
		ttop = Math.min(ttop,e.ownerDocument.documentElement.scrollHeight - e.offsetHeight);
		ttop = Math.max(0, ttop);

		e.style.top  = ttop + "px";
		e.style.left = ((top.document.documentElement.clientWidth - e.offsetWidth)/2 + scrollx) + "px";
	},
	getDefaultDisplay: function(e){
		if( document.all ){return 'block';}
		switch( e.tagName.toUpperCase() ){
			case "TABLE":def = "table"; break;
			case "TR":def = "table-row"; break;
			case "TD":
			case "TH":def = "table-cell"; break;
			case "INPUT":
			case "SELECT":def = "inline-block"; break;
			case "LI":def = "list-item"; break;
			default:def = "block";
		}
		return def;
	},
	disableButton: function(bool){
		if(typeof(bool) == "undefined") bool = true;
		var inp = document.getElementsByTagName("input");
		for(i=0;i<inp.length;i++){
			if(inp[i].type.toLowerCase() == "submit" || inp[i].type.toLowerCase() == "button"){
				inp[i].disabled = bool;
			}
		}
	},
	ById: function(id){
		return document.getElementById(id);
	},
	ByTN: function(id){
		return document.getElementByTagName(id);
	},
	ByN: function(id){
		return document.getElementsByName(id);
	},
	RQ: function(key){//JS的GET
		var searchString = document.location.search.toString();
		var returnValue = '';
		if (searchString.substr(0,1)=='?' && searchString.length>1){
			var queryString = searchString.substring(1,searchString.length)
			var queryList = queryString.split('&');
			for (var i=0; i<queryList.length; i++){
				var oneQuery = queryList[i].split('=');
				if (oneQuery[0]==key && oneQuery.length==2){
					returnValue = oneQuery[1];
				}
			}
		}
		return returnValue;
	},
	Trim: function(s) {
		var str = s.replace(/^\s\s*/, ''), ws = /\s/, i = str.length;
		while (ws.test(str.charAt(--i)));
		return str.slice(0, i + 1);
	},
	GetCheckBoxList: function(objName){
		var result = "", coll = Mo.ByN(objName);
		if(!coll) return result;
		if(coll.length){
			for(var i=0;i<coll.length;i++){
				if(coll.item(i).checked){
					result += (result == "") ? coll.item(i).value : ("," + coll.item(i).value);
				}
			}
		}else {
			if(coll.checked){
				result = coll.value;
			}
		}
		return result;
	},
	Filltimes: function(s){//时间补位
		return s < 10 ? "0"+s : s;
	},
	/**
	 * 标记天数内的内容为红色
	 * 0 设定时间 2012-09-12 12:06:36
	 * 1 当前时间加的数字
	 * return f:超设定时间 t:没超
	*/
	GDIsOver: function(){
		if(arguments.length != 0){
			var dn = new Date(), ds = dn.getFullYear() + '/' + (dn.getMonth()+1) + '/' + dn.getDate(), str = arguments[0].split(" ");
			if ( str[1] ){ ds += dn.getHours() + '/' + dn.getMonth() + '/' + dn.getSeconds(); }
			var cz = (new Date(ds)).getTime() - (new Date(arguments[0].replace(/-/g,"/"))).getTime();
			return cz > (1000*60*60*24*arguments[1]) ? false : true;
		}
	},
	selSet: function(){
		var aSel = arguments[2] == undefined ? Mo.ById(""+arguments[0]+"") : arguments[0];
		for(var i = 0; i < aSel.length; i++){
			if(aSel.options[i].text == arguments[1]){
				aSel.options[i].selected=true;
				break;
			}
		}
	},
	lstTRH: function(obj){
		var _obj = obj == undefined ? "#list_select" : obj;
		$(""+_obj+" tbody > tr").hover(
			function(){ $(this).addClass("trbg_even"); },
			function(){ $(this).removeClass("trbg_even"); }
		);
	},
	Check_All: function (obj, id){
		if ( obj.checked == true ) { // 全选
			$(""+id+" input[name='"+obj.name+"[]']").each(function() {
				$(this).prop("checked", true);
			});
		} else { // 取消全选
			$(""+id+" input[name='"+obj.name+"[]']").each(function() {
				$(this).removeProp("checked");
			});
		}
	},
	//&code=2&pid=12&page=1
	getData : function(str){
		var _obj = {"PAGE":"1", "DATA":""}, p;
		if(str){
			p = str.match(/&page=(\d+)/);
			_obj["PAGE"] = p[1]
			_obj["DATA"] = str.replace(/&page=(\d)+/,"");
		}
		return _obj;
	},
	/*
	 * 返回操作
	 * 格式：{'err':'[ok]|[custom]|[null]', 'msg':'[ok]|[$("#id").remove();alert("删除成功！")]'}
	 */
	moMsg : function(obj){
		if(typeof(obj)==="string"){ obj = jQuery.parseJSON(obj); }
		var err_check = {
			"ok":"操作成功!",
			"err":"操作出错!",
			"param":"非法参数!",
			"not":"缺少必须的参数",
			"none":"不能提交空值",
			"include":"非法引用!",
			"login":"您的操作已被我们记录，请不要尝试非法登录!",
			"logintimeout":"登录已超时或非法请求，请先登录会员",
			"level":"操作被停止，权限不足!",
			"notfile":"找不到对应文件!",
			"putcontents":"写文件的时候出现了意外错误!",
			"unlink":"删除文件的时候出现了意外错误,删除失败",
			"notre":"查询完毕，无记录显示!",
			"select":"请选择一个项目",
			"notdir":"目录无效",
			"notplugin":"您要访问的页面不存在!",
			"notrecord":"记录集为空!",
			"timeout":"请求失败,脚本执行超时!",
			"empty":"请求失败,请求超时!"
		};
		if (obj.err == 'custom'){
			eval(obj.msg);
			//if(obj.JS != undefined){ eval(obj.JS); }
		}else if(obj.err == 'null'){
			console.log(obj.msg);
		}else{
			alert(err_check[obj.err]);
			//if(obj.JS != undefined){ eval(obj.JS); }
		}
		if(obj.JS != undefined){ eval(obj.JS); }
	},
	//_data www.url.com/sdf/sdf/|&code=2&pid=12
	pushURL : function(obj){
		if (obj === undefined) { return false; }
		var aUrl = [], aTmp = [], sTmp = '', oP = false, sCback = $.cookie('aBack');
		if (sCback != null) {
			var i, iLen;
			aUrl = sCback.split(",");
			iLen = aUrl.length - 1;
			aTmp = aUrl[iLen].split("|");
			if ( obj["URL"] === undefined ){
				obj["URL"] = aTmp[0];
				aTmp[1] == '' && aUrl.pop();
			}
			if( aUrl[iLen] === (obj["URL"] + "|" + obj["DATA"])){ oP = true; }
		}
		if(!oP){
			sTmp = obj["URL"] + "|" + obj["DATA"];
			aUrl.push(sTmp);
			if (aUrl.length > 2) { aUrl.shift(); }
			$.cookie('aBack', aUrl.toString());
		}
	},
	/**
	 * Ajax Load进页面列表功能
	 * obj json URL 路径 / ID 绑定innerHTML / DATA KEY=VAL数据 &串连|#ID表单 / TYPE post|get / ISU 是否记录URL
	 * return ID输出|错误弹出
	*/
	GetLst : function(obj){
		if(	obj.URL == undefined ){	return false; }
		if( obj.PAGE == undefined ){ obj.PAGE = 1; }//默认第一页
		if( obj.TYPE == undefined ){ obj.TYPE = "POST"; }
		if( obj.ISU == undefined ){ obj.ISU = true; }
		if( obj.DATA != undefined){
			if(obj.DATA.substr(0,1) == "#"){
				obj.DATA = "&"+$(""+obj.DATA+"").serialize();
			}else{
				obj.DATA = "&"+obj.DATA;//格式key=val&key=val
			}
			obj.DATA.indexOf("page=") >= 0 ? obj.DATA = obj.DATA.replace(/page=\d*/,"page="+obj.PAGE+"") : obj.DATA += "&page=" + obj.PAGE;
		}else{
			obj.DATA = "";
		}
		obj.DATA = obj.DATA.replace(/[&]+/,"&");
		$.ajax({
			type: ""+obj.TYPE+"",
			url: ""+obj.URL+"", data: ""+obj.DATA+"",
			dataType: "json", cache: false,
			beforeSend: function(XMLHttpRequest){ $('#mo_loading').css("margin-left","-50px;"); },
			error:function(){ $('#mo_loading').css("margin-left","-50px;"); },
			success: function(msg){
				if( msg.error ){
					Mo.moMsg(msg);
				}else{
					obj.ISU && Mo.pushURL({"DATA":obj.DATA});//写cookie
					msg.URL = obj.URL; msg.DATA = obj.DATA;
					obj.CALLBACK && obj.CALLBACK(msg);
				}
			},
			complete: function(XMLHttpRequest, textStatus){ $('#mo_loading').css("margin-left","-50px;"); }
		});
	},

	/**
	 * Ajax Load进页面功能
	 * r json URL 路径 / ID 绑定innerHTML / DATA POST的数据 / ISU 是否记录URL
	 * return ID输出|错误弹出
	*/
	Load : function(r){
		if( r.URL == undefined ){ return false; }else{ var sUrl = r.URL; }
		if( r.DATA == undefined ){ r.DATA = ""; }
		if( r.ISU == undefined ){ r.ISU = true; }
		var sID = r.ID == undefined ? "CompanyRightConts" : r.ID;
		if( r.ASYNC == undefined){ r.ASYNC = true;}
		if( r.MOTI_CALLBACKNAME == undefined){ r.MOTI_CALLBACKNAME = false;}

		$.ajax({
			url:sUrl, data:r.DATA, type: "POST",
			dataType:'html', timeout:60000, async: r.ASYNC,
			beforeSend: function(XMLHttpRequest){ $('#mo_loading').css("margin-left","-50px;"); },
			error: function(){ $('#mo_loading').css("margin-left","-3000px;"); },
			success: function(back){
				if( back.substr(0,7) == '{"err":' ){
					Mo.moMsg(back);
				}else{
					$('#'+sID).empty().append(back);
					r.ISU && Mo.pushURL({"URL":sUrl, "DATA":r.DATA});					
					// r["CALLBACK"] && ac_init(r.DATA);
					if (r["CALLBACK"]) {
						if (r.MOTI_CALLBACKNAME) {
							eval('' + r.MOTI_CALLBACKNAME + '(' + r.DATA +')');
						}else{
							ac_init(r.DATA);
						};
					};
				}
			},
			complete: function(XMLHttpRequest, textStatus){
				$('#mo_loading').css("margin-left","-3000px;");
			}
		});
	},	

	Send : function(r){
		if( r.URL == undefined ){ return false; }
		switch (r.U){
			case "FORM" : var form = $('#'+r.FORM+'').serialize(); break;
			case "DATA" : var form = r.FORM; break;
			case "FD" : var form = $('#'+r.FORM+'').serialize() + r.DATA; break;
			default : var form = "";
		}
		var tp = r.TYPE == undefined ? 'POST' : r.TYPE;//单独指定的提交值
		$.ajax({
			url: r.URL, type: tp, data: form,
			beforeSend: function(XMLHttpRequest){ $('#mo_loading').css("margin-left","-50px;"); },
			error:function(){ $('#mo_loading').css("margin-left","-3000px;"); },
			dataType: 'json', timeout: 60000,
			error: function(back){
				$('#mo_loading').remove();
				Mo.moMsg(back);
			},
			success: function(back){
				if(back.err != undefined){
					Mo.moMsg(back);
				}else{
					if(r.CALLBACK != undefined){ r.CALLBACK(back); return false; }
					if(back.MAIN != undefined){ $('#'+id).html(back.MAIN); }
					if(back.JS != undefined){ eval(back.JS); }
				}
			},
			complete: function(XMLHttpRequest, textStatus){ $('#mo_loading').css("margin-left","-3000px;"); }
		});
	},
	
	Senda : function(r){
		if( r.URL == undefined ){ return false; }
		switch (r.U){
			case "FORM" : var form = $('#'+r.FORM+'').serialize(); break;
			case "DATA" : var form = r.FORM; break;
			case "FD" : var form = $('#'+r.FORM+'').serialize() + r.DATA; break;
			default : var form = "";
		}
		var tp = r.TYPE == undefined ? 'POST' : r.TYPE;//单独指定的提交值
		$.ajax({
			url: r.URL, type: tp, data: form,
			beforeSend: function(XMLHttpRequest){ $('#mo_loading').css("display","block"); },
			error:function(){ $('#mo_loading').css("display","none"); },
			dataType: 'json', timeout: 60000,
			error: function(back){
				$('#mo_loading').remove();
				Mo.moMsg(back);
			},
			success: function(back){
				if(back.callback){
					eval(back.callback+"(back)");
				}else{
					Mo.moMsg(back);
				}
			},
			complete: function(XMLHttpRequest, textStatus){ $('#mo_loading').css("display","none"); }
		});
	}
};


function CKupdate(){
	for(instance in CKEDITOR.instances) CKEDITOR.instances[instance].updateElement();
}

function PageListAjax(obj) {
	this.name = obj.name;
	this.pagecount = parseInt(obj.pagecount);
	this.currpage = parseInt(obj.currpage);
	this.data = obj.data;
	this.url = obj.url;
	this.callback = obj.callback;
	this.listlength = obj.listlength ? obj.listlength : 10;
	if (this.pagecount <= 0) {
		this.pagecount = 1;
	}
	if (this.currpage > this.pagecount) {
		this.currpage = this.pagecount;
	}
}
PageListAjax.prototype = {
	go:function(pagenum) {
		Mo.GetLst({"URL":this.url, "PAGE":pagenum, "DATA":this.data, "CALLBACK":this.callback});
	},
	goto:function() {
		var currpage = prompt("请输入跳转到的页号", this.currpage);
		currpage && currpage <= this.pagecount && currpage >= 1 && this.go(currpage);
	},
	goto_v1:function() {
		var currpage = $("input[name='uPage']").val();
		currpage && currpage <= this.pagecount && currpage >= 1 && this.go(currpage);
	},
	toString:function() {
		var str = '',
		pStart = pEnd = 1;
		if (this.pagecount <= 1) {
			pStart = pEnd = 1;
		} else {
			if (this.pagecount <= this.listlength) {
				pStart = 1;
				pEnd = this.pagecount;
			} else {
				var movestep = Math.round(this.listlength / 2);
				if (this.currpage > movestep) {
					pStart = this.currpage - movestep;
					pEnd = this.currpage + movestep;
					if (pEnd > this.pagecount) {
						pStart -= pEnd - this.pagecount;
						pEnd = this.pagecount;
					}
					if (pEnd > this.pagecount) {
						pEnd = this.pagecount;
						pStart -= (pEnd - this.pagecount);
					}
				} else {
					pStart = 1;
					pEnd = this.listlength;
				}
			}
		}
		for (var i = pStart; i <= pEnd; i++) {
			if(i == this.currpage){
				str += '<a class="act" href="javascript:' + this.name + '.go(' + i + ');void(0);">' +  i + '</a>&nbsp;';
			}else{
				str += '<a href="javascript:' + this.name + '.go(' + i + ');void(0);">' + i + '</a>&nbsp;';
			}
			/*str += '<a href="javascript:' + this.name + '.go(' + i + ');void(0);">' + (i == this.currpage ? ('<strong>' + i + '</strong>') : i) + '</a>&nbsp;';*/
		}
		var str2 = '共' + this.pagecount + '页&nbsp;&nbsp;<a href="javascript:' + this.name + '.go(1);void(0);">首页</a>&nbsp;<a href="javascript:' + this.name + '.go(' + ((this.currpage - 1) <= 1 ? 1: (this.currpage - 1)) + ');void(0);"' + (this.currpage == 1 ? 'disabled': '') + '>&lt;</a>&nbsp;' + str + '<a href="javascript:' + this.name + '.go(' + ((this.currpage + 1) >= this.pagecount ? this.pagecount: (this.currpage + 1)) + ');void(0);"' + (this.currpage == this.pagecount ? 'disabled': '') + '>&gt;</a> <a href="javascript:' + this.name + '.go(' + this.pagecount + ');void(0);">尾页</a>&nbsp;'+ '<a><input type="text" name="uPage" value="" style="width: 20px; height: 15px; border:1px groove #fff" />' + ' / ' + this.pagecount + '页</a>' + '<a href="javascript:' + this.name + '.goto_v1();void(0);">跳转</a>';
		return str2;
	}
}

//按需加载CSS文件
function css_load(url){
	var this_style = getn("link");
	for(i=0;i<this_style.length;i++) {
		if(this_style[i].href && this_style[i].href.indexOf(url)!=-1) { return true; }
	}
	var load_style = document.createElement("link");
	load_style.type = "text/css";
	load_style.href = url;
	load_style.media = "all";
	load_style.rel = "stylesheet"
	var head=getn("head")[0];
	head.appendChild(load_style);
}

/*
$.cookie('the_cookie'); // 读取 cookie
$.cookie('the_cookie', 'the_value'); // 存储 cookie
$.cookie('the_cookie', 'the_value', { expires: 7 }); // 存储一个带7天期限的 cookie
$.cookie('the_cookie', '', { expires: -1 }); // 删除 cookie
参数：
expires：可以是数字或者Data类型的对象。如果传入数字表示几天后过期。
path：路径，默认为域名根目录（“/”）。
secure：是否启用加密，默认为否。
*/
jQuery.cookie = function(name, value, options){if (typeof value != 'undefined') {options = options || {};if (value === null) { value = ''; options.expires = -1; }var expires = '';if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {var date;if (typeof options.expires == 'number') {date = new Date();date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));} else {date = options.expires;}expires = '; expires=' + date.toUTCString();}var path = options.path ? '; path=' + (options.path) : '';var domain = options.domain ? '; domain=' + (options.domain) : '';var secure = options.secure ? '; secure' : '';document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');} else {var cookieValue = null;if (document.cookie && document.cookie != '') {var cookies = document.cookie.split(';');for (var i = 0; i < cookies.length; i++) {var cookie = jQuery.trim(cookies[i]);if (cookie.substring(0, name.length + 1) == (name + '=')) { cookieValue = decodeURIComponent(cookie.substring(name.length + 1)); break;}}}return cookieValue;}};



/*! Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
* $(".nav_t").bgiframe();
* Version 3.0.0
*/
(function (factory) { if (typeof define === 'function' && define.amd) { define(['jquery'], factory); } else { factory(jQuery); }}(function ($) {$.fn.bgiframe = function(s) {s = $.extend({ top : 'auto', left : 'auto', width : 'auto', height : 'auto', opacity : true, src : 'javascript:false;', conditional : /MSIE 6.0/.test(navigator.userAgent) }, s);if (!$.isFunction(s.conditional)) { var condition = s.conditional; s.conditional = function() { return condition; }; }var $iframe = $('<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+s.src+'"'+'style="display:block;position:absolute;z-index:-1;"/>');return this.each(function() {var $this = $(this);if ( s.conditional(this) === false ) { return; }var existing = $this.children('iframe.bgiframe');var $el = existing.length === 0 ? $iframe.clone() : existing; $el.css({ 'top': s.top == 'auto' ? ((parseInt($this.css('borderTopWidth'),10)||0)*-1)+'px' : prop(s.top), 'left': s.left == 'auto' ? ((parseInt($this.css('borderLeftWidth'),10)||0)*-1)+'px' : prop(s.left), 'width': s.width == 'auto' ? (this.offsetWidth + 'px') : prop(s.width), 'height': s.height == 'auto' ? (this.offsetHeight + 'px') : prop(s.height), 'opacity': s.opacity === true ? 0 : undefined}); if ( existing.length === 0 ) {$this.prepend($el);} }); }; $.fn.bgIframe = $.fn.bgiframe; function prop(n) { return n && n.constructor === Number ? n + 'px' : n;}}));


/*
JQuery滑动切换插件 ver 1.2.0
$("#switchBox8").switchTab({titCell: "dt a", mainCell:"", effect: "fade", trigger: "mouseover", delayTime: 300, omitLinks: true, swid: 'swi', spcookies: true});
*/
jQuery.fn.switchTab=function(settings){settings=jQuery.extend({defaultIndex:0,swid:"swi",titOnClassName:"on",titCell:"dt span",mainCell:"dd",delayTime:250,interTime:0,trigger:"click",effect:"",omitLinks:false,spcookies:true,debug:""},settings,{version:120});this.each(function(){var st;var curTagIndex=-1;var obj=jQuery(this);if(settings.omitLinks){settings.titCell=settings.titCell+"[href^='#']"}var oTit=obj.find(settings.titCell);var oMain=obj.find(settings.mainCell);var cellCount=oTit.length;var ShowSTCon=function(oi){if(oi!=curTagIndex){oTit.eq(curTagIndex).removeClass(settings.titOnClassName);oMain.hide();obj.find(settings.titCell+":eq("+oi+")").addClass(settings.titOnClassName);if(settings.delayTime<250&&settings.effect!="")settings.effect="";if(settings.effect=="fade"){obj.find(settings.mainCell+":eq("+oi+")").fadeIn({queue:false,duration:250})}else if(settings.effect=="slide"){obj.find(settings.mainCell+":eq("+oi+")").slideDown({queue:false,duration:250})}else{obj.find(settings.mainCell+":eq("+oi+")").show()}curTagIndex=oi}};var ShowNext=function(){oTit.eq(curTagIndex).removeClass(settings.titOnClassName);oMain.hide();if(++curTagIndex>=cellCount)curTagIndex=0;oTit.eq(curTagIndex).addClass(settings.titOnClassName);oMain.eq(curTagIndex).show()};if($.cookie(settings.swid)&&settings.spcookies==true){ShowSTCon($.cookie(settings.swid))}else{ShowSTCon(settings.defaultIndex)}if(settings.interTime>0){var sInterval=setInterval(function(){ShowNext()},settings.interTime)}oTit.each(function(i,ele){if(settings.trigger=="click"){jQuery(ele).click(function(){ShowSTCon(i);if(settings.spcookies){$.cookie(settings.swid,i,{expires:7})}return false})}else if(settings.delayTime>0){jQuery(ele).hover(function(){st=setTimeout(function(){ShowSTCon(i);if(settings.spcookies){$.cookie(settings.swid,i,{expires:7})}st=null},settings.delayTime)},function(){if(st!=null)clearTimeout(st)})}else{jQuery(ele).mouseover(function(){ShowSTCon(i);if(settings.spcookies){$.cookie(settings.swid,i,{expires:7})}})}})});if(settings.debug!="")alert(settings[settings.debug]);return this};

/*
$("#login").submit( function () { return Validator.validate(this); });
rule="y:equal" param="pwd" tip="两次密码不相同"
rule="y:contrary" tip="请先选择分类" p="0|0"
*/
function calltip(){var xOffset=-20;var yOffset=20;$("[tip]").hover(function(e){if($(this).attr('tip')!=undefined){var top=(e.pageY+yOffset);var left=(e.pageX+xOffset);$('body').append('<div id="vtip"><div class="l_angle"></div><div class="l_angle2"></div>'+$(this).attr('tip')+'</div>');$('#vtip').css({top: ""+top+"px", left: ""+left+"px"});/*$('#vtip').bgiframe();*/}},function(){if($(this).attr('tip')!=undefined){$("#vtip").remove()}}).mousemove(function(e){if($(this).attr('tip')!=undefined){var top=(e.pageY+yOffset);var left=(e.pageX+xOffset);$('#vtip').css({top: ""+top+"px", left: ""+left+"px"})}});$("[rule]").blur(function(){var r=Validator.check($(this));Validator.err(r,$(this))})}
var Validator={init:function(){var n=document.forms.length;var self=this;for(var i=0;i<n;i++){if(document.forms[i].getAttribute("validate")=="true"){document.forms[i].onsubmit=function(){return self.validate(this)}}}},validate:function(form){var isValid=true;$(form).find("[rule]").each(function(){var r=Validator.check($(this));if(!Validator.err(r,$(this))){isValid=false}});return isValid},number:function(str){return this.match(str,/^\d+(\.\d+)?$/)},username:function(str){return this.match(str,/^[A-Za-z0-9-_\.]{4,}$/)},ucname:function(str){return this.match(str,/^[^ ][0-9a-zA-Z\u2E80-\u9FFF \(\)\（\）-]*$/)},password:function(str){return this.match(str,/^.{4,19}$/)},text:function(str){return this.match(str,/^[^ ][0-9a-zA-Z\u2E80-\u9FFF \(\)\（\）-]*$/)},required:function(str){return!str.replace(/^\s+|\s+$/,"")==""},maxLength:function(str,length){if(length==0)return true;return str.length<=length},email:function(str){return this.match(str,/^[\w\.\-]+@[\w\-]+\.\w+$/)},date:function(str){return this.match(str,/^\d{4}-\d{1,2}-\d{1,2}$/)},equal:function(str,str2){return str==str2},contrary:function(str,str2){return str!=str2&&str!=""},match:function(str,re){var r=new RegExp(re);return r.test(str)},UnSafe:function(str){return this.match(str,/^(([A-Z]*|[a-z]*|\d*|[-_\~!@#\$%\^&\*\.\(\)\[\]\{\}<>\?\\\/\'\"]*)|.{0,5})$|\s/)},age:function(str){return this.match(str,/^\d{1,3}$/)},qq:function(str){return this.match(str,/^[1-9]\d{4,15}$/)},msn:function(str){return this.match(str,/^[a-zA-Z0-9;]+$/)},skype:function(str){return this.match(str,/^[a-zA-Z0-9;]+$/)},phone:function(str){return this.match(str,/^((\(\d{2,3}\))|(\d{3}-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(-\d{1,4})?$/)},phone2:function(str){return this.match(str,/^(\d+|-| ){7,}[; ]?$/)},tel:function(str){return this.match(str,/^1[2-8][0-9]{9}$/)},fax:function(str){return this.match(str,/^(\d+|-| ){7,}[; ]?$/)},zip:function(str){return this.match(str,/^[1-9]\d{4,5}$/)},url:function(str){return this.match(str,/^[a-zA-Z]{3,10}:\/\/[^\s]+$/)},check:function(elem){var s=elem.attr("rule").split(":");var c=true;var f=this[s[1]];var v=elem.val();if(v==''&&s[0]=='n'){c=false}if(c){if(elem.attr("param")!=undefined){var e=elem.attr("param");var p=$("#"+e).val();var r=f.apply(this,[v,p])}else if(elem.attr("p")!=undefined){var p=elem.attr("p");var r=f.apply(this,[v,p])}else{var r=f.apply(this,[v])}}else{r=true}return r},err:function(r,obj){if(!r){obj.css("border-color","#F00");return false}else{obj.css("border-color","");return true}}};

/*!art-template - Template Engine | http://aui.github.com/artTemplate/*/
!function(){function a(a){return a.replace(t,"").replace(u,",").replace(v,"").replace(w,"").replace(x,"").split(y)}function b(a){return"'"+a.replace(/('|\\)/g,"\\$1").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"'"}function c(c,d){function e(a){return m+=a.split(/\n/).length-1,k&&(a=a.replace(/\s+/g," ").replace(/<!--[\w\W]*?-->/g,"")),a&&(a=s[1]+b(a)+s[2]+"\n"),a}function f(b){var c=m;if(j?b=j(b,d):g&&(b=b.replace(/\n/g,function(){return m++,"$line="+m+";"})),0===b.indexOf("=")){var e=l&&!/^=[=#]/.test(b);if(b=b.replace(/^=[=#]?|[\s;]*$/g,""),e){var f=b.replace(/\s*\([^\)]+\)/,"");n[f]||/^(include|print)$/.test(f)||(b="$escape("+b+")")}else b="$string("+b+")";b=s[1]+b+s[2]}return g&&(b="$line="+c+";"+b),r(a(b),function(a){if(a&&!p[a]){var b;b="print"===a?u:"include"===a?v:n[a]?"$utils."+a:o[a]?"$helpers."+a:"$data."+a,w+=a+"="+b+",",p[a]=!0}}),b+"\n"}var g=d.debug,h=d.openTag,i=d.closeTag,j=d.parser,k=d.compress,l=d.escape,m=1,p={$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1},q="".trim,s=q?["$out='';","$out+=",";","$out"]:["$out=[];","$out.push(",");","$out.join('')"],t=q?"$out+=text;return $out;":"$out.push(text);",u="function(){var text=''.concat.apply('',arguments);"+t+"}",v="function(filename,data){data=data||$data;var text=$utils.$include(filename,data,$filename);"+t+"}",w="'use strict';var $utils=this,$helpers=$utils.$helpers,"+(g?"$line=0,":""),x=s[0],y="return new String("+s[3]+");";r(c.split(h),function(a){a=a.split(i);var b=a[0],c=a[1];1===a.length?x+=e(b):(x+=f(b),c&&(x+=e(c)))});var z=w+x+y;g&&(z="try{"+z+"}catch(e){throw {filename:$filename,name:'Render Error',message:e.message,line:$line,source:"+b(c)+".split(/\\n/)[$line-1].replace(/^\\s+/,'')};}");try{var A=new Function("$data","$filename",z);return A.prototype=n,A}catch(B){throw B.temp="function anonymous($data,$filename) {"+z+"}",B}}var d=function(a,b){return"string"==typeof b?q(b,{filename:a}):g(a,b)};d.version="3.0.0",d.config=function(a,b){e[a]=b};var e=d.defaults={openTag:"<#",closeTag:"#>",escape:!0,cache:!0,compress:!1,parser:null},f=d.cache={};d.render=function(a,b){return q(a,b)};var g=d.renderFile=function(a,b){var c=d.get(a)||p({filename:a,name:"Render Error",message:"Template not found"});return b?c(b):c};d.get=function(a){var b;if(f[a])b=f[a];else if("object"==typeof document){var c=document.getElementById(a);if(c){var d=(c.value||c.innerHTML).replace(/^\s*|\s*$/g,"");b=q(d,{filename:a})}}return b};var h=function(a,b){return"string"!=typeof a&&(b=typeof a,"number"===b?a+="":a="function"===b?h(a.call(a)):""),a},i={"<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","&":"&#38;"},j=function(a){return i[a]},k=function(a){return h(a).replace(/&(?![\w#]+;)|[<>"']/g,j)},l=Array.isArray||function(a){return"[object Array]"==={}.toString.call(a)},m=function(a,b){var c,d;if(l(a))for(c=0,d=a.length;d>c;c++)b.call(a,a[c],c,a);else for(c in a)b.call(a,a[c],c)},n=d.utils={$helpers:{},$include:g,$string:h,$escape:k,$each:m};d.helper=function(a,b){o[a]=b};var o=d.helpers=n.$helpers;d.onerror=function(a){var b="Template Error\n\n";for(var c in a)b+="<"+c+">\n"+a[c]+"\n\n";"object"==typeof console&&console.error(b)};var p=function(a){return d.onerror(a),function(){return"{Template Error}"}},q=d.compile=function(a,b){function d(c){try{return new i(c,h)+""}catch(d){return b.debug?p(d)():(b.debug=!0,q(a,b)(c))}}b=b||{};for(var g in e)void 0===b[g]&&(b[g]=e[g]);var h=b.filename;try{var i=c(a,b)}catch(j){return j.filename=h||"anonymous",j.name="Syntax Error",p(j)}return d.prototype=i.prototype,d.toString=function(){return i.toString()},h&&b.cache&&(f[h]=d),d},r=n.$each,s="break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined",t=/\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g,u=/[^\w$]+/g,v=new RegExp(["\\b"+s.replace(/,/g,"\\b|\\b")+"\\b"].join("|"),"g"),w=/^\d[^,]*|,\d[^,]*/g,x=/^,+|,+$/g,y=/^$|,+/;"function"==typeof define?define(function(){return d}):"undefined"!=typeof exports?module.exports=d:this.template=d}();


var err_check = {
	"ok":"操作成功!",
	"err":"操作出错!",
	"param":"非法参数!",
	"not":"缺少必须的参数",
	"none":"不能提交空值",
	"include":"非法引用!",
	"login":"您的操作已被我们记录，请不要尝试非法登录!",
	"logintimeout":"登录已超时或非法请求，请先登录会员",
	"level":"操作被停止，权限不足!",
	"notfile":"找不到对应文件!",
	"putcontents":"写文件的时候出现了意外错误!",
	"unlink":"删除文件的时候出现了意外错误,删除失败",
	"notre":"查询完毕，无记录显示!",
	"select":"请选择一个项目",
	"notdir":"目录无效",
	"notplugin":"您要访问的页面不存在!",
	"notrecord":"记录集为空!",
	"timeout":"请求失败,脚本执行超时!",
	"empty":"请求失败,请求超时!"
};

//防止退格键
document.onkeydown=function(event){
	var e = event || window.event || arguments.callee.caller.arguments[0];
	if(e.keyCode==8){
		var d=e.srcElement||e.target;

		if(d.tagName.toUpperCase()=='INPUT'||d.tagName.toUpperCase()=='TEXTAREA'||d.tagName.toUpperCase()=='PASSWORD'){
			e.returnValue = true;
		}else{
			e.preventDefault();
			var sLinks = $.cookie("aBack");
			if( sLinks.indexOf(",") != -1 && sLinks != '' ){
				var aLink = sLinks.split(","), aUlink = [];
				aUlink = aLink[0].split("|");
				Mo.Load({"URL":aUlink[0], "DATA":aUlink[1], "CALLBACK":true, "P": true});
			}else{
				location.href = "Warpper.php";
			}
			return false;
		}
	}

}
