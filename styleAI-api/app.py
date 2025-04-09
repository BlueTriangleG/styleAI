from app import create_app
import os

# Create Flask application instance
app = create_app()

if __name__ == '__main__':
    # In production with uWSGI, this code won't run
    # For development without uWSGI, this will start the dev server
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=5001, debug=debug_mode) 