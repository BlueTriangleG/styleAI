"""
Gunicorn configuration file with memory optimization
"""
import multiprocessing
import os

# Bind to all interfaces
bind = "0.0.0.0:5001"

# Worker optimization
workers = 1
threads = 2
worker_class = "gthread"

# Prevent memory leaks
max_requests = 250
max_requests_jitter = 50

# Timeouts
timeout = 240
graceful_timeout = 60
keepalive = 5

# Optimize for memory usage
preload_app = False  # Don't preload the app to save memory

# Log settings
loglevel = "info"
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr

# Memory optimization function called when worker starts
def on_starting(server):
    print("Starting Gunicorn server with memory optimization")

# Post-fork cleanup
def post_fork(server, worker):
    # Import gc module
    import gc
    # Enable garbage collection
    gc.collect()

    # Reduce memory usage with torch
    try:
        import torch
        if not os.environ.get('TORCH_ALREADY_CONFIGURED'):
            # Free unused cached memory in PyTorch
            if hasattr(torch, 'cuda') and hasattr(torch.cuda, 'empty_cache'):
                torch.cuda.empty_cache()
            # Disable gradient calculation for inference
            torch.set_grad_enabled(False)
            # Mark as configured
            os.environ['TORCH_ALREADY_CONFIGURED'] = '1'
    except ImportError:
        pass

# Release memory between requests
def pre_request(worker, req):
    import gc
    gc.collect() 