#!/bin/bash

# 初始化登陆参数
if [ ! -n "$1" ] || [ ! -n "$2" ]; then
  echo 'USAGE: $0 <用户名> <密码> [间隔] [超时]'
  exit 1
fi
USERNAME=$1 # 视情况在用户名后添加 @njxy (电信) 或 @cmcc (移动)
PASSWORD=$2
INTERVAL=10
if [ -n "$3" ]; then
  INTERVAL=$3
fi
TIMEOUT=3
if [ -n "$4" ]; then
  TIMEOUT=$4
fi

# 检查在线状态
online() {
  # 苹果
  ping -c 1 -w "$TIMEOUT" 'www.apple.com' >'/dev/null' 2>&1
  A_STAT=$?
  # 百度
  ping -c 1 -w "$TIMEOUT" 'www.baidu.com' >'/dev/null' 2>&1
  B_STAT=$?
  # 任意可行即在线
  if [ $A_STAT -eq 0 ] || [ $B_STAT -eq 0 ]; then
    return 1
  else
    return 0
  fi
}

# 登录
login() {
  # 获取 AP 信息
  AP_META=$(curl --connect-timeout $TIMEOUT -s 'http://6.6.6.6' | grep 'location.href=')
  if [ -z "$AP_META" ]; then
    return 0
  fi

  # 解析 AP 信息
  USER_IP=$(echo "$AP_META" | sed -n "s/.*wlanuserip=\([^&\"]*\).*/\1/p")
  AC_NAME=$(echo "$AP_META" | sed -n "s/.*wlanacname=\([^&\"]*\).*/\1/p")
  AC_IP=$(echo "$AP_META" | sed -n "s/.*wlanacip=\([^&\"]*\).*/\1/p")
  if [ -z "$USER_IP" ] || [ -z "$AC_NAME" ] || [ -z "$AC_IP" ]; then
    return 0
  fi

  # 初始化登录信息
  LOGIN_A='Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  LOGIN_AE='Accept-Encoding: gzip, deflate'
  LOGIN_AL='Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2'
  LOGIN_C='Connection: keep-alive'
  LOGIN_CT='Content-Type: application/x-www-form-urlencoded'
  LOGIN_O='Origin: http://10.10.244.11'
  LOGIN_R='Referer: http://10.10.244.11/'
  LOGIN_UA='User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
  LOGIN_URL="http://10.10.244.11:801/eportal/?c=ACSetting&a=Login&protocol=http:&hostname=10.10.244.11&iTermType=1&wlanuserip=$USER_IP&wlanacip=$AC_IP&wlanacname=$AC_NAME&mac=00-00-00-00-00-00&ip=$USER_IP&enAdvert=0&queryACIP=0&loginMethod=1"
  LOGIN_BODY="DDDDD=%2C0%2C$USERNAME&upass=$PASSWORD&R1=0&R2=0&R3=0&R6=0&para=00&0MKKey=123456&buttonClicked=&redirect_url=&err_flag=&username=&password=&user=&cmd=&Login=&v6ip="

  # 登录
  RES=$(curl --connect-timeout $TIMEOUT -s -i "$LOGIN_URL" -H "$LOGIN_A" -H "$LOGIN_AE" -H "$LOGIN_AL" -H "$LOGIN_C" -H "$LOGIN_CT" -H "$LOGIN_O" -H "$LOGIN_R" -H "$LOGIN_UA" --data "$LOGIN_BODY" | grep "Location:" | grep "ErrorMsg=")
  # 未收到错误 302 重定向即成功
  if [ -z "$RES" ]; then
    return 1
  else
    return 0
  fi
}

# 循环检查在线状态并登录
while :; do
  LOG_PREFIX=$(date +"[%Y-%m-%d %H:%M:%S]")
  online
  if [ $? -eq 0 ]; then
    echo "$LOG_PREFIX OFFLINE TRY LOGIN"
    login
    if [ $? -eq 0 ]; then
      echo "$LOG_PREFIX LOGIN FAILED"
      exit 1
    else
      echo "$LOG_PREFIX LOGIN SUCCEEDED"
    fi
  else
    echo "$LOG_PREFIX ONLINE"
  fi
  sleep $INTERVAL
done
