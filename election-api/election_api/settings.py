from os import getenv

def get(name, default = None):
    return globals().get(name, default)

def bool_env(name, default = False):
    ret = getenv(name, default)

    if ret in ('false', 'False', '0'):
        return False

    return bool(ret)

def int_env(name, default = 0):
    return int(getenv(name, default))

def str_env(name, default = ''):
    return getenv(name, default)

DEBUG = bool_env('DEBUG', False)
PORT = int_env('PORT', 8080)
STATIC_FOLDER = str_env('STATIC_FOLDER', 'static')

SQLALCHEMY_DATABASE_URI = str_env('DATABASE_URL', 'mysql+pymysql://electiondbadmin:zxcv1234@election-db.ckblj4opolqt.us-east-1.rds.amazonaws.com:3306/election_db')

SECRET_KEY = str_env('SECRET_KEY', 'secret')
