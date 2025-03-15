from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    """
    Create and configure the Flask application
    """
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Configure app
    app.config['JSON_AS_ASCII'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
    
    # Register blueprints
    from app.routes.image_processing import image_bp
    from app.routes.personalized import personalized_bp
    
    app.register_blueprint(image_bp)
    app.register_blueprint(personalized_bp)
    
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return jsonify({"status": "ok"})
    
    return app 