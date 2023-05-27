# poetry shell
# create makefile tha runs python ./app.py && lt --port 5000
deploy:
	@echo "Deploying to localtunnel"
	python ./backend/app.py &
	PYTHON_PID=$$!
	lt --port 5000 &
	wait $$PYTHON_PID