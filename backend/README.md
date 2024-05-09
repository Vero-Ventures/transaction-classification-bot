
To create the virtual environment:

`python -m venv venv_name`

`pip install -r requirements.txt`

---

To run the app cd into the app directory and run:

`uvicorn main:app --reload`

or with gunicorn:

`gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker`

