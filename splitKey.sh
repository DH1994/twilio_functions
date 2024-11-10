#!/bin/bash

# Twilio only accepts env vars of max 450 bytes. This script splits the key in parts
# run by ./splitKey.sh "-----BEGIN PRIVATE KEY........"

inputKey=${1}
keyLen=$(echo $inputKey | wc -c)
partSz=400
partCount=$(($keyLen / $partSz))
lastPartSz=$(($keyLen % $partSz))

for (( i=0;i<$partCount; i++ )); do
  nextIx=$((${i} * ${partSz}))
  echo  GOOGLE_PRIVATE_KEY_${i}=\"${inputKey:${nextIx}:${partSz}}\";
done

nextIx=$((${partCount} * ${partSz}))
echo  GOOGLE_PRIVATE_KEY_${partCount}=\"${inputKey:$nextIx:${lastPartSz}}\";
echo GOOGLE_PRIVATE_KEY_PARTS=$((partCount+1))
