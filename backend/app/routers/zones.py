from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import HostedZone
from ..schemas import (
    HostedZoneCreate,
    HostedZoneResponse,
    HostedZoneUpdate
)

router = APIRouter(
    prefix="/api/zones",
    tags=["Hosted Zones"]
)


@router.get(
    "",
    response_model=list[HostedZoneResponse]
)
def get_zones(
    search: Optional[str] = Query(
        default=None
    ),
    db: Session = Depends(get_db)
):
    query = db.query(HostedZone)

    if search:
        query = query.filter(
            HostedZone.name.ilike(
                f"%{search}%"
            )
        )

    return query.order_by(
        HostedZone.created_at.desc()
    ).all()


@router.get(
    "/{zone_id}",
    response_model=HostedZoneResponse
)
def get_zone(
    zone_id: int,
    db: Session = Depends(get_db)
):
    zone = db.query(HostedZone).filter(
        HostedZone.id == zone_id
    ).first()

    if not zone:
        raise HTTPException(
            status_code=404,
            detail="Hosted zone not found"
        )

    return zone


@router.post(
    "",
    response_model=HostedZoneResponse,
    status_code=201
)
def create_zone(
    request: HostedZoneCreate,
    db: Session = Depends(get_db)
):
    existing_zone = db.query(HostedZone).filter(
        HostedZone.name == request.name
    ).first()

    if existing_zone:
        raise HTTPException(
            status_code=400,
            detail="Hosted zone already exists"
        )

    zone = HostedZone(
        name=request.name,
        zone_type=request.zone_type,
        description=request.description,
        private_zone=request.private_zone,
        record_count=0
    )

    db.add(zone)
    db.commit()
    db.refresh(zone)

    return zone


@router.put(
    "/{zone_id}",
    response_model=HostedZoneResponse
)
def update_zone(
    zone_id: int,
    request: HostedZoneUpdate,
    db: Session = Depends(get_db)
):
    zone = db.query(HostedZone).filter(
        HostedZone.id == zone_id
    ).first()

    if not zone:
        raise HTTPException(
            status_code=404,
            detail="Hosted zone not found"
        )

    update_data = request.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(zone, key, value)

    db.commit()
    db.refresh(zone)

    return zone


@router.delete(
    "/{zone_id}"
)
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db)
):
    zone = db.query(HostedZone).filter(
        HostedZone.id == zone_id
    ).first()

    if not zone:
        raise HTTPException(
            status_code=404,
            detail="Hosted zone not found"
        )

    db.delete(zone)
    db.commit()

    return {
        "success": True,
        "message": "Hosted zone deleted successfully"
    }