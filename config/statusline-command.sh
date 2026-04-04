#!/bin/bash
input=$(cat)
model=$(echo "$input" | jq -r '.model.display_name // empty')
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // empty')

# Path in cyan on the far left, rooted at ~/Documents
path_part=""
if [ -n "$cwd" ]; then
    docs_root="/home/apolo/Documents"
    if echo "$cwd" | grep -q "^${docs_root}"; then
        display_path="~/Documents${cwd#$docs_root}"
    else
        display_path="$cwd"
    fi
    path_part=$(printf "\033[36m[%s]\033[00m" "$display_path")
fi

# Model in orange
model_part=""
[ -n "$model" ] && model_part=$(printf "\033[38;5;214m%s\033[00m" "$model")

# Context bar
bar_part=""
if [ -n "$used" ]; then
    used_int=$(printf '%.0f' "$used")
    bar_total=20
    filled=$(( used_int * bar_total / 100 ))
    [ $filled -gt $bar_total ] && filled=$bar_total
    empty=$(( bar_total - filled ))

    # Color based on percentage
    if [ "$used_int" -ge 71 ]; then
        color="\033[31m"   # red
    elif [ "$used_int" -ge 61 ]; then
        color="\033[33m"   # orange/yellow
    else
        color="\033[32m"   # green
    fi

    bar=""
    for i in $(seq 1 $filled); do bar="${bar}█"; done
    for i in $(seq 1 $empty);  do bar="${bar}░"; done

    bar_part=$(printf "${color}[%s]\033[00m %d%%" "$bar" "$used_int")
fi

# Line 1: model  [context bar]
# Line 2: path
line1=""
if [ -n "$model_part" ] && [ -n "$bar_part" ]; then
    line1="$model_part  $bar_part"
elif [ -n "$model_part" ]; then
    line1="$model_part"
elif [ -n "$bar_part" ]; then
    line1="$bar_part"
fi

line2=""
[ -n "$path_part" ] && line2="$path_part"

if [ -n "$line1" ] && [ -n "$line2" ]; then
    printf "%s\n%s" "$line1" "$line2"
elif [ -n "$line1" ]; then
    printf "%s" "$line1"
elif [ -n "$line2" ]; then
    printf "%s" "$line2"
fi
