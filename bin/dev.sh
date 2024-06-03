#!/bin/bash

# Shell tmux script to start application

# create the session to be used
tmux new-session -d -s bmds_ui

# split the window
tmux split-window -v
tmux resize-pane -t 0 -y 12
tmux select-pane -t 0

tmux split-window -h

tmux select-pane -t 2
tmux split-window -h

# run commands
tmux send-keys -t 0 "source venv/bin/activate" enter
tmux send-keys -t 1 "source venv/bin/activate && manage.py shell" enter
tmux send-keys -t 2 "source venv/bin/activate && manage.py runserver 8100" enter
tmux send-keys -t 3 "npm --prefix ./frontend run start" enter

# attach to shell
tmux select-pane -t 0
tmux attach-session
