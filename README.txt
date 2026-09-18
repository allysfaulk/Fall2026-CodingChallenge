Image Saving and Sharing App

Name: Ally Faulk
Vanderbilt Email: [ally.s.faulk@vanderbilt.edu](mailto:ally.s.faulk@vanderbilt.edu)

OVERVIEW

This application allows users to search for images, organize them into collections, 
edit image captions, and share collections through unique links. The frontend is 
built with React and Vite, while the backend uses Python and Flask with a SQLite database. 
Image search is provided through the Pixabay API.

SETUP AND RUNNING THE APPLICATION

Requirements:

* Python 3
* Node.js and npm
* A Pixabay API key

1. Clone the repository and navigate into the project directory.

2. Install the Python dependencies:

python -m pip install -r requirements.txt

3. Create a file named ".env" inside the backend folder.

Add your Pixabay API key to the file in this format:

PIXABAY_API_KEY=your_pixabay_api_key

A Pixabay API key can be obtained from the Pixabay API documentation.

4. Start the Flask backend from the root project directory:

python backend/app.py

The backend should run at:

http://127.0.0.1:5000

5. Open another terminal and navigate into the frontend directory:

cd frontend

6. Install the frontend dependencies:

npm install

On Windows PowerShell systems where npm scripts are restricted, use:

npm.cmd install

7. Start the frontend:

npm run dev

Or, if necessary on Windows PowerShell:

npm.cmd run dev

8. Open the local URL displayed by Vite, normally:

http://localhost:5173

FEATURES

* Create and delete image collections
* Search for images using the Pixabay API
* Save images to specific collections
* Add images directly using an image URL
* Edit captions on saved images
* Delete saved images
* Persistent storage using SQLite
* Individual collection pages
* Unique, view-only collection sharing links
* Responsive collection and image gallery layouts

REFLECTION

This challenge was my first experience building a full-stack web application. 
I learned how a React frontend communicates with a Flask REST API and how to 
persist application data with SQLite. I also learned about HTTP methods, 
external APIs, environment variables, component state, and organizing a larger project. 
The most challenging part was understanding how the frontend, backend, and database fit 
together, but building each piece incrementally made those relationships much clearer.

FEEDBACK

I appreciated that the challenge allowed flexibility in the technologies used 
and encouraged learning unfamiliar tools. The project was challenging as someone 
new to web development, but it provided a useful introduction to how the different 
parts of a full-stack application work together.
