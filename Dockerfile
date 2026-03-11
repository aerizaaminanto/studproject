FROM python:3.8-alpine
COPY . /app
WORKDIR /app 
RUN pip3 install flask
RUN chmod +x studpy1.py
CMD ["python", "studpy1.py"]