FROM python:3.10

WORKDIR /app

# Install requirements
ENV PYTHONPATH=/app/src
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# Install app
COPY . .
ENTRYPOINT ["python3", "-m", "sfb.main"]
