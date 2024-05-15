# Project Setup

## Creating the Virtual Environment

1. Create the virtual environment:
   ```bash
   python -m venv venv_name
   ```
2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Running the App

### Without Docker

1. Navigate into the app directory:
   ```bash
   cd app
   ```
2. Run the app using uvicorn:
   ```bash
   uvicorn main:app --reload
   ```
   Or with gunicorn:
   ```bash
   gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker
   ```

### With Docker

1. Build the Docker image:
   ```bash
   docker build -t llm .
   ```
2. Run the Docker container:
   ```bash
   docker compose up
   ```

> **Note:** Don't forget to create a `.env` file in the root of the backend folder to run the app. This file should contain all the necessary environment variables required for your application. You can follow the `example.env` file as a template.
