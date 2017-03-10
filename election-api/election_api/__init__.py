from election_api import settings

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

static_folder = settings.get('STATIC_FOLDER')

app = Flask(__name__, static_folder = static_folder)
app.config.from_object(settings)
app.debug = app.config['DEBUG']
app.secret_key = app.config['SECRET_KEY']

CORS(app)

db = SQLAlchemy(app)

from election_api import routes
