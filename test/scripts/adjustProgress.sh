#!/bin/bash

x=0

while true
do
  x=`expr $x + 5`
  if [ $x -gt 100 ]
  then
    x=0
  fi
  progress=`echo $x | awk '{ printf "%0.2f", $1/100 }'`
  echo "{\"data\":{\"type\":\"notebooks\",\"id\":\"1\",\"attributes\":{\"progress\":$progress}}}" \
    | http PATCH localhost:3001/api/v2/notebooks/1 > /dev/null
  sleep 0.2
done
