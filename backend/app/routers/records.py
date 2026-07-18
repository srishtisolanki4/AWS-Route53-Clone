from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import DNSRecord, HostedZone
from ..schemas import (
    DNSRecordCreate,
    DNSRecordResponse,
    DNSRecordUpdate
)

router = APIRouter(
    prefix="/api",
    tags=["DNS Records"]
)


@router.get(
    "/zones/{zone_id}/records",
    response_model=list[DNSRecordResponse]
)
def get_records(
    zone_id: int,
    search: Optional[str] = Query(
        default=None
    ),
    record_type: Optional[str] = Query(
        default=None
    ),
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

    query = db.query(DNSRecord).filter(
        DNSRecord.zone_id == zone_id
    )

    if search:
        query = query.filter(
            DNSRecord.name.ilike(
                f"%{search}%"
            )
        )

    if record_type:
        query = query.filter(
            DNSRecord.record_type == record_type
        )

    return query.order_by(
        DNSRecord.created_at.desc()
    ).all()


@router.get(
    "/records/{record_id}",
    response_model=DNSRecordResponse
)
def get_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    record = db.query(DNSRecord).filter(
        DNSRecord.id == record_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail="DNS record not found"
        )

    return record


@router.post(
    "/zones/{zone_id}/records",
    response_model=DNSRecordResponse,
    status_code=201
)
def create_record(
    zone_id: int,
    request: DNSRecordCreate,
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

    allowed_types = [
        "A",
        "AAAA",
        "CNAME",
        "TXT",
        "MX",
        "NS",
        "PTR",
        "SRV",
        "CAA"
    ]

    if request.record_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid DNS record type"
        )

    record = DNSRecord(
        zone_id=zone_id,
        name=request.name,
        record_type=request.record_type,
        ttl=request.ttl,
        value=request.value,
        routing_policy=request.routing_policy
    )

    db.add(record)

    zone.record_count += 1

    db.commit()
    db.refresh(record)

    return record


@router.put(
    "/records/{record_id}",
    response_model=DNSRecordResponse
)
def update_record(
    record_id: int,
    request: DNSRecordUpdate,
    db: Session = Depends(get_db)
):
    record = db.query(DNSRecord).filter(
        DNSRecord.id == record_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail="DNS record not found"
        )

    update_data = request.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)

    return record


@router.delete(
    "/records/{record_id}"
)
def delete_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    record = db.query(DNSRecord).filter(
        DNSRecord.id == record_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail="DNS record not found"
        )

    zone = db.query(HostedZone).filter(
        HostedZone.id == record.zone_id
    ).first()

    if zone and zone.record_count > 0:
        zone.record_count -= 1

    db.delete(record)
    db.commit()

    return {
        "success": True,
        "message": "DNS record deleted successfully"
    }