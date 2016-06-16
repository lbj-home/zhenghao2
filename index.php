<?php
// 应用入口文件

// 检测PHP环境
if(version_compare(PHP_VERSION,'5.3.0','<'))  die('require PHP > 5.3.0 !');

// 开启调试模式 建议开发阶段开启 部署阶段注释或者设为false
define('APP_DEBUG',true);

// 定义应用目录
define('APP_PATH','./app/');

// 定义应用目录
define('ATT_PATH','/attachment/');

// 关闭目录安全文件的生成
define('BUILD_DIR_SECURE', false);

//定义项目根目录
define('ROOT_PATH',__DIR__);

// //设置默认模块名为Home
// define('BIND_MODULE','Home'); 

// 引入ThinkPHP入口文件
require './core/core.php';

// 亲^_^ 后面不需要任何代码了 就是如此简单
 