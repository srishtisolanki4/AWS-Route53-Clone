from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, unique=True, nullable=False, index=True)

    zone_type = Column(
        String,
        nullable=False,
        default="Public"
    )

    description = Column(
        String,
        nullable=True
    )

    private_zone = Column(
        Boolean,
        default=False
    )

    record_count = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(Integer, primary_key=True, index=True)

    zone_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    record_type = Column(
        String,
        nullable=False
    )

    ttl = Column(
        Integer,
        nullable=False,
        default=300
    )

    value = Column(
        String,
        nullable=False
    )

    routing_policy = Column(
        String,
        nullable=True,
        default="Simple"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )