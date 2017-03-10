from election_api import app, settings

if __name__ == '__main__':
    app.run(
        host = '0.0.0.0',
        port = settings.get('PORT', 8080),
        debug = settings.get('DEBUG', True)
    )
