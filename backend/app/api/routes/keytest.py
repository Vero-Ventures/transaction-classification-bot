from fastapi import APIRouter, Security, Depends
from api.dependencies import check_key

router = APIRouter()


@router.get("/keytest", dependencies=[Depends(check_key)])
async def get_keytest():
    """
    Endpoint to test if the API key is valid.
    """
    return "If you see this, your API key is valid!"
