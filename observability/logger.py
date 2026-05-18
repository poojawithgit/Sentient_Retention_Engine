import json
import os
import sys
from datetime import datetime

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
if not os.path.exists(LOG_DIR):
    try:
        os.makedirs(LOG_DIR, exist_ok=True)
    except Exception:
        pass

def format_log(level, message, service='agents', metadata=None):
    if metadata is None:
        metadata = {}
    log_data = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "level": level.upper(),
        "service": service,
        "message": message
    }
    log_data.update(metadata)
    return json.dumps(log_data)

class Logger:
    @staticmethod
    def info(message, service='agents', metadata=None):
        log = format_log('INFO', message, service, metadata)
        print(log, file=sys.stdout)
        try:
            with open(os.path.join(LOG_DIR, 'combined.log'), 'a', encoding='utf-8') as f:
                f.write(log + '\n')
        except Exception:
            pass

    @staticmethod
    def error(message, service='agents', metadata=None):
        log = format_log('ERROR', message, service, metadata)
        print(log, file=sys.stderr)
        try:
            with open(os.path.join(LOG_DIR, 'error.log'), 'a', encoding='utf-8') as f:
                f.write(log + '\n')
            with open(os.path.join(LOG_DIR, 'combined.log'), 'a', encoding='utf-8') as f:
                f.write(log + '\n')
        except Exception:
            pass

    @staticmethod
    def warn(message, service='agents', metadata=None):
        log = format_log('WARN', message, service, metadata)
        print(log, file=sys.stdout)
        try:
            with open(os.path.join(LOG_DIR, 'combined.log'), 'a', encoding='utf-8') as f:
                f.write(log + '\n')
        except Exception:
            pass

    @staticmethod
    def debug(message, service='agents', metadata=None):
        if os.environ.get('NODE_ENV') != 'production' and os.environ.get('PYTHON_ENV') != 'production':
            log = format_log('DEBUG', message, service, metadata)
            print(log, file=sys.stdout)
