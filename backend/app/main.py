from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine
from .models import User
from .routers import auth, zones, records

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Route53 Clone API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(zones.router)
app.include_router(records.router)


def create_default_user():
    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == "admin@route53.local"
    ).first()

    if not existing_user:
        user = User(
            email="admin@route53.local",
            password="admin123"
        )

        db.add(user)
        db.commit()

    db.close()


create_default_user()


@app.get("/")
def root():
    return {
        "message": "Route53 Clone API is running"
    }