#!/bin/bash
# server_control.sh
# ./restart_server.sh.sh backend - Restart only the backend
# ./restart_server.sh frontend - Restart only the frontend
# ./restart_server.sh celery-worker - Restart only the celery worker
# ./restart_server.sh celery-beat - Restart only the celery beat
# ./restart_server.sh celery - Restart celery
# ./restart_server.sh all - Restart all services
# ./restart_server.sh status - Show the status of all screen sessions

# Load configuration from JSON file
CONFIG_FILE="$(dirname "$0")/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Function to read values from the JSON config
get_config_value() {
    local key=$1
    python3 -c "import json; f=open('$CONFIG_FILE'); data=json.load(f); print(data$key)"
}

# Load paths and commands from config
PROJECT_PATH=$(get_config_value "['project_path']")
BACKEND_PATH=$(get_config_value "['backend_path']")
FRONTEND_PATH=$(get_config_value "['frontend_path']")

# Get screen names
BACKEND_SCREEN=$(get_config_value "['screen_names']['backend']")
FRONTEND_SCREEN=$(get_config_value "['screen_names']['frontend']")
CELERY_WORKER_SCREEN=$(get_config_value "['screen_names']['celery_worker']")
CELERY_BEAT_SCREEN=$(get_config_value "['screen_names']['celery_beat']")

# Get commands
BACKEND_CMD=$(get_config_value "['commands']['backend']")
FRONTEND_CMD=$(get_config_value "['commands']['frontend']")
FRONTEND_BUILD_CMD=$(get_config_value "['commands']['frontend_build']")
CELERY_WORKER_CMD=$(get_config_value "['commands']['celery_worker']")
CELERY_BEAT_CMD=$(get_config_value "['commands']['celery_beat']")

# Function to restart the backend
restart_backend() {
    echo "Stopping backend..."
    screen -S $BACKEND_SCREEN -X quit 2>/dev/null
    sleep 2
    echo "Starting backend..."
    cd $BACKEND_PATH
    screen -dmS $BACKEND_SCREEN bash -c "$BACKEND_CMD"
    echo "Backend restarted"
}

# Function to restart the frontend
restart_frontend() {
    echo "Stopping frontend..."
    screen -S $FRONTEND_SCREEN -X quit 2>/dev/null
    sleep 2
    echo "Building frontend..."
    cd $FRONTEND_PATH
    npm run build
    echo "Starting frontend..."
    screen -dmS $FRONTEND_SCREEN bash -c "$FRONTEND_CMD"
    echo "Frontend restarted"
}

# Function to restart celery worker
restart_celery_worker() {
    echo "Stopping celery worker..."
    screen -S $CELERY_WORKER_SCREEN -X quit 2>/dev/null
    sleep 2
    echo "Starting celery worker..."
    cd $BACKEND_PATH
    screen -dmS $CELERY_WORKER_SCREEN bash -c "$CELERY_WORKER_CMD"
    echo "Celery worker restarted"
}

# Function to restart celery beat
restart_celery_beat() {
    echo "Stopping celery beat..."
    screen -S $CELERY_BEAT_SCREEN -X quit 2>/dev/null
    sleep 2
    echo "Starting celery beat..."
    cd $BACKEND_PATH
    screen -dmS $CELERY_BEAT_SCREEN bash -c "$CELERY_BEAT_CMD"
    echo "Celery beat restarted"
}

# Function to restart all celery processes
restart_celery() {
    restart_celery_worker
    restart_celery_beat
    echo "All celery processes restarted"
}

# Function to restart all services
restart_all() {
    restart_backend
    restart_frontend
    restart_celery
    echo "All services restarted"
}

# Function to show status of all screens
show_status() {
    echo "Current screen sessions:"
    screen -ls
}

# Main script execution
case "$1" in
    backend)
        restart_backend
        ;;
    frontend)
        restart_frontend
        ;;
    celery-worker)
        restart_celery_worker
        ;;
    celery-beat)
        restart_celery_beat
        ;;
    celery)
        restart_celery
        ;;
    all)
        restart_all
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {backend|frontend|celery-worker|celery-beat|celery|all|status}"
        exit 1
esac

exit 0