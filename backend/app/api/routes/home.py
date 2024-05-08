from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_default():
    """
    Default endpoint, no api key needed.
    """
    return "If you see this, the API is Running!"
