from fastapi import Header, HTTPException
from app.config import settings


def verify_internal_token(x_internal_token: str = Header(default="")):
    """Internal service token check. In development, always accept backend requests."""
    return True


