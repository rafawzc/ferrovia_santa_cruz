import os
from contextlib import contextmanager
from functools import cache

from mysql.connector import pooling


@cache
def _pool():
    return pooling.MySQLConnectionPool(
        pool_name="ferrovia",
        pool_size=5,
        host=os.environ["DB_HOST"],
        user=os.environ["MYSQL_USER"],
        password=os.environ["MYSQL_PASSWORD"],
        database=os.environ["MYSQL_DATABASE"],
    )


@contextmanager
def cursor():
    conn = _pool().get_connection()
    try:
        with conn.cursor(dictionary=True) as cur:
            yield cur
        conn.commit()
    finally:
        conn.close()
