run-server:
	@echo "Set RUST_BACKTRACE=1"
	@export RUST_BACKTRACE=1
	@echo "Kill the potential PID processes that use 5000 port"
	@kill -9 $$(lsof -t -i:5000)
	@echo "Running server..."
#	@python ./backend/backend/app.py
	@nohup python ./backend/backend/app.py > /dev/null 2>&1 &

debug:
	@cargo build
	@cd ./bridge/ && maturin develop
	@python ./backend/backend/app.py