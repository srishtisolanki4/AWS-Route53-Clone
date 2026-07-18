from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class HostedZoneCreate(BaseModel):
    name: str
    zone_type: str = "Public"
    description: Optional[str] = None
    private_zone: bool = False


class HostedZoneUpdate(BaseModel):
    name: Optional[str] = None
    zone_type: Optional[str] = None
    description: Optional[str] = None
    private_zone: Optional[bool] = None


class HostedZoneResponse(BaseModel):
    id: int
    name: str
    zone_type: str
    description: Optional[str]
    private_zone: bool
    record_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DNSRecordCreate(BaseModel):
    name: str
    record_type: str
    ttl: int = 300
    value: str
    routing_policy: Optional[str] = "Simple"


class DNSRecordUpdate(BaseModel):
    name: Optional[str] = None
    record_type: Optional[str] = None
    ttl: Optional[int] = None
    value: Optional[str] = None
    routing_policy: Optional[str] = None


class DNSRecordResponse(BaseModel):
    id: int
    zone_id: int
    name: str
    record_type: str
    ttl: int
    value: str
    routing_policy: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)