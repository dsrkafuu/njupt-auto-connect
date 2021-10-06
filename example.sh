# write script to ram
cat >/tmp/nac.sh <<"EOF"
<COPY ALL CONTENTS HERE FROM THE SCRIPT>
EOF
# set permission
chmod 777 /tmp/nac.sh
# append username with nothing, @njxy or @cmcc
nohup /tmp/nac.sh "<USERNAME>" "<PASSWORD>" >/tmp/nac.log &
