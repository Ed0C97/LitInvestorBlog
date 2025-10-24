"""
Performance Analysis Script
Analizza e riporta metriche di performance del backend
"""
import time
import functools
from flask import request, g
from sqlalchemy import event
from sqlalchemy.engine import Engine


class PerformanceMonitor:
    """Monitor per tracciare performance delle richieste"""
    
    def __init__(self, app=None):
        self.slow_queries = []
        self.slow_requests = []
        self.query_count_per_request = {}
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Inizializza monitoring su Flask app"""
        
        # Track request timing
        @app.before_request
        def before_request():
            g.start_time = time.time()
            g.query_count = 0
            g.queries = []
        
        @app.after_request
        def after_request(response):
            if hasattr(g, 'start_time'):
                elapsed = time.time() - g.start_time
                
                # Log slow requests (>1 secondo)
                if elapsed > 1.0:
                    self.slow_requests.append({
                        'endpoint': request.endpoint,
                        'method': request.method,
                        'path': request.path,
                        'duration': elapsed,
                        'query_count': getattr(g, 'query_count', 0)
                    })
                    
                    app.logger.warning(
                        f"Slow request: {request.method} {request.path} "
                        f"took {elapsed:.2f}s with {g.query_count} queries"
                    )
                
                # Aggiungi header con metriche (solo in development)
                if app.debug:
                    response.headers['X-Request-Time'] = f"{elapsed:.4f}"
                    response.headers['X-Query-Count'] = str(getattr(g, 'query_count', 0))
            
            return response
        
        # Track SQL queries
        @event.listens_for(Engine, "before_cursor_execute")
        def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            conn.info.setdefault('query_start_time', []).append(time.time())
            
        @event.listens_for(Engine, "after_cursor_execute")
        def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            total_time = time.time() - conn.info['query_start_time'].pop()
            
            # Conta query per request
            if hasattr(g, 'query_count'):
                g.query_count += 1
                g.queries.append({
                    'statement': statement[:200],
                    'duration': total_time
                })
            
            # Log slow queries (>100ms)
            if total_time > 0.1:
                self.slow_queries.append({
                    'statement': statement,
                    'duration': total_time,
                    'endpoint': getattr(request, 'endpoint', 'unknown')
                })
                
                if app.debug:
                    app.logger.warning(
                        f"Slow query ({total_time:.4f}s): {statement[:100]}..."
                    )
    
    def get_report(self):
        """Genera report di performance"""
        return {
            'slow_queries': len(self.slow_queries),
            'slow_requests': len(self.slow_requests),
            'slowest_queries': sorted(
                self.slow_queries,
                key=lambda x: x['duration'],
                reverse=True
            )[:10],
            'slowest_requests': sorted(
                self.slow_requests,
                key=lambda x: x['duration'],
                reverse=True
            )[:10]
        }
    
    def reset(self):
        """Reset counters"""
        self.slow_queries = []
        self.slow_requests = []


def timing_decorator(f):
    """
    Decorator per misurare tempo di esecuzione di una funzione
    
    Usage:
        @timing_decorator
        def my_slow_function():
            pass
    """
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = f(*args, **kwargs)
        elapsed = time.time() - start
        
        if elapsed > 0.1:  # Log se > 100ms
            print(f"⏱️  {f.__name__} took {elapsed:.4f}s")
        
        return result
    return wrapper


# Esempio utilizzo in main.py:
"""
from src.utils.performance_monitor import PerformanceMonitor

# In create_app():
perf_monitor = PerformanceMonitor(app)

# Endpoint per vedere report (solo admin)
@app.route('/admin/performance')
@login_required
@require_admin
def performance_report():
    report = perf_monitor.get_report()
    return jsonify(report)
"""

# Esempio utilizzo decorator:
"""
from src.utils.performance_monitor import timing_decorator

@timing_decorator
def complex_calculation():
    # ... codice lento ...
    pass
"""
