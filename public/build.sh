#!/bin/sh

bizubee -c src/main -t main.js -m
bizubee -c src/worker -t worker.js -m
bizubee -c src/bf-worker -t bf-worker.js -m
