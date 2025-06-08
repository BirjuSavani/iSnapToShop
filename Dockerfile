FROM python:3.12
# Set the working directory in the container

WORKDIR /app

# Copy the requirements file to the working directory
COPY requirements.txt .

RUN python3 -m pip install --upgrade pip
# Install the project dependencies
RUN python3 -m pip install --no-cache-dir -r requirements.txt

# Copy the project code to the working directory
COPY . .
RUN python3 -m pip list

# Expose the Django development server port
EXPOSE 5000
# RUN python3 -m pip show pillow

# Set the default command to run when the container starts 
CMD ["python3", "app.py"]