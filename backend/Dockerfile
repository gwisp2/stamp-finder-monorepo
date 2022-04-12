FROM python:3.10

WORKDIR /app

# Create user & data directory
RUN useradd -M -u 1042 sfb && mkdir -p /app/data && chown sfb:sfb /app/data

# Install requirements
ENV PYTHONPATH=/app/src
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# Install app
COPY . .
ENTRYPOINT ["python3", "-m", "sfb.main"]
CMD ["-c", "/app/config/default.yml"]

# Change user
USER sfb
