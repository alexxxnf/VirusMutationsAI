from typing import Any, List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import exc

from src.api import deps
from src.db import models

router = APIRouter()


@router.put("/subscriptions/{mutation}", response_model=str, status_code=status.HTTP_201_CREATED)
def subscribe_user_me(
    *,
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
    mutation: str
) -> Any:
    """
    Add a subscription to the subscriptions
    """
    subscr = models.Subscription(user_id=user.id, mutation=mutation)
    db.add(subscr)
    try:
        db.commit()
    except exc.IntegrityError as e:
        # The mutation already subscribed (expected case)
        pass
    return mutation


@router.get("/subscriptions", response_model=List[str])
def read_subscriptions_user_me(
    skip: int = 0,
    limit: int = 100,
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get subscription list
    """
    res = db.query(models.Subscription.mutation).filter(models.Subscription.user_id == user.id).slice(skip, limit).all()
    return [x[0] for x in res]


@router.delete("/subscriptions/{mutation}", response_model=str)
def unsubscribe_user_me(
    *,
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
    mutation: str
) -> Any:
    """
    Delete a subscription from the subscriptions
    """
    db.query(models.Subscription.mutation).filter(models.Subscription.user_id == user.id,
                                                  models.Subscription.mutation == mutation).delete()
    db.commit()
    return mutation
