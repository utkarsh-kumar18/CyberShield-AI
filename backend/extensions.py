"""Process-wide Flask extensions initialized by the app factory."""

import os

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["300 per hour"],
    storage_uri=os.getenv("CYBERSHIELD_RATE_LIMIT_STORAGE_URI", "memory://"),
    headers_enabled=True,
)
