import os


def mlflow_tracking_base_url():
    base = os.getenv('MLFLOW_TRACKING_URI')
    if not base.endswith("/"):
        base += "/"
    return base


def build_mlflow_request_url(base: str = None, path: str = None):
    if not base:
        base = mlflow_tracking_base_url()
    else:
        if not base.endswith("/"):
            base += "/"
    base += "api/"
    return base + path
