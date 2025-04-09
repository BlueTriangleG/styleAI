from app import create_app
import os
import gc
import sys

# Set lower memory usage for libraries
os.environ['TF_MEMORY_ALLOCATION'] = '0.3'  # Use only 30% of memory for TensorFlow if used
os.environ['OMP_NUM_THREADS'] = '1'  # Limit OpenMP threads
os.environ['MKL_NUM_THREADS'] = '1'  # Limit MKL threads

# Run garbage collection
gc.collect()

# Create Flask application instance
app = create_app()

if __name__ == '__main__':
    # In production with uWSGI, this code won't run
    # For development without uWSGI, this will start the dev server
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=5001, debug=debug_mode) 