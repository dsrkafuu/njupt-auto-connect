cat >/tmp/nac.sh <<EOF
<COPY ALL CONTENTS HERE FROM THE SCRIPT>
EOF
# append username with nothing, @njxy or @cmcc
nohup /tmp/nac.sh "<USERNAME>" "<PASSWORD>" >/tmp/nac.log &
