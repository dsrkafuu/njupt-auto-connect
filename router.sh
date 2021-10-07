#!/bin/bash

# 初始化路径
SCRIPT_PATH='/tmp/nac.sh'
LOG_PATH='/tmp/nac.log'

# 脚本写入内存
cat >"$SCRIPT_PATH" <<'EOF'
<复制所有脚本内容到此处>
EOF

# 设置权限
chmod +x "$SCRIPT_PATH"

# 清理遗留进程
# 不同路由器系统中可能需要特定修改
ps | grep "$SCRIPT_PATH" | grep -v grep | awk '{print $1}' | xargs kill -s 9

# 视情况在用户名后添加 @njxy (电信) 或 @cmcc (移动)
nohup "$SCRIPT_PATH" '<用户名>' '<密码>' >"$LOG_PATH" &
