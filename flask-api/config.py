import os

DATABASE_URL = "postgresql://test_owner:npg_riaEfFBXn19H@ep-snowy-bar-a7w4sdqq-pooler.ap-southeast-2.aws.neon.tech/test?sslmode=require"

class Config:
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
